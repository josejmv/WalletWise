import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetFilters,
  ContributeInput,
} from "./types";

export async function getBudgets(filters?: BudgetFilters) {
  return repository.findAll(filters);
}

export async function getActiveBudgets() {
  return repository.findActive();
}

export async function getBudgetById(id: string) {
  const budget = await repository.findById(id);
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

  if (data.accountId) {
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });
    if (!account) {
      throw new Error("Cuenta no encontrada");
    }
  }

  if (data.type === "envelope" && !data.accountId) {
    throw new Error(
      "Los presupuestos tipo envelope requieren una cuenta asociada",
    );
  }

  return repository.create(data);
}

export async function updateBudget(id: string, data: UpdateBudgetInput) {
  const budget = await repository.findById(id);
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
  }

  const newType = data.type ?? budget.type;
  const newAccountId =
    data.accountId !== undefined ? data.accountId : budget.accountId;

  if (newType === "envelope" && !newAccountId) {
    throw new Error(
      "Los presupuestos tipo envelope requieren una cuenta asociada",
    );
  }

  return repository.update(id, data);
}

export async function deleteBudget(id: string) {
  const budget = await repository.findById(id);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  return repository.remove(id);
}

export async function contributeToBudget(id: string, data: ContributeInput) {
  const budget = await repository.findById(id);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "completed") {
    throw new Error("No se puede contribuir a un presupuesto completado");
  }

  if (budget.status === "cancelled") {
    throw new Error("No se puede contribuir a un presupuesto cancelado");
  }

  return repository.contribute(id, data.amount, data.description);
}

export async function withdrawFromBudget(id: string, data: ContributeInput) {
  const budget = await repository.findById(id);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "cancelled") {
    throw new Error("No se puede retirar de un presupuesto cancelado");
  }

  const currentAmount = Number(budget.currentAmount);
  if (data.amount > currentAmount) {
    throw new Error(
      `No hay suficiente saldo. Saldo actual: ${currentAmount}, intentando retirar: ${data.amount}`,
    );
  }

  return repository.withdraw(id, data.amount, data.description);
}

export async function cancelBudget(id: string) {
  const budget = await repository.findById(id);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "cancelled") {
    throw new Error("El presupuesto ya esta cancelado");
  }

  return repository.update(id, { status: "cancelled" });
}

export async function reactivateBudget(id: string) {
  const budget = await repository.findById(id);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  if (budget.status === "active") {
    throw new Error("El presupuesto ya esta activo");
  }

  return repository.update(id, { status: "active" });
}

export async function getContributions(id: string) {
  const budget = await repository.findById(id);
  if (!budget) {
    throw new Error("Presupuesto no encontrado");
  }

  return repository.getContributions(id);
}
