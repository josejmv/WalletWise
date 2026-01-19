import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetFilters,
  ContributeInput,
  WithdrawInput,
} from "./types";

export async function getBudgets(filters?: BudgetFilters) {
  return repository.findAll(filters);
}

export async function getActiveBudgets(userId?: string | null) {
  return repository.findActive(userId);
}

export async function getBudgetById(id: string, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }
  return budget;
}

export async function createBudget(data: CreateBudgetInput) {
  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  // accountId es requerido para ambos tipos
  const account = await prisma.account.findUnique({
    where: { id: data.accountId },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  // Verificar que la moneda del budget coincida con la de la cuenta
  if (account.currencyId !== data.currencyId) {
    throw new Error(
      "La moneda del presupuesto debe coincidir con la de la cuenta",
    );
  }

  return repository.create(data);
}

export async function updateBudget(id: string, data: UpdateBudgetInput, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  if (data.accountId) {
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });
    if (!account) {
      throw new Error("Cuenta no encontrada");
    }

    // Verificar que la moneda coincida
    const currencyId = data.currencyId ?? budget.currencyId;
    if (account.currencyId !== currencyId) {
      throw new Error(
        "La moneda del presupuesto debe coincidir con la de la cuenta",
      );
    }
  }

  return repository.update(id, data, userId);
}

export async function deleteBudget(id: string, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  return repository.remove(id, userId);
}

export async function contributeToBudget(id: string, data: ContributeInput, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "completed") {
    throw new Error("No se puede contribuir a un presupuesto completado");
  }

  if (budget.status === "cancelled") {
    throw new Error("No se puede contribuir a un presupuesto cancelado");
  }

  // Verificar que la cuenta existe
  const account = await prisma.account.findUnique({
    where: { id: data.fromAccountId },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  // Verificar que la moneda de la cuenta coincida con la del budget
  if (account.currencyId !== budget.currencyId) {
    throw new Error(
      "La moneda de la cuenta debe coincidir con la del presupuesto",
    );
  }

  return repository.contribute(
    id,
    data.amount,
    data.fromAccountId,
    data.description,
    userId,
  );
}

export async function withdrawFromBudget(id: string, data: WithdrawInput, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "cancelled") {
    throw new Error("No se puede retirar de un presupuesto cancelado");
  }

  // Verificar que la cuenta existe
  const account = await prisma.account.findUnique({
    where: { id: data.toAccountId },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  // Verificar que la moneda de la cuenta coincida con la del budget
  if (account.currencyId !== budget.currencyId) {
    throw new Error(
      "La moneda de la cuenta debe coincidir con la del presupuesto",
    );
  }

  const currentAmount = Number(budget.currentAmount);
  if (data.amount > currentAmount) {
    throw new Error(
      `No hay suficiente saldo. Saldo actual: ${currentAmount}, intentando retirar: ${data.amount}`,
    );
  }

  return repository.withdraw(
    id,
    data.amount,
    data.toAccountId,
    data.description,
    userId,
  );
}

export async function cancelBudget(id: string, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "cancelled") {
    throw new Error("El presupuesto ya esta cancelado");
  }

  return repository.update(id, { status: "cancelled" }, userId);
}

export async function reactivateBudget(id: string, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "active") {
    throw new Error("El presupuesto ya esta activo");
  }

  return repository.update(id, { status: "active" }, userId);
}

export async function getContributions(id: string, userId?: string | null) {
  const budget = await repository.findById(id, userId);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  return repository.getContributions(id, userId);
}
