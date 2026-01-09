import * as repository from "./repository";
import type { CreateAccountTypeInput, UpdateAccountTypeInput } from "./types";

export async function getAccountTypes() {
  return repository.findAll();
}

export async function getAccountTypeById(id: string) {
  const accountType = await repository.findById(id);
  if (!accountType) {
    throw new Error("Tipo de cuenta no encontrado");
  }
  return accountType;
}

export async function createAccountType(data: CreateAccountTypeInput) {
  const existing = await repository.findByType(data.type);
  if (existing) {
    throw new Error(`Ya existe un tipo de cuenta ${data.type}`);
  }

  return repository.create(data);
}

export async function updateAccountType(
  id: string,
  data: UpdateAccountTypeInput,
) {
  const accountType = await repository.findById(id);
  if (!accountType) {
    throw new Error("Tipo de cuenta no encontrado");
  }

  return repository.update(id, data);
}

export async function deleteAccountType(id: string) {
  const accountType = await repository.findById(id);
  if (!accountType) {
    throw new Error("Tipo de cuenta no encontrado");
  }

  return repository.remove(id);
}
