import type {
  InventoryItem,
  InventoryCategory,
  Currency,
  InventoryUnit,
} from "@prisma/client";

export type { InventoryItem, InventoryUnit };

export interface InventoryItemWithRelations extends InventoryItem {
  category: InventoryCategory;
  currency: Currency;
}

export interface CreateInventoryItemInput {
  name: string;
  categoryId: string;
  currentQuantity?: number;
  maxQuantity: number;
  minQuantity?: number;
  unit?: InventoryUnit;
  estimatedPrice: number;
  currencyId: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  categoryId?: string;
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
