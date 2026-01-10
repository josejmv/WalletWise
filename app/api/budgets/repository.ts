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
  fromAccountId: string,
  description?: string,
) {
  return prisma.$transaction(async (tx) => {
    // Verificar que la cuenta tiene saldo suficiente
    const account = await tx.account.findUnique({
      where: { id: fromAccountId },
    });

    if (!account) {
      throw new Error("Cuenta no encontrada");
    }

    if (Number(account.balance) < amount) {
      throw new Error(
        `Saldo insuficiente. Disponible: ${account.balance}, requerido: ${amount}`,
      );
    }

    // Crear la contribucion
    await tx.budgetContribution.create({
      data: {
        budgetId,
        fromAccountId,
        amount,
        description,
      },
    });

    // Reducir el balance de la cuenta origen
    await tx.account.update({
      where: { id: fromAccountId },
      data: {
        balance: { decrement: amount },
      },
    });

    // Incrementar el monto actual del budget
    const budget = await tx.budget.update({
      where: { id: budgetId },
      data: {
        currentAmount: { increment: amount },
      },
      include: {
        currency: true,
        account: true,
        contributions: {
          orderBy: { date: "desc" },
        },
      },
    });

    // Si se alcanzo la meta, marcar como completado
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
  toAccountId: string,
  description?: string,
) {
  return prisma.$transaction(async (tx) => {
    // Verificar que el budget tiene saldo suficiente
    const budget = await tx.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new Error("Presupuesto no encontrado");
    }

    if (Number(budget.currentAmount) < amount) {
      throw new Error(
        `Saldo insuficiente en presupuesto. Disponible: ${budget.currentAmount}, requerido: ${amount}`,
      );
    }

    // Crear el registro de retiro (monto negativo)
    await tx.budgetContribution.create({
      data: {
        budgetId,
        toAccountId,
        amount: -amount,
        description,
      },
    });

    // Incrementar el balance de la cuenta destino
    await tx.account.update({
      where: { id: toAccountId },
      data: {
        balance: { increment: amount },
      },
    });

    // Reducir el monto del budget y reactivar si estaba completado
    return tx.budget.update({
      where: { id: budgetId },
      data: {
        currentAmount: { decrement: amount },
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
