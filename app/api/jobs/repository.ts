import { prisma } from "@/lib/prisma";
import type { CreateJobInput, UpdateJobInput, JobFilters } from "./types";

export async function findAll(filters?: JobFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.currencyId) {
    where.currencyId = filters.currencyId;
  }
  if (filters?.accountId) {
    where.accountId = filters.accountId;
  }

  return prisma.job.findMany({
    where,
    include: {
      currency: true,
      account: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      currency: true,
      account: true,
      incomes: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });
}

export async function findActive() {
  return prisma.job.findMany({
    where: { status: "active" },
    include: {
      currency: true,
      account: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function create(data: CreateJobInput) {
  return prisma.job.create({
    data,
    include: {
      currency: true,
      account: true,
    },
  });
}

export async function update(id: string, data: UpdateJobInput) {
  return prisma.job.update({
    where: { id },
    data,
    include: {
      currency: true,
      account: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.job.delete({
    where: { id },
  });
}

export async function archive(id: string) {
  return prisma.job.update({
    where: { id },
    data: {
      status: "archived",
      endDate: new Date(),
    },
    include: {
      currency: true,
      account: true,
    },
  });
}

export async function activate(id: string) {
  return prisma.job.update({
    where: { id },
    data: {
      status: "active",
      endDate: null,
    },
    include: {
      currency: true,
      account: true,
    },
  });
}

export async function getTotalMonthlyIncome() {
  const activeJobs = await prisma.job.findMany({
    where: { status: "active" },
  });

  let total = 0;
  for (const job of activeJobs) {
    const salary = Number(job.salary);
    switch (job.periodicity) {
      case "biweekly":
        total += salary * 2;
        break;
      case "monthly":
        total += salary;
        break;
      case "one_time":
        break;
    }
  }

  return total;
}
