import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeFilters,
} from "./types";
import type { PaginationParams } from "@/lib/pagination";

export async function getIncomes(filters?: IncomeFilters) {
  return repository.findAll(filters);
}

export async function getIncomesPaginated(
  filters?: IncomeFilters,
  pagination?: PaginationParams,
) {
  return repository.findAllPaginated(filters, pagination);
}

export async function getIncomeById(id: string) {
  const income = await repository.findById(id);
  if (!income) {
    throw new Error("Ingreso no encontrado");
  }
  return income;
}

export async function getIncomesByJob(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error("Trabajo no encontrado");
  }
  return repository.findByJob(jobId);
}

export async function getIncomesByAccount(accountId: string) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }
  return repository.findByAccount(accountId);
}

export async function createIncome(data: CreateIncomeInput) {
  // Only validate job if jobId is provided (optional for "Ingreso Extra")
  if (data.jobId) {
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    if (!job) {
      throw new Error("Trabajo no encontrado");
    }
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

  // Calculate the amount to add to account
  // If currencies differ, use exchange rate to convert
  let amountToAdd = data.amount;
  if (data.currencyId !== account.currencyId) {
    // Use custom rate if available, otherwise use official rate
    const rate = data.customRate || data.officialRate;
    if (rate && rate > 0) {
      // The rate converts from income currency to account currency
      amountToAdd = data.amount * rate;
    }
  }

  return prisma.$transaction(async (tx) => {
    // Handle change (vuelto) system for incomes
    // For incomes: you receive payment and give change back from another account
    let changeTransferId: string | null = null;
    const changeAmount = data.changeAmount || 0;
    const effectiveChangeAccountId = data.changeAccountId || data.accountId;
    const changeFromSameAccount = effectiveChangeAccountId === data.accountId;
    // Change currency is always the currency of the change account
    const changeCurrencyId = changeAccount?.currencyId || account.currencyId;

    // Calculate change equivalent in income account currency
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

    // Create transfer for change if coming from a different account
    if (data.hasChange && changeAmount > 0 && !changeFromSameAccount) {
      // Calculate exchange rate from income account currency to change currency
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

      // Transfer: change account gives change, income account receives equivalent
      // amount = equivalent in income account currency
      // exchangeRate = converts to change currency for reversal
      const transfer = await tx.transfer.create({
        data: {
          type: "account_to_account",
          fromAccountId: effectiveChangeAccountId,
          toAccountId: data.accountId,
          amount: changeInAccountCurrency, // Equivalent in income account currency
          currencyId: account.currencyId, // Income account currency
          exchangeRate: accountToChangeRate, // Rate to convert to change currency
          date: data.date ?? new Date(),
          description: `Vuelto dado de ingreso: ${data.description || "Sin descripción"}`,
        },
      });
      changeTransferId = transfer.id;

      // Deduct change from change source account (in change currency)
      await tx.account.update({
        where: { id: effectiveChangeAccountId },
        data: { balance: { decrement: changeAmount } },
      });

      // Add equivalent to income account (in account currency)
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: changeInAccountCurrency } },
      });
    }

    // Calculate net amount to add to income account
    // Always subtract change equivalent: neto = ingreso - equivalente del vuelto dado
    let netAmountToAdd = amountToAdd;
    if (data.hasChange && changeAmount > 0) {
      netAmountToAdd = amountToAdd - changeInAccountCurrency;
    }

    // Build description with change info
    let incomeDescription = data.description || "";
    if (data.hasChange && changeAmount > 0) {
      const changeAccountForDesc = changeAccount || account;
      const changeCurrencyForDesc = changeAccount?.currency || account.currency;
      const changeAccountName = changeFromSameAccount ? "misma cuenta" : changeAccountForDesc.name;
      incomeDescription = incomeDescription
        ? `${incomeDescription} | Vuelto: ${changeCurrencyForDesc.symbol}${changeAmount.toFixed(2)} de ${changeAccountName}`
        : `Vuelto: ${changeCurrencyForDesc.symbol}${changeAmount.toFixed(2)} de ${changeAccountName}`;
    }

    // Calculate the NET amount in income currency
    let netAmountInIncomeCurrency = data.amount;
    if (data.hasChange && changeAmount > 0) {
      const rate = data.customRate || data.officialRate || 1;
      const changeInIncomeCurrency = rate > 0 ? changeInAccountCurrency / rate : changeInAccountCurrency;
      netAmountInIncomeCurrency = data.amount - changeInIncomeCurrency;
    }

    const income = await tx.income.create({
      data: {
        jobId: data.jobId,
        accountId: data.accountId,
        amount: netAmountInIncomeCurrency,
        currencyId: data.currencyId,
        officialRate: data.officialRate,
        customRate: data.customRate,
        date: data.date ?? new Date(),
        description: incomeDescription,
        hasChange: data.hasChange || false,
        changeAmount: data.hasChange ? changeAmount : null,
        changeCurrencyId: data.hasChange ? changeCurrencyId : null,
        changeAccountId: data.hasChange ? effectiveChangeAccountId : null,
        changeTransferId,
      },
      include: {
        job: true,
        account: true,
        currency: true,
      },
    });

    await tx.account.update({
      where: { id: data.accountId },
      data: {
        balance: { increment: netAmountToAdd },
      },
    });

    return income;
  });
}

export async function updateIncome(id: string, data: UpdateIncomeInput) {
  const existingIncome = await repository.findById(id);
  if (!existingIncome) {
    throw new Error("Ingreso no encontrado");
  }

  // Get old account to check currency
  const oldAccount = await prisma.account.findUnique({
    where: { id: existingIncome.accountId },
  });

  if (data.jobId) {
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    if (!job) {
      throw new Error("Trabajo no encontrado");
    }
  }

  // Get new account if changed
  const newAccountId = data.accountId || existingIncome.accountId;
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

  // Calculate old amount that was added (with conversion if currencies differed)
  let oldAmountAdded = Number(existingIncome.amount);
  if (oldAccount && existingIncome.currencyId !== oldAccount.currencyId) {
    const oldRate =
      Number(existingIncome.customRate) ||
      Number(existingIncome.officialRate) ||
      1;
    oldAmountAdded = Number(existingIncome.amount) * oldRate;
  }

  return prisma.$transaction(async (tx) => {
    // Revert old amount from old account (with conversion)
    await tx.account.update({
      where: { id: existingIncome.accountId },
      data: {
        balance: { decrement: oldAmountAdded },
      },
    });

    const income = await tx.income.update({
      where: { id },
      data,
      include: {
        job: true,
        account: true,
        currency: true,
      },
    });

    // Calculate new amount to add (with conversion if currencies differ)
    let newAmountToAdd = Number(income.amount);
    if (income.currencyId !== newAccount.currencyId) {
      const newRate =
        Number(income.customRate) || Number(income.officialRate) || 1;
      newAmountToAdd = Number(income.amount) * newRate;
    }

    // Add new amount to new account
    await tx.account.update({
      where: { id: income.accountId },
      data: {
        balance: { increment: newAmountToAdd },
      },
    });

    return income;
  });
}

export async function deleteIncome(id: string) {
  const income = await repository.findById(id);
  if (!income) {
    throw new Error("Ingreso no encontrado");
  }

  // Get account to check currency
  const account = await prisma.account.findUnique({
    where: { id: income.accountId },
  });

  // Calculate amount that was added (with conversion if currencies differed)
  let amountToRevert = Number(income.amount);
  if (account && income.currencyId !== account.currencyId) {
    const rate = Number(income.customRate) || Number(income.officialRate) || 1;
    amountToRevert = Number(income.amount) * rate;
  }

  return prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: income.accountId },
      data: {
        balance: { decrement: amountToRevert },
      },
    });

    return tx.income.delete({ where: { id } });
  });
}

export async function getIncomeSummary(filters?: IncomeFilters) {
  return repository.getSummary(filters);
}

export async function generateIncomeFromJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { account: true, currency: true },
  });

  if (!job) {
    throw new Error("Trabajo no encontrado");
  }

  if (job.status !== "active") {
    throw new Error("El trabajo no está activo");
  }

  return createIncome({
    jobId: job.id,
    accountId: job.accountId,
    amount: Number(job.salary),
    currencyId: job.currencyId,
    description: `Pago de ${job.name}`,
  });
}
