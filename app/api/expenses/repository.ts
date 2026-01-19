import { prisma } from "@/lib/prisma";
import {
  getUserBaseCurrencyId,
  convertManyWithCustomRates,
} from "@/lib/currency-utils";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "./types";
import type { PaginationParams } from "@/lib/pagination";

// Helper to build userId filter for transition period
function buildUserFilter(userId: string | null | undefined) {
  if (userId === undefined) {
    return {}; // No filter - return all (legacy mode)
  }
  if (userId === null) {
    return { userId: null }; // Only legacy data
  }
  // Include both user's data and legacy data (userId = null)
  return {
    OR: [{ userId }, { userId: null }],
  };
}

function buildWhereClause(filters?: ExpenseFilters) {
  const where: Record<string, unknown> = {};

  // Multi-user: filter by userId
  if (filters?.userId !== undefined) {
    Object.assign(where, buildUserFilter(filters.userId));
  }

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

  return where;
}

export async function findAll(filters?: ExpenseFilters) {
  const where = buildWhereClause(filters);

  return prisma.expense.findMany({
    where,
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findAllPaginated(
  filters?: ExpenseFilters,
  pagination?: PaginationParams,
) {
  const where = buildWhereClause(filters);
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const skip = (page - 1) * limit;

  const sortBy = pagination?.sortBy || "date";
  const sortOrder = pagination?.sortOrder || "desc";

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        category: { include: { parent: true } },
        account: { include: { currency: true } },
        currency: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findById(id: string, userId?: string | null) {
  const where: Record<string, unknown> = { id };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.expense.findFirst({
    where,
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
  });
}

export async function findByCategory(categoryId: string, userId?: string | null) {
  const where: Record<string, unknown> = { categoryId };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.expense.findMany({
    where,
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findByAccount(accountId: string, userId?: string | null) {
  const where: Record<string, unknown> = { accountId };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.expense.findMany({
    where,
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findRecurring(userId?: string | null) {
  const where: Record<string, unknown> = { isRecurring: true };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.expense.findMany({
    where,
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function findDueExpenses(userId?: string | null) {
  // Show recurring expenses due in the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const where: Record<string, unknown> = {
    isRecurring: true,
    nextDueDate: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.expense.findMany({
    where,
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function create(data: CreateExpenseInput) {
  return prisma.expense.create({
    data: {
      userId: data.userId,
      categoryId: data.categoryId,
      accountId: data.accountId,
      amount: data.amount,
      currencyId: data.currencyId,
      officialRate: data.officialRate,
      customRate: data.customRate,
      isRecurring: data.isRecurring,
      periodicity: data.periodicity,
      nextDueDate: data.nextDueDate,
      date: data.date ?? new Date(),
      description: data.description,
      hasChange: data.hasChange,
      changeAmount: data.changeAmount,
      changeAccountId: data.changeAccountId,
      changeCurrencyId: data.changeCurrencyId,
    },
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
  });
}

export async function update(id: string, data: UpdateExpenseInput, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Gasto no encontrado o no tienes permiso");
  }

  return prisma.expense.update({
    where: { id },
    data,
    include: {
      category: { include: { parent: true } },
      account: { include: { currency: true } },
      currency: true,
    },
  });
}

export async function remove(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Gasto no encontrado o no tienes permiso");
  }

  return prisma.expense.delete({
    where: { id },
  });
}

export async function getSummary(filters?: ExpenseFilters) {
  const where: Record<string, unknown> = {};

  // Multi-user: filter by userId
  if (filters?.userId !== undefined) {
    Object.assign(where, buildUserFilter(filters.userId));
  }

  if (filters?.startDate || filters?.endDate) {
    where.date = {
      ...(filters?.startDate && { gte: filters.startDate }),
      ...(filters?.endDate && { lte: filters.endDate }),
    };
  }

  // Get user's base currency for conversion
  const baseCurrencyId = await getUserBaseCurrencyId(filters?.userId);

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      category: true,
      currency: true,
    },
  });

  // Convert all expenses to base currency using custom rates when available
  const expensesForConversion = expenses.map((e) => ({
    id: e.id,
    amount: Number(e.amount),
    currencyId: e.currencyId,
    customRate: e.customRate ? Number(e.customRate) : null,
    categoryId: e.categoryId,
    categoryName: e.category.name,
    currencyCode: e.currency.code,
  }));

  const convertedExpenses = await convertManyWithCustomRates(
    expensesForConversion,
    baseCurrencyId,
  );

  const byCategory = new Map<string, { categoryName: string; total: number }>();
  const byCurrency = new Map<string, { currencyCode: string; total: number }>();
  let totalAmount = 0;

  for (const expense of convertedExpenses) {
    // Use converted amount for totals
    const convertedAmount = expense.convertedAmount;
    const originalAmount = expense.amount;

    totalAmount += convertedAmount;

    const categoryData = byCategory.get(expense.categoryId) || {
      categoryName: expense.categoryName,
      total: 0,
    };
    categoryData.total += convertedAmount;
    byCategory.set(expense.categoryId, categoryData);

    // For byCurrency, keep original amounts per currency
    const currencyData = byCurrency.get(expense.currencyId) || {
      currencyCode: expense.currencyCode,
      total: 0,
    };
    currencyData.total += originalAmount;
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
