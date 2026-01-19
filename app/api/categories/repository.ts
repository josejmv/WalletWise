import { prisma } from "@/lib/prisma";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
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

export async function findAll(filters?: CategoryFilters) {
  const where: Record<string, unknown> = {};

  // Multi-user: filter by userId
  if (filters?.userId !== undefined) {
    Object.assign(where, buildUserFilter(filters.userId));
  }

  if (filters?.rootOnly) {
    where.parentId = null;
  } else if (filters?.parentId !== undefined) {
    where.parentId = filters.parentId;
  }

  return prisma.category.findMany({
    where,
    include: {
      children: true,
      parent: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string, userId?: string | null) {
  const where: Record<string, unknown> = { id };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.category.findFirst({
    where,
    include: {
      children: true,
      parent: true,
    },
  });
}

export async function findByName(name: string, parentId?: string | null, userId?: string | null) {
  const where: Record<string, unknown> = {
    name,
    parentId: parentId ?? null,
  };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  return prisma.category.findFirst({
    where,
  });
}

export async function create(data: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      userId: data.userId,
      name: data.name,
      parentId: data.parentId,
      color: data.color,
      icon: data.icon,
    },
    include: {
      children: true,
      parent: true,
    },
  });
}

export async function update(id: string, data: UpdateCategoryInput, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Categoria no encontrada o no tienes permiso");
  }

  return prisma.category.update({
    where: { id },
    data,
    include: {
      children: true,
      parent: true,
    },
  });
}

export async function remove(id: string, userId?: string | null) {
  // First verify ownership
  const existing = await findById(id, userId);
  if (!existing) {
    throw new Error("Categoria no encontrada o no tienes permiso");
  }

  return prisma.category.delete({
    where: { id },
  });
}

export async function getTree(userId?: string | null) {
  const where: Record<string, unknown> = { parentId: null };

  if (userId !== undefined) {
    Object.assign(where, buildUserFilter(userId));
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories;
}
