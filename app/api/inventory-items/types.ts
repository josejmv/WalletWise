import type {
  InventoryItem,
  InventoryCategory,
  Currency,
  InventoryUnit,
} from "@prisma/client";

export type { InventoryItem, InventoryUnit };

// v1.3.0: category can be null (items without category)
export interface InventoryItemWithRelations extends InventoryItem {
  category: InventoryCategory | null;
  currency: Currency;
}

export interface CreateInventoryItemInput {
  name: string;
  // v1.3.0: categoryId is optional (nullable)
  categoryId?: string | null;
  currentQuantity?: number;
  maxQuantity: number;
  minQuantity?: number;
  unit?: InventoryUnit;
  estimatedPrice: number; // Has default 0 in schema
  currencyId: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  // v1.3.0: categoryId can be null to remove category
  categoryId?: string | null;
  currentQuantity?: number;
  maxQuantity?: number;
  minQuantity?: number;
  unit?: InventoryUnit;
  estimatedPrice?: number;
  currencyId?: string;
  isActive?: boolean;
  notes?: string;
}

export interface InventoryItemFilters {
  categoryId?: string;
  currencyId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface StockAdjustment {
  quantity: number;
  operation: "add" | "subtract" | "set";
}
