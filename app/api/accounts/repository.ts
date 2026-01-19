import { prisma } from "@/lib/prisma";
import type {
  CreateAccountInput,
  UpdateAccountInput,
  AccountFilters,
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

export async function findAll(filters?: AccountFilters) {
  const where: Record<string, unknown> = {};

  // Multi-user: filter by userId
  if (filters?.userId !== undefined) {
    Object.assign(where, buildUserFilter(filters.userId));
  }
  if (filters?.accountTypeId) {
    where.accountTypeId = filters.accountTypeId;
  }
  if (filters?.currencyId) {
    where.currencyId = filters.currencyId;
  }
  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return prisma.account.findMany({
    where,
    include: {
      accountType: true,
      currency: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string, userId?: string | null) {
  const where: Record<string, unknown> = { id };

  // If userId provided, ensure user owns this account
  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.account.findFirst({
    where,
    include: {
      accountType: true,
      currency: true,
    },
  });
}

export async function create(data: CreateAccountInput) {
  return prisma.account.create({
    data: {
      userId: data.userId,
      name: data.name,
      accountTypeId: data.accountTypeId,
      currencyId: data.currencyId,
      balance: data.balance,
      isActive: data.isActive,
    },
    include: {
      accountType: true,
      currency: true,
    },
  });
}

export async function update(id: string, data: UpdateAccountInput, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Cuenta no encontrada o no tienes permiso");
  }

  return prisma.account.update({
    where: { id },
    data,
    include: {
      accountType: true,
      currency: true,
    },
  });
}

export async function remove(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Cuenta no encontrada o no tienes permiso");
  }

  return prisma.account.delete({
    where: { id },
  });
}

export async function updateBalance(id: string, amount: number, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Cuenta no encontrada o no tienes permiso");
  }

  return prisma.account.update({
    where: { id },
    data: {
      balance: {
        increment: amount,
      },
    },
    include: {
      accountType: true,
      currency: true,
    },
  });
}

export async function getTotalBalance(currencyId?: string, userId?: string | null) {
  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }
  if (currencyId) {
    where.currencyId = currencyId;
  }

  const result = await prisma.account.aggregate({
    _sum: {
      balance: true,
    },
    where,
  });

  return result._sum.balance ?? 0;
}
