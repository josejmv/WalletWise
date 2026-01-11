import { prisma } from "@/lib/prisma";
import type { ExchangeRateSource } from "@prisma/client";

export interface ConversionResult {
  convertedAmount: number;
  rate: number;
  source: ExchangeRateSource | "inverse";
  isInverse: boolean;
}

/**
 * Get the latest exchange rate between two currencies
 * Searches for direct rate first, then inverse if not found
 * @param fromCurrencyId - Source currency ID
 * @param toCurrencyId - Target currency ID
 * @returns Rate and metadata, or null if not found
 */
export async function getLatestRate(
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<{
  rate: number;
  source: ExchangeRateSource;
  isInverse: boolean;
} | null> {
  // Same currency = rate 1
  if (fromCurrencyId === toCurrencyId) {
    return { rate: 1, source: "official", isInverse: false };
  }

  // Try direct rate first
  const directRate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrencyId,
      toCurrencyId,
    },
    orderBy: { fetchedAt: "desc" },
  });

  if (directRate) {
    return {
      rate: Number(directRate.rate),
      source: directRate.source,
      isInverse: false,
    };
  }

  // Try inverse rate
  const inverseRate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrencyId: toCurrencyId,
      toCurrencyId: fromCurrencyId,
    },
    orderBy: { fetchedAt: "desc" },
  });

  if (inverseRate && Number(inverseRate.rate) !== 0) {
    return {
      rate: 1 / Number(inverseRate.rate),
      source: inverseRate.source,
      isInverse: true,
    };
  }

  return null;
}

/**
 * Get the latest rate by currency codes instead of IDs
 */
export async function getLatestRateByCode(
  fromCode: string,
  toCode: string,
): Promise<{
  rate: number;
  source: ExchangeRateSource;
  isInverse: boolean;
} | null> {
  // Same currency = rate 1
  if (fromCode === toCode) {
    return { rate: 1, source: "official", isInverse: false };
  }

  const [fromCurrency, toCurrency] = await Promise.all([
    prisma.currency.findUnique({ where: { code: fromCode } }),
    prisma.currency.findUnique({ where: { code: toCode } }),
  ]);

  if (!fromCurrency || !toCurrency) {
    return null;
  }

  return getLatestRate(fromCurrency.id, toCurrency.id);
}

/**
 * Convert an amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrencyId - Source currency ID
 * @param toCurrencyId - Target currency ID
 * @returns Conversion result with amount and metadata
 */
export async function convertAmount(
  amount: number,
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<ConversionResult | null> {
  const rateInfo = await getLatestRate(fromCurrencyId, toCurrencyId);

  if (!rateInfo) {
    return null;
  }

  return {
    convertedAmount: amount * rateInfo.rate,
    rate: rateInfo.rate,
    source: rateInfo.isInverse ? "inverse" : rateInfo.source,
    isInverse: rateInfo.isInverse,
  };
}

/**
 * Convert amount by currency codes
 */
export async function convertAmountByCode(
  amount: number,
  fromCode: string,
  toCode: string,
): Promise<ConversionResult | null> {
  const rateInfo = await getLatestRateByCode(fromCode, toCode);

  if (!rateInfo) {
    return null;
  }

  return {
    convertedAmount: amount * rateInfo.rate,
    rate: rateInfo.rate,
    source: rateInfo.isInverse ? "inverse" : rateInfo.source,
    isInverse: rateInfo.isInverse,
  };
}

/**
 * Get user's base currency ID
 */
export async function getUserBaseCurrencyId(): Promise<string> {
  const config = await prisma.userConfig.findFirst({
    select: { baseCurrencyId: true },
  });

  if (config) {
    return config.baseCurrencyId;
  }

  // Fallback: get currency marked as base
  const baseCurrency = await prisma.currency.findFirst({
    where: { isBase: true },
    select: { id: true },
  });

  if (baseCurrency) {
    return baseCurrency.id;
  }

  // Last resort: get USD
  const usd = await prisma.currency.findFirst({
    where: { code: "USD" },
    select: { id: true },
  });

  if (usd) {
    return usd.id;
  }

  throw new Error("No se encontro una moneda base configurada");
}

/**
 * Get user's base currency with full info
 */
export async function getUserBaseCurrency() {
  const config = await prisma.userConfig.findFirst({
    include: { baseCurrency: true },
  });

  if (config) {
    return config.baseCurrency;
  }

  // Fallback: get currency marked as base
  const baseCurrency = await prisma.currency.findFirst({
    where: { isBase: true },
  });

  if (baseCurrency) {
    return baseCurrency;
  }

  // Last resort: get USD
  const usd = await prisma.currency.findFirst({
    where: { code: "USD" },
  });

  if (usd) {
    return usd;
  }

  throw new Error("No se encontro una moneda base configurada");
}

/**
 * Convert multiple amounts to base currency in batch
 * More efficient than calling convertAmount multiple times
 * @param items - Array of items with amount and currencyId
 * @param baseCurrencyId - Target currency ID (user's base currency)
 * @returns Array with converted amounts
 */
export async function convertManyToBaseCurrency<
  T extends { amount: number | string; currencyId: string },
>(
  items: T[],
  baseCurrencyId: string,
): Promise<Array<T & { convertedAmount: number; rate: number | null }>> {
  // Get all unique currency pairs needed
  const currencyIds = [...new Set(items.map((i) => i.currencyId))];

  // Build a map of rates for each currency pair
  const ratesMap = new Map<string, number>();

  for (const fromCurrencyId of currencyIds) {
    if (fromCurrencyId === baseCurrencyId) {
      ratesMap.set(fromCurrencyId, 1);
    } else {
      const rateInfo = await getLatestRate(fromCurrencyId, baseCurrencyId);
      if (rateInfo) {
        ratesMap.set(fromCurrencyId, rateInfo.rate);
      }
    }
  }

  // Convert all items
  return items.map((item) => {
    const amount =
      typeof item.amount === "string" ? Number(item.amount) : item.amount;
    const rate = ratesMap.get(item.currencyId);

    if (rate === undefined) {
      // No rate found, return original amount
      return {
        ...item,
        convertedAmount: amount,
        rate: null,
      };
    }

    return {
      ...item,
      convertedAmount: amount * rate,
      rate,
    };
  });
}

/**
 * Calculate savings from using custom rate vs official rate
 * CORRECTED: custom < official = SAVINGS (user pays less)
 *
 * Example scenario (Venezuela):
 * - Product costs 100 USD
 * - Official rate: 50 VES/USD
 * - Custom rate: 45 VES/USD (better rate from merchant)
 * - At official: 100 * 50 = 5000 VES
 * - At custom: 100 * 45 = 4500 VES
 * - Savings: 5000 - 4500 = 500 VES (positive = saved money)
 *
 * @param amount - Amount in base currency (e.g., USD)
 * @param officialRate - Official exchange rate
 * @param customRate - Custom rate from merchant
 * @returns Savings amount (positive = saved, negative = paid extra)
 */
export function calculateSavings(
  amount: number,
  officialRate: number,
  customRate: number,
): number {
  // Savings = what you would pay at official - what you paid at custom
  // Positive = saved money, Negative = paid extra
  return amount * (officialRate - customRate);
}

/**
 * Determine if a custom rate represents savings
 * @param officialRate - Official exchange rate
 * @param customRate - Custom rate from merchant
 * @returns true if custom rate saves money
 */
export function isSavingsRate(
  officialRate: number,
  customRate: number,
): boolean {
  // Lower custom rate = less local currency spent = SAVINGS
  return customRate < officialRate;
}
