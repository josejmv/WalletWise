import type { InventoryCategory } from "@prisma/client";

export type { InventoryCategory };

export interface CreateInventoryCategoryInput {
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
