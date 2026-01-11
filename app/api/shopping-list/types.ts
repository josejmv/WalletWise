import type {
  InventoryItem,
  InventoryCategory,
  Currency,
} from "@prisma/client";

export interface ShoppingListItem {
  id: string;
  itemId: string;
  itemName: string;
  // v1.3.0: categoryId can be null (items without category)
  categoryId: string | null;
  categoryName: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  neededQuantity: number;
  unit: string;
  estimatedPrice: number;
  currencyCode: string;
  estimatedTotal: number;
  priority: "high" | "medium" | "low";
  isPurchased: boolean;
  notes: string | null;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: Date;
  items: ShoppingListItem[];
  totalEstimatedCost: number;
  itemCount: number;
  purchasedCount: number;
  status: "pending" | "in_progress" | "completed";
}

export interface GenerateShoppingListInput {
  name?: string;
  includeAll?: boolean;
  categoryIds?: string[];
  priorityThreshold?: "high" | "medium" | "low";
}

export interface ShoppingListFilters {
  status?: "pending" | "in_progress" | "completed";
  categoryId?: string;
}

export interface InventoryItemWithRelations extends InventoryItem {
  category: InventoryCategory;
  currency: Currency;
}
