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

  return prisma.inventoryPriceHistory.findMany({
    where,
    include: {
      item: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.inventoryPriceHistory.findUnique({
    where: { id },
    include: {
      item: true,
      currency: true,
    },
  });
}

export async function findByItemId(itemId: string, limit?: number) {
  return prisma.inventoryPriceHistory.findMany({
    where: { itemId },
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

export async function remove(id: string) {
  return prisma.inventoryPriceHistory.delete({
    where: { id },
  });
}

export async function getLatestPriceForItem(itemId: string) {
  return prisma.inventoryPriceHistory.findFirst({
    where: { itemId },
    include: {
      item: true,
      currency: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getPriceStatsForItem(itemId: string) {
  const history = await prisma.inventoryPriceHistory.findMany({
    where: { itemId },
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
