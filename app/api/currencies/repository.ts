import { prisma } from "@/lib/prisma";
import type {
  CreateCurrencyInput,
  UpdateCurrencyInput,
  CurrencyFilters,
} from "./types";

export async function findAll(filters?: CurrencyFilters) {
  return prisma.currency.findMany({
    where: filters?.isBase !== undefined ? { isBase: filters.isBase } : {},
    orderBy: { code: "asc" },
  });
}

export async function findById(id: string) {
  return prisma.currency.findUnique({
    where: { id },
  });
}

export async function findByCode(code: string) {
  return prisma.currency.findUnique({
    where: { code },
  });
}

export async function create(data: CreateCurrencyInput) {
  return prisma.currency.create({
    data,
  });
}

export async function update(id: string, data: UpdateCurrencyInput) {
  return prisma.currency.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.currency.delete({
    where: { id },
  });
}

export async function setAsBase(id: string) {
  return prisma.$transaction([
    prisma.currency.updateMany({
      where: { isBase: true },
      data: { isBase: false },
    }),
    prisma.currency.update({
      where: { id },
      data: { isBase: true },
    }),
  ]);
}
