import { prisma } from "@/lib/prisma";
import type {
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeFilters,
} from "./types";

export async function findAll(filters?: IncomeFilters) {
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

  const incomes = await prisma.income.findMany({
    where,
    include: {
      job: true,
      currency: true,
    },
  });

  const byJob = new Map<string, { jobName: string; total: number }>();
  const byCurrency = new Map<string, { currencyCode: string; total: number }>();
  let totalAmount = 0;

  for (const income of incomes) {
    const amount = Number(income.amount);
    totalAmount += amount;

    const jobData = byJob.get(income.jobId) || {
      jobName: income.job.name,
      total: 0,
    };
    jobData.total += amount;
    byJob.set(income.jobId, jobData);

    const currencyData = byCurrency.get(income.currencyId) || {
      currencyCode: income.currency.code,
      total: 0,
    };
    currencyData.total += amount;
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
