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

export async function getAccountWithBlockedBalance(id: string) {
  const account = await repository.findById(id);
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  // Get active budgets linked to this account
  const budgets = await prisma.budget.findMany({
    where: {
      accountId: id,
      status: { in: ["active", "completed"] },
    },
    select: {
      id: true,
      name: true,
      type: true,
      currentAmount: true,
      targetAmount: true,
      status: true,
    },
  });

  const blockedBalance = budgets.reduce(
    (sum, budget) => sum + Number(budget.currentAmount),
    0,
  );

  const totalBalance = Number(account.balance);
  // Available balance should never be negative (minimum 0)
  const availableBalance = Math.max(0, totalBalance - blockedBalance);

  return {
    ...account,
    totalBalance,
    availableBalance,
    blockedBalance,
    budgets,
  };
}

export async function getAccountsWithBlockedBalances() {
  const accounts = await repository.findAll();

  // Get all active budgets grouped by account
  const budgets = await prisma.budget.findMany({
    where: {
      status: { in: ["active", "completed"] },
    },
    select: {
      id: true,
      name: true,
      type: true,
      currentAmount: true,
      targetAmount: true,
      status: true,
      accountId: true,
    },
  });

  // Group budgets by account
  const budgetsByAccount = new Map<string, typeof budgets>();
  for (const budget of budgets) {
    const existing = budgetsByAccount.get(budget.accountId) || [];
    existing.push(budget);
    budgetsByAccount.set(budget.accountId, existing);
  }

  return accounts.map((account) => {
    const accountBudgets = budgetsByAccount.get(account.id) || [];
    const blockedBalance = accountBudgets.reduce(
      (sum, budget) => sum + Number(budget.currentAmount),
      0,
    );
    const totalBalance = Number(account.balance);
    // Available balance should never be negative (minimum 0)
    const availableBalance = Math.max(0, totalBalance - blockedBalance);

    return {
      ...account,
      totalBalance,
      availableBalance,
      blockedBalance,
      budgetsCount: accountBudgets.length,
    };
  });
}
