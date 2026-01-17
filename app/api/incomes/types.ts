import type { Income, Currency, Account, Job } from "@prisma/client";

export type { Income };

// job is optional (null = "Ingreso Extra")
export interface IncomeWithRelations extends Income {
  job: Job | null;
  account: Account;
  currency: Currency;
}

// jobId is optional for extra incomes
export interface CreateIncomeInput {
  jobId?: string | null;
  accountId: string;
  amount: number;
  currencyId: string;
  officialRate?: number;
  customRate?: number;
  date?: Date;
  description?: string;
  // Change (vuelto) system
  hasChange?: boolean;
  changeAmount?: number;
  changeAccountId?: string;
  changeCurrencyId?: string;
}

export interface UpdateIncomeInput {
  jobId?: string | null;
  accountId?: string;
  amount?: number;
  currencyId?: string;
  officialRate?: number | null;
  customRate?: number | null;
  date?: Date;
  description?: string | null;
  // Change (vuelto) system
  hasChange?: boolean;
  changeAmount?: number | null;
  changeAccountId?: string | null;
  changeCurrencyId?: string | null;
}

export interface IncomeFilters {
  jobId?: string;
  accountId?: string;
  currencyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IncomeSummary {
  totalAmount: number;
  count: number;
  byJob: { jobId: string; jobName: string; total: number }[];
  byCurrency: { currencyId: string; currencyCode: string; total: number }[];
}
