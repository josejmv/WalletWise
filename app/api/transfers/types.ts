import type {
  Transfer,
  Currency,
  Account,
  Budget,
  TransferType,
} from "@prisma/client";

export type { Transfer, TransferType };

export interface TransferWithRelations extends Transfer {
  fromAccount: Account | null;
  toAccount: Account | null;
  fromBudget?: Budget | null;
  toBudget?: Budget | null;
  currency: Currency;
}

export interface CreateTransferInput {
  type?: TransferType;
  fromAccountId?: string;
  toAccountId?: string;
  fromBudgetId?: string;
  toBudgetId?: string;
  amount: number;
  currencyId: string;
  exchangeRate?: number;
  officialRate?: number;
  customRate?: number;
  date?: Date;
  description?: string;
}

export interface UpdateTransferInput {
  type?: TransferType;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  fromBudgetId?: string | null;
  toBudgetId?: string | null;
  amount?: number;
  currencyId?: string;
  exchangeRate?: number | null;
  officialRate?: number | null;
  customRate?: number | null;
  date?: Date;
  description?: string | null;
}

export interface TransferFilters {
  type?: TransferType;
  fromAccountId?: string;
  toAccountId?: string;
  fromBudgetId?: string;
  toBudgetId?: string;
  currencyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TransferSummary {
  totalAmount: number;
  count: number;
  byFromAccount: { accountId: string; accountName: string; total: number }[];
  byToAccount: { accountId: string; accountName: string; total: number }[];
}
