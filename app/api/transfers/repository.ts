import { prisma } from "@/lib/prisma";
import type {
  CreateTransferInput,
  UpdateTransferInput,
  TransferFilters,
} from "./types";
import type { PaginationParams } from "@/lib/pagination";

function buildWhereClause(filters?: TransferFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.fromAccountId) {
    where.fromAccountId = filters.fromAccountId;
  }
  if (filters?.toAccountId) {
    where.toAccountId = filters.toAccountId;
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

export async function findAll(filters?: TransferFilters) {
  const where = buildWhereClause(filters);

  return prisma.transfer.findMany({
    where,
    include: {
      fromAccount: true,
      toAccount: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findAllPaginated(
  filters?: TransferFilters,
  pagination?: PaginationParams,
) {
  const where = buildWhereClause(filters);
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const skip = (page - 1) * limit;

  const sortBy = pagination?.sortBy || "date";
  const sortOrder = pagination?.sortOrder || "desc";

  const [data, total] = await Promise.all([
    prisma.transfer.findMany({
      where,
      include: {
        fromAccount: true,
        toAccount: true,
        currency: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.transfer.count({ where }),
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
  return prisma.transfer.findUnique({
    where: { id },
    include: {
      fromAccount: true,
      toAccount: true,
      currency: true,
    },
  });
}

export async function findByAccount(accountId: string) {
  return prisma.transfer.findMany({
    where: {
      OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
    },
    include: {
      fromAccount: true,
      toAccount: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function create(data: CreateTransferInput) {
  return prisma.transfer.create({
    data: {
      ...data,
      date: data.date ?? new Date(),
    },
    include: {
      fromAccount: true,
      toAccount: true,
      currency: true,
    },
  });
}

export async function update(id: string, data: UpdateTransferInput) {
  return prisma.transfer.update({
    where: { id },
    data,
    include: {
      fromAccount: true,
      toAccount: true,
      currency: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.transfer.delete({
    where: { id },
  });
}

export async function getSummary(filters?: TransferFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.startDate || filters?.endDate) {
    where.date = {
      ...(filters?.startDate && { gte: filters.startDate }),
      ...(filters?.endDate && { lte: filters.endDate }),
    };
  }

  const transfers = await prisma.transfer.findMany({
    where,
    include: {
      fromAccount: true,
      toAccount: true,
    },
  });

  const byFromAccount = new Map<
    string,
    { accountName: string; total: number }
  >();
  const byToAccount = new Map<string, { accountName: string; total: number }>();
  let totalAmount = 0;

  for (const transfer of transfers) {
    const amount = Number(transfer.amount);
    totalAmount += amount;

    const fromData = byFromAccount.get(transfer.fromAccountId) || {
      accountName: transfer.fromAccount.name,
      total: 0,
    };
    fromData.total += amount;
    byFromAccount.set(transfer.fromAccountId, fromData);

    const toData = byToAccount.get(transfer.toAccountId) || {
      accountName: transfer.toAccount.name,
      total: 0,
    };
    toData.total += amount;
    byToAccount.set(transfer.toAccountId, toData);
  }

  return {
    totalAmount,
    count: transfers.length,
    byFromAccount: Array.from(byFromAccount.entries()).map(
      ([accountId, data]) => ({
        accountId,
        ...data,
      }),
    ),
    byToAccount: Array.from(byToAccount.entries()).map(([accountId, data]) => ({
      accountId,
      ...data,
    })),
  };
}
