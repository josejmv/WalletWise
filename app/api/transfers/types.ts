import type { Transfer, Currency, Account } from "@prisma/client";

export type { Transfer };

export interface TransferWithRelations extends Transfer {
  fromAccount: Account;
  toAccount: Account;
  currency: Currency;
}

export interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currencyId: string;
  exchangeRate?: number;
  date?: Date;
  description?: string;
}

export interface UpdateTransferInput {
  fromAccountId?: string;
  toAccountId?: string;
  amount?: number;
  currencyId?: string;
  exchangeRate?: number | null;
  date?: Date;
  description?: string | null;
}

export interface TransferFilters {
  fromAccountId?: string;
  toAccountId?: string;
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
