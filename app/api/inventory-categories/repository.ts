import { prisma } from "@/lib/prisma";
import type {
  CreateInventoryCategoryInput,
  UpdateInventoryCategoryInput,
  InventoryCategoryFilters,
} from "./types";

// Helper to build userId filter for transition period
function buildUserFilter(userId: string | null | undefined) {
  if (userId === undefined) {
    return {}; // No filter - return all (legacy mode)
  }
  if (userId === null) {
    return { userId: null }; // Only legacy data
  }
  // Include both user's data and legacy data (userId = null)
  return {
    OR: [{ userId }, { userId: null }],
  };
}

export async function findAll(filters?: InventoryCategoryFilters) {
  const where: Record<string, unknown> = {};

  // Multi-user: filter by userId
  if (filters?.userId !== undefined) {
    Object.assign(where, buildUserFilter(filters.userId));
  }

  return prisma.inventoryCategory.findMany({
    where,
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string, userId?: string | null) {
  const where: Record<string, unknown> = { id };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.inventoryCategory.findFirst({
    where,
    include: {
      items: true,
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function findByName(name: string, userId?: string | null) {
  const where: Record<string, unknown> = { name };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.inventoryCategory.findFirst({
    where,
  });
}

export async function create(data: CreateInventoryCategoryInput) {
  return prisma.inventoryCategory.create({
    data: {
      userId: data.userId,
      name: data.name,
      icon: data.icon,
      color: data.color,
      description: data.description,
    },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function update(id: string, data: UpdateInventoryCategoryInput, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Categoria de inventario no encontrada o no tienes permiso");
  }

  return prisma.inventoryCategory.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function remove(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Categoria de inventario no encontrada o no tienes permiso");
  }

  return prisma.inventoryCategory.delete({
    where: { id },
  });
}
