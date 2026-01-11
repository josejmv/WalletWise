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

  // v1.3.0: Check for associated accounts
  const accountCount = await repository.countAccounts(id);
  if (accountCount > 0) {
    throw new Error(
      `No se puede eliminar: hay ${accountCount} cuenta(s) asociada(s). Mueve las cuentas primero.`,
    );
  }

  return repository.remove(id);
}

// v1.3.0: Get account count for a type
export async function getAccountCount(id: string) {
  const accountType = await repository.findById(id);
  if (!accountType) {
    throw new Error("Tipo de cuenta no encontrado");
  }
  return repository.countAccounts(id);
}

// v1.3.0: Get accounts for a type
export async function getAccountsForType(id: string) {
  const accountType = await repository.findById(id);
  if (!accountType) {
    throw new Error("Tipo de cuenta no encontrado");
  }
  return repository.getAccounts(id);
}

// v1.3.0: Move accounts to another type and delete
export async function moveAccountsAndDeleteType(
  fromTypeId: string,
  toTypeId: string,
) {
  const fromType = await repository.findById(fromTypeId);
  if (!fromType) {
    throw new Error("Tipo de cuenta origen no encontrado");
  }

  const toType = await repository.findById(toTypeId);
  if (!toType) {
    throw new Error("Tipo de cuenta destino no encontrado");
  }

  if (fromTypeId === toTypeId) {
    throw new Error("El tipo destino debe ser diferente al origen");
  }

  return repository.moveAccountsAndDelete(fromTypeId, toTypeId);
}
