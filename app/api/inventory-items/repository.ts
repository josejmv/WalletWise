import { prisma } from "@/lib/prisma";
import type {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  InventoryItemFilters,
} from "./types";

export async function findAll(filters?: InventoryItemFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.currencyId) {
    where.currencyId = filters.currencyId;
  }
  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    include: {
      category: true,
      currency: true,
    },
    orderBy: { name: "asc" },
  });

  if (filters?.lowStock) {
    return items.filter(
      (item) => Number(item.currentQuantity) <= Number(item.minQuantity),
    );
  }

  return items;
}

export async function findById(id: string) {
  return prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      category: true,
      currency: true,
      priceHistory: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });
}

export async function create(data: CreateInventoryItemInput) {
  return prisma.inventoryItem.create({
    data,
    include: {
      category: true,
      currency: true,
    },
  });
}

export async function update(id: string, data: UpdateInventoryItemInput) {
  return prisma.inventoryItem.update({
    where: { id },
    data,
    include: {
      category: true,
      currency: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.inventoryItem.delete({
    where: { id },
  });
}

export async function adjustStock(
  id: string,
  quantity: number,
  operation: "add" | "subtract" | "set",
) {
  if (operation === "set") {
    return prisma.inventoryItem.update({
      where: { id },
      data: { currentQuantity: quantity },
      include: {
        category: true,
        currency: true,
      },
    });
  }

  return prisma.inventoryItem.update({
    where: { id },
    data: {
      currentQuantity: {
        [operation === "add" ? "increment" : "decrement"]: quantity,
      },
    },
    include: {
      category: true,
      currency: true,
    },
  });
}

export async function getLowStockItems() {
  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    include: {
      category: true,
      currency: true,
    },
  });

  return items.filter(
    (item) => Number(item.currentQuantity) <= Number(item.minQuantity),
  );
}

export async function getShoppingList() {
  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    include: {
      category: true,
      currency: true,
    },
  });

  return items
    .filter((item) => Number(item.currentQuantity) < Number(item.maxQuantity))
    .map((item) => ({
      ...item,
      quantityNeeded: Number(item.maxQuantity) - Number(item.currentQuantity),
      estimatedCost:
        (Number(item.maxQuantity) - Number(item.currentQuantity)) *
        Number(item.estimatedPrice),
    }));
}
