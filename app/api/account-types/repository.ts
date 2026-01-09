import { prisma } from "@/lib/prisma";
import type { CreateAccountTypeInput, UpdateAccountTypeInput } from "./types";

export async function findAll() {
  return prisma.accountType.findMany({
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string) {
  return prisma.accountType.findUnique({
    where: { id },
  });
}

export async function findByType(type: string) {
  return prisma.accountType.findFirst({
    where: { type: type as never },
  });
}

export async function create(data: CreateAccountTypeInput) {
  return prisma.accountType.create({
    data,
  });
}

export async function update(id: string, data: UpdateAccountTypeInput) {
  return prisma.accountType.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.accountType.delete({
    where: { id },
  });
}
