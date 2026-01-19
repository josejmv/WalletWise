import { prisma } from "@/lib/prisma";
import {
  getUserBaseCurrencyId,
  convertManyWithCustomRates,
} from "@/lib/currency-utils";
import type {
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeFilters,
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

function buildWhereClause(filters?: IncomeFilters) {
  const where: Record<string, unknown> = {};

  // Multi-user: filter by userId
  if (filters?.userId !== undefined) {
    Object.assign(where, buildUserFilter(filters.userId));
  }

  if (filters?.jobId) {
    where.jobId = filters.jobId;
  }
  if (filters?.accountId) {
    where.accountId = filters.accountId;
  }
  if (filters?.currencyId) {
    where.currencyId = filters.currencyId;
  }
  if (filters?.startDate || filters?.endDate) {
    where.date = {
      ...(filters?.startDate && { gte: filters.startDate }),
      ...(filters?.endDate && { lte: filters.endDate }),
    };
  }

  return where;
}

export async function findAll(filters?: IncomeFilters) {
  const where = buildWhereClause(filters);

  return prisma.income.findMany({
    where,
    include: {
      job: true,
      account: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findAllPaginated(
  filters?: IncomeFilters,
  pagination?: PaginationParams,
) {
  const where = buildWhereClause(filters);
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const skip = (page - 1) * limit;

  const sortBy = pagination?.sortBy || "date";
  const sortOrder = pagination?.sortOrder || "desc";

  const [data, total] = await Promise.all([
    prisma.income.findMany({
      where,
      include: {
        job: true,
        account: true,
        currency: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.income.count({ where }),
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

  return prisma.income.findFirst({
    where,
    include: {
      job: true,
      account: true,
      currency: true,
    },
  });
}

export async function findByJob(jobId: string, userId?: string | null) {
  const where: Record<string, unknown> = { jobId };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.income.findMany({
    where,
    include: {
      job: true,
      account: true,
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

  return prisma.income.findMany({
    where,
    include: {
      job: true,
      account: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function create(data: CreateIncomeInput) {
  return prisma.income.create({
    data: {
      userId: data.userId,
      jobId: data.jobId,
      accountId: data.accountId,
      amount: data.amount,
      currencyId: data.currencyId,
      officialRate: data.officialRate,
      customRate: data.customRate,
      date: data.date ?? new Date(),
      description: data.description,
      hasChange: data.hasChange,
      changeAmount: data.changeAmount,
      changeAccountId: data.changeAccountId,
      changeCurrencyId: data.changeCurrencyId,
    },
    include: {
      job: true,
      account: true,
      currency: true,
    },
  });
}

export async function update(id: string, data: UpdateIncomeInput, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Ingreso no encontrado o no tienes permiso");
  }

  return prisma.income.update({
    where: { id },
    data,
    include: {
      job: true,
      account: true,
      currency: true,
    },
  });
}

export async function remove(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Ingreso no encontrado o no tienes permiso");
  }

  return prisma.income.delete({
    where: { id },
  });
}

export async function getSummary(filters?: IncomeFilters) {
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

  const incomes = await prisma.income.findMany({
    where,
    include: {
      job: true,
      currency: true,
    },
  });

  // Convert all incomes to base currency using custom rates when available
  const incomesForConversion = incomes.map((i) => ({
    id: i.id,
    amount: Number(i.amount),
    currencyId: i.currencyId,
    customRate: i.customRate ? Number(i.customRate) : null,
    jobId: i.jobId,
    // job can be null for "Ingreso Extra"
    jobName: i.job?.name ?? "Ingreso Extra",
    currencyCode: i.currency.code,
  }));

  const convertedIncomes = await convertManyWithCustomRates(
    incomesForConversion,
    baseCurrencyId,
  );

  const byJob = new Map<string, { jobName: string; total: number }>();
  const byCurrency = new Map<string, { currencyCode: string; total: number }>();
  let totalAmount = 0;

  for (const income of convertedIncomes) {
    // Use converted amount for totals
    const convertedAmount = income.convertedAmount;
    const originalAmount = income.amount;

    totalAmount += convertedAmount;

    // Use "extra" as key for incomes without job
    const jobKey = income.jobId ?? "extra";
    const jobData = byJob.get(jobKey) || {
      jobName: income.jobName,
      total: 0,
    };
    jobData.total += convertedAmount;
    byJob.set(jobKey, jobData);

    // For byCurrency, keep original amounts per currency
    const currencyData = byCurrency.get(income.currencyId) || {
      currencyCode: income.currencyCode,
      total: 0,
    };
    currencyData.total += originalAmount;
    byCurrency.set(income.currencyId, currencyData);
  }

  return {
    totalAmount,
    count: incomes.length,
    byJob: Array.from(byJob.entries()).map(([jobId, data]) => ({
      jobId,
      ...data,
    })),
    byCurrency: Array.from(byCurrency.entries()).map(([currencyId, data]) => ({
      currencyId,
      ...data,
    })),
  };
}
