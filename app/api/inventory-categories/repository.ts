import { prisma } from "@/lib/prisma";
import type {
  CreateInventoryCategoryInput,
  UpdateInventoryCategoryInput,
} from "./types";

export async function findAll() {
  return prisma.inventoryCategory.findMany({
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string) {
  return prisma.inventoryCategory.findUnique({
    where: { id },
    include: {
      items: true,
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function findByName(name: string) {
  return prisma.inventoryCategory.findUnique({
    where: { name },
  });
}

export async function create(data: CreateInventoryCategoryInput) {
  return prisma.inventoryCategory.create({
    data,
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
}

export async function update(id: string, data: UpdateInventoryCategoryInput) {
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

export async function remove(id: string) {
  return prisma.inventoryCategory.delete({
    where: { id },
  });
}
