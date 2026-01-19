import type { InventoryCategory } from "@prisma/client";

export type { InventoryCategory };

export interface CreateInventoryCategoryInput {
  userId?: string | null;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UpdateInventoryCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface InventoryCategoryFilters {
  userId?: string | null;
}
