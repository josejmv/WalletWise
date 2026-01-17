import type {
  Expense,
  Currency,
  Account,
  Category,
  ExpensePeriodicity,
} from "@prisma/client";

export type { Expense, ExpensePeriodicity };

export interface ExpenseWithRelations extends Expense {
  category: Category;
  account: Account;
  currency: Currency;
}

export interface CreateExpenseInput {
  categoryId: string;
  accountId: string;
  amount: number;
  currencyId: string;
  officialRate?: number;
  customRate?: number;
  isRecurring?: boolean;
  periodicity?: ExpensePeriodicity;
  nextDueDate?: Date;
  date?: Date;
  description?: string;
  // Change (vuelto) system
  hasChange?: boolean;
  changeAmount?: number;
  changeAccountId?: string;
  changeCurrencyId?: string;
}

export interface UpdateExpenseInput {
  categoryId?: string;
  accountId?: string;
  amount?: number;
  currencyId?: string;
  officialRate?: number | null;
  customRate?: number | null;
  isRecurring?: boolean;
  periodicity?: ExpensePeriodicity | null;
  nextDueDate?: Date | null;
  date?: Date;
  description?: string | null;
  // Change (vuelto) system
  hasChange?: boolean;
  changeAmount?: number | null;
  changeAccountId?: string | null;
  changeCurrencyId?: string | null;
}

export interface ExpenseFilters {
  categoryId?: string;
  accountId?: string;
  currencyId?: string;
  isRecurring?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface ExpenseSummary {
  totalAmount: number;
  count: number;
  byCategory: { categoryId: string; categoryName: string; total: number }[];
  byCurrency: { currencyId: string; currencyCode: string; total: number }[];
}
