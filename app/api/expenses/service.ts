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

  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        ...data,
        date: data.date ?? new Date(),
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
        balance: { decrement: data.amount },
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

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new Error("Categoría no encontrada");
    }
  }

  if (data.accountId) {
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });
    if (!account) {
      throw new Error("Cuenta no encontrada");
    }
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  return prisma.$transaction(async (tx) => {
    // Revert old amount to old account
    await tx.account.update({
      where: { id: existingExpense.accountId },
      data: {
        balance: { increment: Number(existingExpense.amount) },
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

    // Deduct new amount from new account
    await tx.account.update({
      where: { id: expense.accountId },
      data: {
        balance: { decrement: Number(expense.amount) },
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

  return prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: expense.accountId },
      data: {
        balance: { increment: Number(expense.amount) },
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

    // Deduct from account
    await tx.account.update({
      where: { id: expense.accountId },
      data: {
        balance: { decrement: Number(expense.amount) },
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
