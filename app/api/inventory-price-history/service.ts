import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type { CreatePriceHistoryInput, PriceHistoryFilters } from "./types";

export async function getPriceHistory(filters?: PriceHistoryFilters) {
  return repository.findAll(filters);
}

export async function getPriceHistoryById(id: string) {
  const entry = await repository.findById(id);
  if (!entry) {
    throw new Error("Registro de precio no encontrado");
  }
  return entry;
}

export async function getPriceHistoryByItem(itemId: string, limit?: number) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  return repository.findByItemId(itemId, limit);
}

export async function createPriceHistory(data: CreatePriceHistoryInput) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: data.itemId },
  });
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  const entry = await repository.create(data);

  await prisma.inventoryItem.update({
    where: { id: data.itemId },
    data: {
      estimatedPrice: data.price,
      currencyId: data.currencyId,
    },
  });

  return entry;
}

export async function createManyPriceHistory(
  entries: CreatePriceHistoryInput[],
) {
  for (const entry of entries) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: entry.itemId },
    });
    if (!item) {
      throw new Error(`Producto de inventario no encontrado: ${entry.itemId}`);
    }

    const currency = await prisma.currency.findUnique({
      where: { id: entry.currencyId },
    });
    if (!currency) {
      throw new Error(`Moneda no encontrada: ${entry.currencyId}`);
    }
  }

  const results = await repository.createMany(entries);

  for (const entry of entries) {
    await prisma.inventoryItem.update({
      where: { id: entry.itemId },
      data: {
        estimatedPrice: entry.price,
        currencyId: entry.currencyId,
      },
    });
  }

  return results;
}

export async function deletePriceHistory(id: string) {
  const entry = await repository.findById(id);
  if (!entry) {
    throw new Error("Registro de precio no encontrado");
  }

  return repository.remove(id);
}

export async function getLatestPrice(itemId: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  return repository.getLatestPriceForItem(itemId);
}

export async function getPriceStats(itemId: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  const stats = await repository.getPriceStatsForItem(itemId);
  if (!stats) {
    return {
      itemId,
      itemName: item.name,
      currentPrice: Number(item.estimatedPrice),
      averagePrice: Number(item.estimatedPrice),
      minPrice: Number(item.estimatedPrice),
      maxPrice: Number(item.estimatedPrice),
      priceChange: 0,
      priceChangePercent: 0,
      recordCount: 0,
    };
  }

  return {
    itemId,
    itemName: item.name,
    ...stats,
  };
}
