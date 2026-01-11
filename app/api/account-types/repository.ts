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

// v1.3.0: Count accounts associated with this type
export async function countAccounts(id: string) {
  return prisma.account.count({
    where: { accountTypeId: id },
  });
}

// v1.3.0: Get accounts associated with this type
export async function getAccounts(id: string) {
  return prisma.account.findMany({
    where: { accountTypeId: id },
    select: { id: true, name: true },
  });
}

// v1.3.0: Move accounts to another type and delete original
export async function moveAccountsAndDelete(
  fromTypeId: string,
  toTypeId: string,
) {
  return prisma.$transaction(async (tx) => {
    // Move all accounts to the new type
    await tx.account.updateMany({
      where: { accountTypeId: fromTypeId },
      data: { accountTypeId: toTypeId },
    });

    // Delete the original type
    return tx.accountType.delete({
      where: { id: fromTypeId },
    });
  });
}
