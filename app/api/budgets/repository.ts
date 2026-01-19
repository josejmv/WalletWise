import { prisma } from "@/lib/prisma";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetFilters,
} from "./types";

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

export async function findAll(filters?: BudgetFilters) {
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

export async function findById(id: string, userId?: string | null) {
  const where: Record<string, unknown> = { id };

  // If userId provided, ensure user owns this budget
  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.budget.findFirst({
    where,
    include: {
      currency: true,
      account: true,
      contributions: {
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function findActive(userId?: string | null) {
  const where: Record<string, unknown> = { status: "active" };

  // Multi-user: filter by userId
  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
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

export async function create(data: CreateBudgetInput) {
  return prisma.budget.create({
    data: {
      userId: data.userId,
      name: data.name,
      type: data.type,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      currencyId: data.currencyId,
      accountId: data.accountId,
      deadline: data.deadline,
      status: data.status,
    },
    include: {
      currency: true,
      account: true,
      contributions: true,
    },
  });
}

export async function update(id: string, data: UpdateBudgetInput, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Presupuesto no encontrado o no tienes permiso");
  }

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

export async function remove(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Presupuesto no encontrado o no tienes permiso");
  }

  return prisma.budget.delete({
    where: { id },
  });
}

// Block model - contribute does NOT deduct from account balance
// The money stays in the account but is marked as "blocked" for this budget
export async function contribute(
  budgetId: string,
  amount: number,
  fromAccountId: string,
  description?: string,
  userId?: string | null,
) {
  // First verify ownership
  const budget = await findById(budgetId, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado o no tienes permiso");
  }

  return prisma.$transaction(async (tx) => {
    // Verificar que la cuenta existe
    const account = await tx.account.findUnique({
      where: { id: fromAccountId },
    });

    if (!account) {
      throw new Error("Cuenta no encontrada");
    }

    // Calculate available balance (total - blocked in budgets)
    const budgetsForAccount = await tx.budget.findMany({
      where: {
        accountId: fromAccountId,
        status: { in: ["active", "completed"] },
      },
      select: { currentAmount: true },
    });

    const totalBlocked = budgetsForAccount.reduce(
      (sum, b) => sum + Number(b.currentAmount),
      0,
    );
    const availableBalance = Number(account.balance) - totalBlocked;

    if (availableBalance < amount) {
      throw new Error(
        `Saldo disponible insuficiente. Disponible: ${availableBalance.toFixed(2)}, requerido: ${amount}`,
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

    // NO reducir el balance de la cuenta (modelo de bloqueo)
    // El dinero permanece en la cuenta pero queda bloqueado

    // Incrementar el monto actual del budget (bloqueado)
    const updatedBudget = await tx.budget.update({
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

    // Si se alcanzo la meta, marcar como completado (solo si hay meta)
    if (
      updatedBudget.targetAmount &&
      Number(updatedBudget.currentAmount) >= Number(updatedBudget.targetAmount)
    ) {
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

    return updatedBudget;
  });
}

// Block model - withdraw does NOT add to account balance
// The money was never removed, just unblock it
export async function withdraw(
  budgetId: string,
  amount: number,
  toAccountId: string,
  description?: string,
  userId?: string | null,
) {
  // First verify ownership
  const existingBudget = await findById(budgetId, userId);
  if (!existingBudget) {
    throw new Error("Presupuesto no encontrado o no tienes permiso");
  }

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

    // NO incrementar el balance de la cuenta (modelo de bloqueo)
    // El dinero nunca salio, solo se desbloquea

    // Reducir el monto del budget (desbloquear) y reactivar si estaba completado
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

export async function getContributions(budgetId: string, userId?: string | null) {
  // First verify ownership
  const budget = await findById(budgetId, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado o no tienes permiso");
  }

  return prisma.budgetContribution.findMany({
    where: { budgetId },
    orderBy: { date: "desc" },
  });
}
