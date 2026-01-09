import type { Account, AccountType, Currency } from "@prisma/client";

export type { Account };

export interface AccountWithRelations extends Account {
  accountType: AccountType;
  currency: Currency;
}

export interface CreateAccountInput {
  name: string;
  accountTypeId: string;
  currencyId: string;
  balance?: number;
  isActive?: boolean;
}

export interface UpdateAccountInput {
  name?: string;
  accountTypeId?: string;
  currencyId?: string;
  balance?: number;
  isActive?: boolean;
}

export interface AccountFilters {
  accountTypeId?: string;
  currencyId?: string;
  isActive?: boolean;
}
