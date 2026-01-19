import { prisma } from "@/lib/prisma";
import type { CreatePriceHistoryInput, PriceHistoryFilters } from "./types";

export async function findAll(filters?: PriceHistoryFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.itemId) {
    where.itemId = filters.itemId;
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
  // Multi-user: filter by item owner
  if (filters?.userId !== undefined) {
    where.item = {
      OR: [{ userId: filters.userId }, { userId: null }],
    };
  }

  return prisma.inventoryPriceHistory.findMany({
    where,
    include: {
      item: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findById(id: string, userId?: string | null) {
  const where: Record<string, unknown> = { id };

  // Multi-user: filter by item owner
  if (userId !== undefined) {
    where.item = {
      OR: [{ userId }, { userId: null }],
    };
  }

  return prisma.inventoryPriceHistory.findFirst({
    where,
    include: {
      item: true,
      currency: true,
    },
  });
}

export async function findByItemId(
  itemId: string,
  limit?: number,
  userId?: string | null,
) {
  const where: Record<string, unknown> = { itemId };

  // Multi-user: filter by item owner
  if (userId !== undefined) {
    where.item = {
      OR: [{ userId }, { userId: null }],
    };
  }

  return prisma.inventoryPriceHistory.findMany({
    where,
    include: {
      item: true,
      currency: true,
    },
    orderBy: { date: "desc" },
    ...(limit && { take: limit }),
  });
}

export async function create(data: CreatePriceHistoryInput) {
  return prisma.inventoryPriceHistory.create({
    data: {
      ...data,
      date: data.date ?? new Date(),
    },
    include: {
      item: true,
      currency: true,
    },
  });
}

export async function createMany(entries: CreatePriceHistoryInput[]) {
  const results = [];
  for (const entry of entries) {
    const result = await prisma.inventoryPriceHistory.create({
      data: {
        ...entry,
        date: entry.date ?? new Date(),
      },
      include: {
        item: true,
        currency: true,
      },
    });
    results.push(result);
  }
  return results;
}

export async function remove(id: string, userId?: string | null) {
  // Multi-user: verify ownership through item before delete
  if (userId !== undefined) {
    const entry = await findById(id, userId);
    if (!entry) {
      return null;
    }
  }

  return prisma.inventoryPriceHistory.delete({
    where: { id },
  });
}

export async function getLatestPriceForItem(
  itemId: string,
  userId?: string | null,
) {
  const where: Record<string, unknown> = { itemId };

  // Multi-user: filter by item owner
  if (userId !== undefined) {
    where.item = {
      OR: [{ userId }, { userId: null }],
    };
  }

  return prisma.inventoryPriceHistory.findFirst({
    where,
    include: {
      item: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getPriceStatsForItem(
  itemId: string,
  userId?: string | null,
) {
  const where: Record<string, unknown> = { itemId };

  // Multi-user: filter by item owner
  if (userId !== undefined) {
    where.item = {
      OR: [{ userId }, { userId: null }],
    };
  }

  const history = await prisma.inventoryPriceHistory.findMany({
    where,
    orderBy: { date: "desc" },
  });

  if (history.length === 0) {
    return null;
  }

  const prices = history.map((h) => Number(h.price));
  const currentPrice = prices[0];
  const previousPrice = prices.length > 1 ? prices[1] : prices[0];

  return {
    currentPrice,
    averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    priceChange: currentPrice - previousPrice,
    priceChangePercent:
      previousPrice > 0
        ? ((currentPrice - previousPrice) / previousPrice) * 100
        : 0,
    recordCount: history.length,
  };
}
