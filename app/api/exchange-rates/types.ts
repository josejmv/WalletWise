import type { ExchangeRate, Currency } from "@prisma/client";

export type { ExchangeRate };

export interface ExchangeRateWithCurrencies extends ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
}

export interface CreateExchangeRateInput {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
}

export interface UpdateExchangeRateInput {
  rate: number;
}

export interface ExchangeRateFilters {
  fromCurrencyId?: string;
  toCurrencyId?: string;
}

export interface ConversionResult {
  fromAmount: number;
  toAmount: number;
  rate: number;
  fromCurrency: Currency;
  toCurrency: Currency;
}
