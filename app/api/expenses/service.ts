import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "./types";
import type { PaginationParams } from "@/lib/pagination";

export async function getExpenses(filters?: ExpenseFilters) {
  return repository.findAll(filters);
}

export async function getExpensesPaginated(
  filters?: ExpenseFilters,
  pagination?: PaginationParams,
) {
  return repository.findAllPaginated(filters, pagination);
}

export async function getExpenseById(id: string) {
  const expense = await repository.findById(id);
  if (!expense) {
    throw new Error("Gasto no encontrado");
  }
  return expense;
}

export async function getExpensesByCategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new Error("Categoría no encontrada");
  }
  return repository.findByCategory(categoryId);
}

export async function getExpensesByAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }
  return repository.findByAccount(accountId);
}

export async function getRecurringExpenses() {
  return repository.findRecurring();
}

export async function getDueExpenses() {
  return repository.findDueExpenses();
}

export async function createExpense(data: CreateExpenseInput) {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  const account = await prisma.account.findUnique({
    where: { id: data.accountId },
    include: { currency: true },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  // Validate change account if specified
  let changeAccount = null;
  if (data.hasChange && data.changeAccountId) {
    changeAccount = await prisma.account.findUnique({
      where: { id: data.changeAccountId },
      include: { currency: true },
    });
    if (!changeAccount) {
      throw new Error("Cuenta de vuelto no encontrada");
    }
  }

  // Calculate the amount to deduct from account
  // If currencies differ, use exchange rate to convert
  let amountToDeduct = data.amount;
  if (data.currencyId !== account.currencyId) {
    // Use custom rate if available, otherwise use official rate
    const rate = data.customRate || data.officialRate;
    if (rate && rate > 0) {
      // The rate converts from expense currency to account currency
      amountToDeduct = data.amount * rate;
    }
  }

  return prisma.$transaction(async (tx) => {
    // Handle change (vuelto) system
    let changeTransferId: string | null = null;
    const changeAmount = data.changeAmount || 0;
    const effectiveChangeAccountId = data.changeAccountId || data.accountId;
    const changeGoesToSameAccount = effectiveChangeAccountId === data.accountId;
    // Change currency is always the currency of the change account
    const changeCurrencyId = changeAccount?.currencyId || account.currencyId;

    // Calculate change equivalent in expense account currency
    let changeInAccountCurrency = changeAmount;
    if (data.hasChange && changeAmount > 0 && changeCurrencyId !== account.currencyId) {
      // Try to find rate from change currency to account currency
      let rate: number | null = null;

      // First try: changeCurrency -> accountCurrency
      const directRate = await tx.exchangeRate.findFirst({
        where: {
          fromCurrencyId: changeCurrencyId,
          toCurrencyId: account.currencyId,
        },
        orderBy: { fetchedAt: "desc" },
      });

      if (directRate?.rate) {
        rate = Number(directRate.rate);
        changeInAccountCurrency = changeAmount * rate;
      } else {
        // Fallback: use inverse of accountCurrency -> changeCurrency
        const inverseRate = await tx.exchangeRate.findFirst({
          where: {
            fromCurrencyId: account.currencyId,
            toCurrencyId: changeCurrencyId,
          },
          orderBy: { fetchedAt: "desc" },
        });
        if (inverseRate?.rate && Number(inverseRate.rate) > 0) {
          rate = 1 / Number(inverseRate.rate);
          changeInAccountCurrency = changeAmount * rate;
        }
      }
    }

    // Create transfer for change if going to different account
    if (data.hasChange && changeAmount > 0 && !changeGoesToSameAccount) {
      // Calculate exchange rate from account currency to change currency
      // This allows the transfer service to correctly reverse the operation
      let accountToChangeRate: number | null = null;
      if (changeCurrencyId !== account.currencyId) {
        // Try direct rate: accountCurrency -> changeCurrency
        const directRate = await tx.exchangeRate.findFirst({
          where: {
            fromCurrencyId: account.currencyId,
            toCurrencyId: changeCurrencyId,
          },
          orderBy: { fetchedAt: "desc" },
        });
        if (directRate?.rate) {
          accountToChangeRate = Number(directRate.rate);
        } else {
          // Fallback: inverse of changeCurrency -> accountCurrency
          const inverseRate = await tx.exchangeRate.findFirst({
            where: {
              fromCurrencyId: changeCurrencyId,
              toCurrencyId: account.currencyId,
            },
            orderBy: { fetchedAt: "desc" },
          });
          if (inverseRate?.rate && Number(inverseRate.rate) > 0) {
            accountToChangeRate = 1 / Number(inverseRate.rate);
          }
        }
      }

      // Transfer stores amount in account currency (what leaves the account)
      // exchangeRate converts to change currency (what enters change account)
      const transfer = await tx.transfer.create({
        data: {
          type: "account_to_account",
          fromAccountId: data.accountId,
          toAccountId: effectiveChangeAccountId,
          amount: changeInAccountCurrency, // Amount in account currency (e.g., 3.27 USD)
          currencyId: account.currencyId, // Account currency
          exchangeRate: accountToChangeRate, // Rate to convert to change currency
          date: data.date ?? new Date(),
          description: `Vuelto de gasto: ${data.description || "Sin descripción"}`,
        },
      });
      changeTransferId = transfer.id;

      // Deduct equivalent from expense account (in account currency)
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: changeInAccountCurrency } },
      });

      // Add change amount to change account (in change account currency)
      await tx.account.update({
        where: { id: effectiveChangeAccountId },
        data: { balance: { increment: changeAmount } },
      });
    }

    // Calculate net amount to deduct from expense account
    // Always: net = expense - change equivalent
    // When different account: transfer handles moving the equivalent separately
    let netAmountToDeduct = amountToDeduct;
    if (data.hasChange && changeAmount > 0) {
      netAmountToDeduct = amountToDeduct - changeInAccountCurrency;
    }

    // Build description with change info
    let expenseDescription = data.description || "";
    if (data.hasChange && changeAmount > 0) {
      const changeAccountForDesc = changeAccount || account;
      const changeCurrencyForDesc = changeAccount?.currency || account.currency;
      const changeAccountName = changeGoesToSameAccount ? "misma cuenta" : changeAccountForDesc.name;
      expenseDescription = expenseDescription
        ? `${expenseDescription} | Vuelto: ${changeCurrencyForDesc.symbol}${changeAmount.toFixed(2)} a ${changeAccountName}`
        : `Vuelto: ${changeCurrencyForDesc.symbol}${changeAmount.toFixed(2)} a ${changeAccountName}`;
    }

    // Calculate the NET amount in expense currency
    // netAmountToDeduct is in account currency, convert back to expense currency if needed
    let netAmountInExpenseCurrency = data.amount;
    if (data.hasChange && changeAmount > 0) {
      // changeInAccountCurrency is the change equivalent in account currency
      // Convert it back to expense currency to get the net expense amount
      const rate = data.customRate || data.officialRate || 1;
      const changeInExpenseCurrency = rate > 0 ? changeInAccountCurrency / rate : changeInAccountCurrency;
      netAmountInExpenseCurrency = data.amount - changeInExpenseCurrency;
    }

    const expense = await tx.expense.create({
      data: {
        categoryId: data.categoryId,
        accountId: data.accountId,
        amount: netAmountInExpenseCurrency,
        currencyId: data.currencyId,
        officialRate: data.officialRate,
        customRate: data.customRate,
        isRecurring: data.isRecurring,
        periodicity: data.periodicity,
        nextDueDate: data.nextDueDate,
        date: data.date ?? new Date(),
        description: expenseDescription,
        hasChange: data.hasChange || false,
        changeAmount: data.hasChange ? changeAmount : null,
        changeCurrencyId: data.hasChange ? changeCurrencyId : null,
        changeAccountId: data.hasChange ? effectiveChangeAccountId : null,
        changeTransferId,
      },
      include: {
        category: true,
        account: true,
        currency: true,
      },
    });

    await tx.account.update({
      where: { id: data.accountId },
      data: {
        balance: { decrement: netAmountToDeduct },
      },
    });

    return expense;
  });
}

export async function updateExpense(id: string, data: UpdateExpenseInput) {
  const existingExpense = await repository.findById(id);
  if (!existingExpense) {
    throw new Error("Gasto no encontrado");
  }

  // Get old account to check currency
  const oldAccount = await prisma.account.findUnique({
    where: { id: existingExpense.accountId },
  });

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new Error("Categoría no encontrada");
    }
  }

  // Get new account if changed
  const newAccountId = data.accountId || existingExpense.accountId;
  const newAccount = await prisma.account.findUnique({
    where: { id: newAccountId },
  });
  if (!newAccount) {
    throw new Error("Cuenta no encontrada");
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  // Calculate old amount that was deducted (with conversion if currencies differed)
  let oldAmountDeducted = Number(existingExpense.amount);
  if (oldAccount && existingExpense.currencyId !== oldAccount.currencyId) {
    const oldRate =
      Number(existingExpense.customRate) ||
      Number(existingExpense.officialRate) ||
      1;
    oldAmountDeducted = Number(existingExpense.amount) * oldRate;
  }

  return prisma.$transaction(async (tx) => {
    // Revert old amount to old account (with conversion)
    await tx.account.update({
      where: { id: existingExpense.accountId },
      data: {
        balance: { increment: oldAmountDeducted },
      },
    });

    const expense = await tx.expense.update({
      where: { id },
      data,
      include: {
        category: true,
        account: true,
        currency: true,
      },
    });

    // Calculate new amount to deduct (with conversion if currencies differ)
    let newAmountToDeduct = Number(expense.amount);
    if (expense.currencyId !== newAccount.currencyId) {
      const newRate =
        Number(expense.customRate) || Number(expense.officialRate) || 1;
      newAmountToDeduct = Number(expense.amount) * newRate;
    }

    // Deduct new amount from new account
    await tx.account.update({
      where: { id: expense.accountId },
      data: {
        balance: { decrement: newAmountToDeduct },
      },
    });

    return expense;
  });
}

export async function deleteExpense(id: string) {
  const expense = await repository.findById(id);
  if (!expense) {
    throw new Error("Gasto no encontrado");
  }

  // Get account to check currency
  const account = await prisma.account.findUnique({
    where: { id: expense.accountId },
  });

  // Calculate amount that was deducted (with conversion if currencies differed)
  let amountToRestore = Number(expense.amount);
  if (account && expense.currencyId !== account.currencyId) {
    const rate =
      Number(expense.customRate) || Number(expense.officialRate) || 1;
    amountToRestore = Number(expense.amount) * rate;
  }

  return prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: expense.accountId },
      data: {
        balance: { increment: amountToRestore },
      },
    });

    return tx.expense.delete({ where: { id } });
  });
}

export async function getExpenseSummary(filters?: ExpenseFilters) {
  return repository.getSummary(filters);
}

function calculateNextDueDate(
  currentDate: Date,
  periodicity: "weekly" | "monthly" | "yearly",
): Date {
  const next = new Date(currentDate);
  switch (periodicity) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export async function processRecurringExpense(id: string) {
  const expense = await repository.findById(id);
  if (!expense) {
    throw new Error("Gasto no encontrado");
  }

  if (!expense.isRecurring || !expense.periodicity) {
    throw new Error("El gasto no es recurrente");
  }

  // Get account to check currency
  const account = await prisma.account.findUnique({
    where: { id: expense.accountId },
  });

  // Calculate amount to deduct (with conversion if currencies differ)
  let amountToDeduct = Number(expense.amount);
  if (account && expense.currencyId !== account.currencyId) {
    const rate =
      Number(expense.customRate) || Number(expense.officialRate) || 1;
    amountToDeduct = Number(expense.amount) * rate;
  }

  return prisma.$transaction(async (tx) => {
    // Create new expense entry
    const newExpense = await tx.expense.create({
      data: {
        categoryId: expense.categoryId,
        accountId: expense.accountId,
        amount: expense.amount,
        currencyId: expense.currencyId,
        officialRate: expense.officialRate,
        customRate: expense.customRate,
        isRecurring: false,
        date: new Date(),
        description: expense.description,
      },
      include: {
        category: true,
        account: true,
        currency: true,
      },
    });

    // Deduct from account (with conversion)
    await tx.account.update({
      where: { id: expense.accountId },
      data: {
        balance: { decrement: amountToDeduct },
      },
    });

    // Update next due date on recurring expense
    await tx.expense.update({
      where: { id },
      data: {
        nextDueDate: calculateNextDueDate(new Date(), expense.periodicity!),
      },
    });

    return newExpense;
  });
}
