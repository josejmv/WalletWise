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

function buildWhereClause(filters?: IncomeFilters) {
  const where: Record<string, unknown> = {};

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

export async function findById(id: string) {
  return prisma.income.findUnique({
    where: { id },
    include: {
      job: true,
      account: true,
      currency: true,
    },
  });
}

export async function findByJob(jobId: string) {
  return prisma.income.findMany({
    where: { jobId },
    include: {
      job: true,
      account: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findByAccount(accountId: string) {
  return prisma.income.findMany({
    where: { accountId },
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
      ...data,
      date: data.date ?? new Date(),
    },
    include: {
      job: true,
      account: true,
      currency: true,
    },
  });
}

export async function update(id: string, data: UpdateIncomeInput) {
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

export async function remove(id: string) {
  return prisma.income.delete({
    where: { id },
  });
}

export async function getSummary(filters?: IncomeFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.startDate || filters?.endDate) {
    where.date = {
      ...(filters?.startDate && { gte: filters.startDate }),
      ...(filters?.endDate && { lte: filters.endDate }),
    };
  }

  // Get user's base currency for conversion
  const baseCurrencyId = await getUserBaseCurrencyId();

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
