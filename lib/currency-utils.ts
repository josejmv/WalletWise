import { prisma } from "@/lib/prisma";
import type { ExchangeRateSource } from "@prisma/client";

// Extended source types to include intermediate routes
export type ConversionSource =
  | ExchangeRateSource
  | "inverse"
  | "intermediate_usd"
  | "intermediate_usdt";

export interface ConversionResult {
  convertedAmount: number;
  rate: number;
  source: ConversionSource;
  isInverse: boolean;
  // Track intermediate currency used for conversion
  intermediateRoute?: {
    currency: string;
    rate1: number; // from -> intermediate
    rate2: number; // intermediate -> to
  };
}

// Rate result with intermediate route info
export interface RateResult {
  rate: number;
  source: ExchangeRateSource;
  isInverse: boolean;
  intermediateRoute?: {
    currencyCode: string;
    rate1: number;
    rate2: number;
  };
}

/**
 * Get the latest exchange rate between two currencies
 * Searches for direct rate first, then inverse, then intermediate routes
 * v1.4.0: Added intermediate route support via USD and USDT
 * @param fromCurrencyId - Source currency ID
 * @param toCurrencyId - Target currency ID
 * @returns Rate and metadata, or null if not found
 */
export async function getLatestRate(
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<RateResult | null> {
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

  // Try intermediate routes (USD, USDT)
  const intermediateResult = await tryIntermediateRoutes(
    fromCurrencyId,
    toCurrencyId,
  );
  if (intermediateResult) {
    return intermediateResult;
  }

  return null;
}

/**
 * v1.5.0: Get rate via a specific intermediate currency
 * Forces the conversion to go through the specified intermediate
 * Example: getRateViaIntermediate(COP_ID, VES_ID, USD_ID) = COP -> USD -> VES
 */
export async function getRateViaIntermediate(
  fromCurrencyId: string,
  toCurrencyId: string,
  intermediateCurrencyId: string,
): Promise<RateResult | null> {
  // Same currency = rate 1
  if (fromCurrencyId === toCurrencyId) {
    return { rate: 1, source: "official", isInverse: false };
  }

  // Get intermediate currency code for display
  const intermediateCurrency = await prisma.currency.findUnique({
    where: { id: intermediateCurrencyId },
    select: { code: true },
  });

  if (!intermediateCurrency) {
    return null;
  }

  // Get rate1: from -> intermediate
  const rate1Result = await getDirectOrInverseRate(
    fromCurrencyId,
    intermediateCurrencyId,
  );
  if (!rate1Result) return null;

  // Get rate2: intermediate -> to
  const rate2Result = await getDirectOrInverseRate(
    intermediateCurrencyId,
    toCurrencyId,
  );
  if (!rate2Result) return null;

  // Calculate combined rate
  const combinedRate = rate1Result.rate * rate2Result.rate;

  return {
    rate: combinedRate,
    source: rate1Result.source,
    isInverse: false,
    intermediateRoute: {
      currencyCode: intermediateCurrency.code,
      rate1: rate1Result.rate,
      rate2: rate2Result.rate,
    },
  };
}

/**
 * v1.4.0: Try to find a conversion rate via intermediate currencies (USD, USDT)
 * This is useful when no direct or inverse rate exists between two currencies
 * Example: COP -> VES via COP -> USD -> VES
 */
async function tryIntermediateRoutes(
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<RateResult | null> {
  // Get intermediate currencies (USD and USDT)
  const intermediateCurrencies = await prisma.currency.findMany({
    where: {
      code: { in: ["USD", "USDT"] },
    },
    select: { id: true, code: true },
  });

  // Try each intermediate currency
  for (const intermediate of intermediateCurrencies) {
    // Skip if the intermediate is one of the currencies we're converting
    if (
      intermediate.id === fromCurrencyId ||
      intermediate.id === toCurrencyId
    ) {
      continue;
    }

    // Try to get rate1: from -> intermediate
    const rate1Result = await getDirectOrInverseRate(
      fromCurrencyId,
      intermediate.id,
    );
    if (!rate1Result) continue;

    // Try to get rate2: intermediate -> to
    const rate2Result = await getDirectOrInverseRate(
      intermediate.id,
      toCurrencyId,
    );
    if (!rate2Result) continue;

    // Calculate combined rate
    const combinedRate = rate1Result.rate * rate2Result.rate;

    return {
      rate: combinedRate,
      source: rate1Result.source, // Use the source of the first leg
      isInverse: false,
      intermediateRoute: {
        currencyCode: intermediate.code,
        rate1: rate1Result.rate,
        rate2: rate2Result.rate,
      },
    };
  }

  return null;
}

/**
 * v1.4.0: Helper to get direct or inverse rate without trying intermediate routes
 * Used internally by tryIntermediateRoutes to avoid infinite recursion
 */
async function getDirectOrInverseRate(
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<{ rate: number; source: ExchangeRateSource } | null> {
  if (fromCurrencyId === toCurrencyId) {
    return { rate: 1, source: "official" };
  }

  // Try direct rate
  const directRate = await prisma.exchangeRate.findFirst({
    where: { fromCurrencyId, toCurrencyId },
    orderBy: { fetchedAt: "desc" },
  });

  if (directRate) {
    return {
      rate: Number(directRate.rate),
      source: directRate.source,
    };
  }

  // Try inverse rate
  const inverseRate = await prisma.exchangeRate.findFirst({
    where: { fromCurrencyId: toCurrencyId, toCurrencyId: fromCurrencyId },
    orderBy: { fetchedAt: "desc" },
  });

  if (inverseRate && Number(inverseRate.rate) !== 0) {
    return {
      rate: 1 / Number(inverseRate.rate),
      source: inverseRate.source,
    };
  }

  return null;
}

/**
 * Get the latest rate by currency codes instead of IDs
 * v1.4.0: Updated return type to include intermediate route info
 */
export async function getLatestRateByCode(
  fromCode: string,
  toCode: string,
): Promise<RateResult | null> {
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
 * v1.4.0: Updated to include intermediate route info
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

  // Determine source type including intermediate routes
  let source: ConversionSource;
  if (rateInfo.isInverse) {
    source = "inverse";
  } else if (rateInfo.intermediateRoute) {
    source =
      rateInfo.intermediateRoute.currencyCode === "USD"
        ? "intermediate_usd"
        : "intermediate_usdt";
  } else {
    source = rateInfo.source;
  }

  return {
    convertedAmount: amount * rateInfo.rate,
    rate: rateInfo.rate,
    source,
    isInverse: rateInfo.isInverse,
    intermediateRoute: rateInfo.intermediateRoute
      ? {
          currency: rateInfo.intermediateRoute.currencyCode,
          rate1: rateInfo.intermediateRoute.rate1,
          rate2: rateInfo.intermediateRoute.rate2,
        }
      : undefined,
  };
}

/**
 * Convert amount by currency codes
 * v1.4.0: Updated to include intermediate route info
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

  // Determine source type including intermediate routes
  let source: ConversionSource;
  if (rateInfo.isInverse) {
    source = "inverse";
  } else if (rateInfo.intermediateRoute) {
    source =
      rateInfo.intermediateRoute.currencyCode === "USD"
        ? "intermediate_usd"
        : "intermediate_usdt";
  } else {
    source = rateInfo.source;
  }

  return {
    convertedAmount: amount * rateInfo.rate,
    rate: rateInfo.rate,
    source,
    isInverse: rateInfo.isInverse,
    intermediateRoute: rateInfo.intermediateRoute
      ? {
          currency: rateInfo.intermediateRoute.currencyCode,
          rate1: rateInfo.intermediateRoute.rate1,
          rate2: rateInfo.intermediateRoute.rate2,
        }
      : undefined,
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
 * v1.3.0: Convert transactions using custom rates when available
 * Falls back to database rates if no custom rate is present
 * @param items - Array of items with amount, currencyId, and optional customRate
 * @param baseCurrencyId - Target currency ID (user's base currency)
 * @returns Array with converted amounts
 */
export async function convertManyWithCustomRates<
  T extends {
    amount: number | string;
    currencyId: string;
    customRate?: number | null;
  },
>(
  items: T[],
  baseCurrencyId: string,
): Promise<Array<T & { convertedAmount: number; rate: number | null }>> {
  // Get all unique currency pairs needed (for items without custom rate)
  const currencyIds = [...new Set(items.map((i) => i.currencyId))];

  // Build a map of fallback rates for each currency pair
  const fallbackRatesMap = new Map<string, number>();

  for (const fromCurrencyId of currencyIds) {
    if (fromCurrencyId === baseCurrencyId) {
      fallbackRatesMap.set(fromCurrencyId, 1);
    } else {
      const rateInfo = await getLatestRate(fromCurrencyId, baseCurrencyId);
      if (rateInfo) {
        fallbackRatesMap.set(fromCurrencyId, rateInfo.rate);
      }
    }
  }

  // Convert all items using custom rate if available, fallback otherwise
  return items.map((item) => {
    const amount =
      typeof item.amount === "string" ? Number(item.amount) : item.amount;

    // If same currency, no conversion needed
    if (item.currencyId === baseCurrencyId) {
      return {
        ...item,
        convertedAmount: amount,
        rate: 1,
      };
    }

    // Use custom rate if available
    if (item.customRate && item.customRate > 0) {
      // Custom rate is stored as: fromCurrency -> toCurrency (e.g., USD -> VES)
      // To convert back to base, we use the inverse
      const convertedAmount = amount * Number(item.customRate);
      return {
        ...item,
        convertedAmount,
        rate: Number(item.customRate),
      };
    }

    // Fallback to database rate
    const rate = fallbackRatesMap.get(item.currencyId);
    if (rate === undefined) {
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
