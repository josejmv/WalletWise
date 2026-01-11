import type {
  Budget,
  Currency,
  Account,
  BudgetType,
  BudgetStatus,
  BudgetContribution,
} from "@prisma/client";

export type { Budget, BudgetType, BudgetStatus, BudgetContribution };

export interface BudgetWithRelations extends Budget {
  currency: Currency;
  account: Account;
  contributions: BudgetContribution[];
}

export interface CreateBudgetInput {
  name: string;
  type: BudgetType;
  // v1.3.0: targetAmount is optional (budgets without goal)
  targetAmount?: number | null;
  currentAmount?: number;
  currencyId: string;
  accountId: string; // Ahora requerido para ambos tipos
  deadline?: Date;
  status?: BudgetStatus;
}

export interface UpdateBudgetInput {
  name?: string;
  type?: BudgetType;
  // v1.3.0: targetAmount can be null to remove goal
  targetAmount?: number | null;
  currentAmount?: number;
  currencyId?: string;
  accountId?: string;
  deadline?: Date | null;
  status?: BudgetStatus;
}

export interface BudgetFilters {
  type?: BudgetType;
  status?: BudgetStatus;
  currencyId?: string;
  accountId?: string;
}

export interface ContributeInput {
  amount: number;
  fromAccountId: string; // Cuenta de donde viene la contribucion
  description?: string;
}

export interface WithdrawInput {
  amount: number;
  toAccountId: string; // Cuenta a donde va el retiro
  description?: string;
}
