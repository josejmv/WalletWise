import { prisma } from "@/lib/prisma";
import type {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  InventoryItemFilters,
} from "./types";

function buildUserFilter(userId: string | null | undefined) {
  if (userId === undefined) return {};
  if (userId === null) return { userId: null };
  return { OR: [{ userId }, { userId: null }] };
}

export async function findAll(filters?: InventoryItemFilters) {
  const where: Record<string, unknown> = {
    ...buildUserFilter(filters?.userId),
  };

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

export async function findById(id: string, userId?: string | null) {
  return prisma.inventoryItem.findFirst({
    where: {
      id,
      ...buildUserFilter(userId),
    },
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

export async function update(
  id: string,
  data: UpdateInventoryItemInput,
  userId?: string | null,
) {
  const item = await findById(id, userId);
  if (!item) return null;

  return prisma.inventoryItem.update({
    where: { id },
    data,
    include: {
      category: true,
      currency: true,
    },
  });
}

export async function remove(id: string, userId?: string | null) {
  const item = await findById(id, userId);
  if (!item) return null;

  return prisma.inventoryItem.delete({
    where: { id },
  });
}

export async function adjustStock(
  id: string,
  quantity: number,
  operation: "add" | "subtract" | "set",
  userId?: string | null,
) {
  const item = await findById(id, userId);
  if (!item) return null;

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

export async function getLowStockItems(userId?: string | null) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      isActive: true,
      ...buildUserFilter(userId),
    },
    include: {
      category: true,
      currency: true,
    },
  });

  return items.filter(
    (item) => Number(item.currentQuantity) <= Number(item.minQuantity),
  );
}

export async function getShoppingList(userId?: string | null) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      isActive: true,
      ...buildUserFilter(userId),
    },
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
