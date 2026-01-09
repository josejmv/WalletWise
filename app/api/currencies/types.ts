import type { Currency } from "@prisma/client";

export type { Currency };

export interface CreateCurrencyInput {
  code: string;
  name: string;
  symbol: string;
  isBase?: boolean;
}

export interface UpdateCurrencyInput {
  code?: string;
  name?: string;
  symbol?: string;
  isBase?: boolean;
}

export interface CurrencyFilters {
  isBase?: boolean;
}
