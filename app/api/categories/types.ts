import type { Category } from "@prisma/client";

export type { Category };

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface CreateCategoryInput {
  userId?: string | null; // Multi-user support
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
}

export interface CategoryFilters {
  userId?: string | null; // Multi-user support
  parentId?: string | null;
  rootOnly?: boolean;
}
