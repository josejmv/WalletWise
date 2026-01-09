import { prisma } from "@/lib/prisma";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
} from "./types";

export async function findAll(filters?: CategoryFilters) {
  const where: Record<string, unknown> = {};

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

export async function findById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      parent: true,
    },
  });
}

export async function findByName(name: string, parentId?: string | null) {
  return prisma.category.findFirst({
    where: {
      name,
      parentId: parentId ?? null,
    },
  });
}

export async function create(data: CreateCategoryInput) {
  return prisma.category.create({
    data,
    include: {
      children: true,
      parent: true,
    },
  });
}

export async function update(id: string, data: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id },
    data,
    include: {
      children: true,
      parent: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.category.delete({
    where: { id },
  });
}

export async function getTree() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
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
