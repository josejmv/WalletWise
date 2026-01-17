import type { AccountType, AccountTypeEnum } from "@prisma/client";

export type { AccountType, AccountTypeEnum };

export interface CreateAccountTypeInput {
  name: string;
  type: AccountTypeEnum;
  description?: string;
}

export interface UpdateAccountTypeInput {
  name?: string;
  description?: string;
  // Allow toggling active status
  isActive?: boolean;
}
