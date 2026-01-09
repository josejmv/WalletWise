import { prisma } from "@/lib/prisma";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "./types";

export async function findAll(filters?: ExpenseFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.accountId) {
    where.accountId = filters.accountId;
  }
  if (filters?.currencyId) {
    where.currencyId = filters.currencyId;
  }
  if (filters?.isRecurring !== undefined) {
    where.isRecurring = filters.isRecurring;
  }
  if (filters?.startDate || filters?.endDate) {
    where.date = {
      ...(filters?.startDate && { gte: filters.startDate }),
      ...(filters?.endDate && { lte: filters.endDate }),
    };
  }

  return prisma.expense.findMany({
    where,
    include: {
      category: true,
      account: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: {
      category: true,
      account: true,
      currency: true,
    },
  });
}

export async function findByCategory(categoryId: string) {
  return prisma.expense.findMany({
    where: { categoryId },
    include: {
      category: true,
      account: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findByAccount(accountId: string) {
  return prisma.expense.findMany({
    where: { accountId },
    include: {
      category: true,
      account: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findRecurring() {
  return prisma.expense.findMany({
    where: { isRecurring: true },
    include: {
      category: true,
      account: true,
      currency: true,
    },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function findDueExpenses() {
  return prisma.expense.findMany({
    where: {
      isRecurring: true,
      nextDueDate: {
        lte: new Date(),
      },
    },
    include: {
      category: true,
      account: true,
      currency: true,
    },
  });
}

export async function create(data: CreateExpenseInput) {
  return prisma.expense.create({
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
}

export async function update(id: string, data: UpdateExpenseInput) {
  return prisma.expense.update({
    where: { id },
    data,
    include: {
      category: true,
      account: true,
      currency: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.expense.delete({
    where: { id },
  });
}

export async function getSummary(filters?: ExpenseFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.startDate || filters?.endDate) {
    where.date = {
      ...(filters?.startDate && { gte: filters.startDate }),
      ...(filters?.endDate && { lte: filters.endDate }),
    };
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      category: true,
      currency: true,
    },
  });

  const byCategory = new Map<string, { categoryName: string; total: number }>();
  const byCurrency = new Map<string, { currencyCode: string; total: number }>();
  let totalAmount = 0;

  for (const expense of expenses) {
    const amount = Number(expense.amount);
    totalAmount += amount;

    const categoryData = byCategory.get(expense.categoryId) || {
      categoryName: expense.category.name,
      total: 0,
    };
    categoryData.total += amount;
    byCategory.set(expense.categoryId, categoryData);

    const currencyData = byCurrency.get(expense.currencyId) || {
      currencyCode: expense.currency.code,
      total: 0,
    };
    currencyData.total += amount;
    byCurrency.set(expense.currencyId, currencyData);
  }

  return {
    totalAmount,
    count: expenses.length,
    byCategory: Array.from(byCategory.entries()).map(([categoryId, data]) => ({
      categoryId,
      ...data,
    })),
    byCurrency: Array.from(byCurrency.entries()).map(([currencyId, data]) => ({
      currencyId,
      ...data,
    })),
  };
}
