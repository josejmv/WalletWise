import type {
  ExchangeRate,
  Currency,
  ExchangeRateSource,
} from "@prisma/client";

export type { ExchangeRate };

export interface ExchangeRateWithCurrencies extends ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
}

export interface CreateExchangeRateInput {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  source?: ExchangeRateSource;
  fetchedAt?: Date;
}

export interface UpdateExchangeRateInput {
  rate: number;
  source?: ExchangeRateSource;
}

export interface ExchangeRateFilters {
  fromCurrencyId?: string;
  toCurrencyId?: string;
  source?: ExchangeRateSource;
}

export interface ConversionResult {
  fromAmount: number;
  toAmount: number;
  rate: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  source?: ExchangeRateSource;
}

export interface SyncResult {
  synced: number;
  errors: string[];
  source: ExchangeRateSource;
}
