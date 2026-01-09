import { prisma } from "@/lib/prisma";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetFilters,
} from "./types";

export async function findAll(filters?: BudgetFilters) {
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

  return prisma.budget.findMany({
    where,
    include: {
      currency: true,
      account: true,
      contributions: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.budget.findUnique({
    where: { id },
    include: {
      currency: true,
      account: true,
      contributions: {
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function findActive() {
  return prisma.budget.findMany({
    where: { status: "active" },
    include: {
      currency: true,
      account: true,
      contributions: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function create(data: CreateBudgetInput) {
  return prisma.budget.create({
    data,
    include: {
      currency: true,
      account: true,
      contributions: true,
    },
  });
}

export async function update(id: string, data: UpdateBudgetInput) {
  return prisma.budget.update({
    where: { id },
    data,
    include: {
      currency: true,
      account: true,
      contributions: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.budget.delete({
    where: { id },
  });
}

export async function contribute(
  budgetId: string,
  amount: number,
  description?: string,
) {
  return prisma.$transaction(async (tx) => {
    await tx.budgetContribution.create({
      data: {
        budgetId,
        amount,
        description,
      },
    });

    const budget = await tx.budget.update({
      where: { id: budgetId },
      data: {
        currentAmount: {
          increment: amount,
        },
      },
      include: {
        currency: true,
        account: true,
        contributions: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (Number(budget.currentAmount) >= Number(budget.targetAmount)) {
      return tx.budget.update({
        where: { id: budgetId },
        data: { status: "completed" },
        include: {
          currency: true,
          account: true,
          contributions: {
            orderBy: { date: "desc" },
          },
        },
      });
    }

    return budget;
  });
}

export async function withdraw(
  budgetId: string,
  amount: number,
  description?: string,
) {
  return prisma.$transaction(async (tx) => {
    await tx.budgetContribution.create({
      data: {
        budgetId,
        amount: -amount,
        description,
      },
    });

    return tx.budget.update({
      where: { id: budgetId },
      data: {
        currentAmount: {
          decrement: amount,
        },
        status: "active",
      },
      include: {
        currency: true,
        account: true,
        contributions: {
          orderBy: { date: "desc" },
        },
      },
    });
  });
}

export async function getContributions(budgetId: string) {
  return prisma.budgetContribution.findMany({
    where: { budgetId },
    orderBy: { date: "desc" },
  });
}
