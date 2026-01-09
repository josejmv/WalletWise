import { prisma } from "@/lib/prisma";
import type {
  CreateAccountInput,
  UpdateAccountInput,
  AccountFilters,
} from "./types";

export async function findAll(filters?: AccountFilters) {
  const where: Record<string, unknown> = {};

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

export async function findById(id: string) {
  return prisma.account.findUnique({
    where: { id },
    include: {
      accountType: true,
      currency: true,
    },
  });
}

export async function create(data: CreateAccountInput) {
  return prisma.account.create({
    data,
    include: {
      accountType: true,
      currency: true,
    },
  });
}

export async function update(id: string, data: UpdateAccountInput) {
  return prisma.account.update({
    where: { id },
    data,
    include: {
      accountType: true,
      currency: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.account.delete({
    where: { id },
  });
}

export async function updateBalance(id: string, amount: number) {
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

export async function getTotalBalance(currencyId?: string) {
  const result = await prisma.account.aggregate({
    _sum: {
      balance: true,
    },
    where: {
      isActive: true,
      ...(currencyId && { currencyId }),
    },
  });

  return result._sum.balance ?? 0;
}
