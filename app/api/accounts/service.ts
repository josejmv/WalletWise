import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateAccountInput,
  UpdateAccountInput,
  AccountFilters,
} from "./types";

export async function getAccounts(filters?: AccountFilters) {
  return repository.findAll(filters);
}

export async function getAccountById(id: string) {
  const account = await repository.findById(id);
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }
  return account;
}

export async function createAccount(data: CreateAccountInput) {
  const accountType = await prisma.accountType.findUnique({
    where: { id: data.accountTypeId },
  });
  if (!accountType) {
    throw new Error("Tipo de cuenta no encontrado");
  }

  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  return repository.create(data);
}

export async function updateAccount(id: string, data: UpdateAccountInput) {
  const account = await repository.findById(id);
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  if (data.accountTypeId) {
    const accountType = await prisma.accountType.findUnique({
      where: { id: data.accountTypeId },
    });
    if (!accountType) {
      throw new Error("Tipo de cuenta no encontrado");
    }
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  return repository.update(id, data);
}

export async function deleteAccount(id: string) {
  const account = await repository.findById(id);
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  return repository.remove(id);
}

export async function adjustBalance(id: string, amount: number) {
  const account = await repository.findById(id);
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  return repository.updateBalance(id, amount);
}

export async function getTotalBalance(currencyId?: string) {
  return repository.getTotalBalance(currencyId);
}
