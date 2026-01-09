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
  account: Account | null;
  contributions: BudgetContribution[];
}

export interface CreateBudgetInput {
  name: string;
  type: BudgetType;
  targetAmount: number;
  currentAmount?: number;
  currencyId: string;
  accountId?: string;
  deadline?: Date;
  status?: BudgetStatus;
}

export interface UpdateBudgetInput {
  name?: string;
  type?: BudgetType;
  targetAmount?: number;
  currentAmount?: number;
  currencyId?: string;
  accountId?: string | null;
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
  description?: string;
}
