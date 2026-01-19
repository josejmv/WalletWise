import { prisma } from "@/lib/prisma";
import type { CreateJobInput, UpdateJobInput, JobFilters } from "./types";

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

export async function findAll(filters?: JobFilters) {
  const where: Record<string, unknown> = {};

  // Multi-user: filter by userId
  if (filters?.userId !== undefined) {
    Object.assign(where, buildUserFilter(filters.userId));
  }
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

export async function findById(id: string, userId?: string | null) {
  const where: Record<string, unknown> = { id };

  // If userId provided, ensure user owns this job
  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.job.findFirst({
    where,
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

export async function findActive(userId?: string | null) {
  const where: Record<string, unknown> = { status: "active" };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
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

export async function create(data: CreateJobInput) {
  return prisma.job.create({
    data: {
      userId: data.userId,
      name: data.name,
      type: data.type,
      salary: data.salary,
      currencyId: data.currencyId,
      accountId: data.accountId,
      periodicity: data.periodicity,
      payDay: data.payDay,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
    },
    include: {
      currency: true,
      account: true,
    },
  });
}

export async function update(id: string, data: UpdateJobInput, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Trabajo no encontrado o no tienes permiso");
  }

  return prisma.job.update({
    where: { id },
    data,
    include: {
      currency: true,
      account: true,
    },
  });
}

export async function remove(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Trabajo no encontrado o no tienes permiso");
  }

  return prisma.job.delete({
    where: { id },
  });
}

export async function archive(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Trabajo no encontrado o no tienes permiso");
  }

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

export async function activate(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Trabajo no encontrado o no tienes permiso");
  }

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

export async function getTotalMonthlyIncome(userId?: string | null) {
  const where: Record<string, unknown> = { status: "active" };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  const activeJobs = await prisma.job.findMany({
    where,
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
