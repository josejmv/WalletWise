import { prisma } from "@/lib/prisma";
import type {
  ShoppingListItem,
  ShoppingList,
  GenerateShoppingListInput,
} from "./types";

function calculatePriority(
  current: number,
  min: number,
  max: number,
): "high" | "medium" | "low" {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  if (current <= min || percentage <= 10) {
    return "high";
  } else if (percentage <= 30) {
    return "medium";
  }
  return "low";
}

export async function generateShoppingList(
  input?: GenerateShoppingListInput,
): Promise<ShoppingList> {
  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (input?.categoryIds && input.categoryIds.length > 0) {
    where.categoryId = { in: input.categoryIds };
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    include: {
      category: true,
      currency: true,
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  const shoppingItems: ShoppingListItem[] = [];

  for (const item of items) {
    const current = Number(item.currentQuantity);
    const min = Number(item.minQuantity);
    const max = Number(item.maxQuantity);
    const price = Number(item.estimatedPrice);

    const priority = calculatePriority(current, min, max);

    // Filter by priority threshold if specified
    if (input?.priorityThreshold) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[priority] < priorityOrder[input.priorityThreshold]) {
        continue;
      }
    }

    // Only include items that need restocking (below max) unless includeAll
    const needsRestock = current < max;
    if (!input?.includeAll && !needsRestock) {
      continue;
    }

    const neededQuantity = Math.max(0, max - current);
    const estimatedTotal = neededQuantity * price;

    shoppingItems.push({
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      categoryId: item.categoryId,
      // v1.3.0: Handle null category
      categoryName: item.category?.name ?? "Sin categoría",
      currentQuantity: current,
      minQuantity: min,
      maxQuantity: max,
      neededQuantity,
      unit: item.unit,
      estimatedPrice: price,
      currencyCode: item.currency.code,
      estimatedTotal,
      priority,
      isPurchased: false,
      notes: item.notes,
    });
  }

  // Sort by priority (high first) then by category
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  shoppingItems.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.categoryName.localeCompare(b.categoryName);
  });

  const totalEstimatedCost = shoppingItems.reduce(
    (sum, item) => sum + item.estimatedTotal,
    0,
  );

  return {
    id: `shopping-list-${Date.now()}`,
    name:
      input?.name || `Lista de compras - ${new Date().toLocaleDateString()}`,
    createdAt: new Date(),
    items: shoppingItems,
    totalEstimatedCost,
    itemCount: shoppingItems.length,
    purchasedCount: 0,
    status: "pending",
  };
}

export async function getLowStockItems(): Promise<ShoppingListItem[]> {
  const items = await prisma.inventoryItem.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: true,
      currency: true,
    },
  });

  const lowStockItems: ShoppingListItem[] = [];

  for (const item of items) {
    const current = Number(item.currentQuantity);
    const min = Number(item.minQuantity);
    const max = Number(item.maxQuantity);
    const price = Number(item.estimatedPrice);

    // Only include items at or below minimum
    if (current > min) {
      continue;
    }

    const neededQuantity = Math.max(0, max - current);
    const estimatedTotal = neededQuantity * price;

    lowStockItems.push({
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      categoryId: item.categoryId,
      // v1.3.0: Handle null category
      categoryName: item.category?.name ?? "Sin categoría",
      currentQuantity: current,
      minQuantity: min,
      maxQuantity: max,
      neededQuantity,
      unit: item.unit,
      estimatedPrice: price,
      currencyCode: item.currency.code,
      estimatedTotal,
      priority: "high",
      isPurchased: false,
      notes: item.notes,
    });
  }

  return lowStockItems.sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName),
  );
}

// v1.3.0: categoryId can be null for items without category
export async function getShoppingListByCategory(): Promise<
  {
    categoryId: string | null;
    categoryName: string;
    items: ShoppingListItem[];
  }[]
> {
  const list = await generateShoppingList();

  const byCategory = new Map<
    string | null,
    { categoryName: string; items: ShoppingListItem[] }
  >();

  for (const item of list.items) {
    const key = item.categoryId;
    const data = byCategory.get(key) || {
      categoryName: item.categoryName,
      items: [],
    };
    data.items.push(item);
    byCategory.set(key, data);
  }

  return Array.from(byCategory.entries()).map(([categoryId, data]) => ({
    categoryId,
    categoryName: data.categoryName,
    items: data.items,
  }));
}

export async function markItemPurchased(
  itemId: string,
  quantity: number,
): Promise<void> {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      currentQuantity: { increment: quantity },
    },
  });
}

export async function getShoppingListSummary(): Promise<{
  totalItems: number;
  lowStockCount: number;
  estimatedTotal: number;
  byCategory: { categoryName: string; count: number; total: number }[];
}> {
  const list = await generateShoppingList();
  const lowStock = await getLowStockItems();

  const byCategory = new Map<string, { count: number; total: number }>();

  for (const item of list.items) {
    const data = byCategory.get(item.categoryName) || { count: 0, total: 0 };
    data.count++;
    data.total += item.estimatedTotal;
    byCategory.set(item.categoryName, data);
  }

  return {
    totalItems: list.itemCount,
    lowStockCount: lowStock.length,
    estimatedTotal: list.totalEstimatedCost,
    byCategory: Array.from(byCategory.entries()).map(
      ([categoryName, data]) => ({
        categoryName,
        count: data.count,
        total: data.total,
      }),
    ),
  };
}
