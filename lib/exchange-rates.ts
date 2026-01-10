import type { ExchangeRateSource } from "@prisma/client";

export interface RateConversion {
  fromAmount: number;
  toAmount: number;
  rate: number;
  source: ExchangeRateSource;
}

export interface RateComparison {
  officialRate: number;
  customRate: number;
  difference: number;
  differencePercent: number;
  isSaving: boolean; // true if custom rate is better for the user
}

/**
 * Calculate the converted amount using a given rate
 */
export function calculateConversion(amount: number, rate: number): number {
  return amount * rate;
}

/**
 * Compare official rate vs custom rate and calculate savings/extra
 * @param officialRate - The rate from API (official or binance)
 * @param customRate - The rate entered by user
 * @param amount - Amount being converted
 * @param isFromBase - true if converting FROM base currency (selling base)
 * @returns Comparison with difference and whether it's a saving
 */
export function compareRates(
  officialRate: number,
  customRate: number,
  amount: number,
  isFromBase: boolean = true,
): RateComparison {
  const officialConverted = amount * officialRate;
  const customConverted = amount * customRate;

  const difference = customConverted - officialConverted;
  const differencePercent =
    officialRate !== 0 ? ((customRate - officialRate) / officialRate) * 100 : 0;

  // If selling base currency (e.g., USD to COP), higher rate = more received = saving
  // If buying base currency (e.g., COP to USD), lower rate = less spent = saving
  const isSaving = isFromBase ? difference > 0 : difference < 0;

  return {
    officialRate,
    customRate,
    difference: Math.abs(difference),
    differencePercent: Math.abs(differencePercent),
    isSaving,
  };
}

/**
 * Format rate for display with appropriate decimal places
 */
export function formatRate(rate: number, decimals: number = 4): string {
  if (rate >= 1000) {
    return rate.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return rate.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency amount for display
 */
export function formatAmount(
  amount: number,
  currencySymbol: string,
  locale: string = "es-CO",
): string {
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol}${formatted}`;
}

/**
 * Get the inverse rate (for reverse conversion)
 */
export function getInverseRate(rate: number): number {
  if (rate === 0) return 0;
  return 1 / rate;
}

/**
 * Binance P2P API types and helpers
 */
export interface BinanceP2PAdv {
  price: string;
  surplusAmount: string;
  tradableQuantity: string;
  maxSingleTransAmount: string;
  minSingleTransAmount: string;
}

export interface BinanceP2PResponse {
  code: string;
  message: string | null;
  messageDetail: string | null;
  data: Array<{
    adv: BinanceP2PAdv;
  }>;
  total: number;
  success: boolean;
}

export interface BinanceP2PRequest {
  asset: string;
  fiat: string;
  tradeType: "BUY" | "SELL";
  page?: number;
  rows?: number;
  payTypes?: string[];
}

/**
 * Fetch P2P rates from Binance
 * @param asset - Crypto asset (USDT, BTC, etc.)
 * @param fiat - Fiat currency (VES, COP, USD)
 * @param tradeType - BUY or SELL
 * @returns Average rate from top listings
 */
export async function fetchBinanceP2PRate(
  asset: string,
  fiat: string,
  tradeType: "BUY" | "SELL" = "BUY",
): Promise<number | null> {
  try {
    const response = await fetch(
      "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset,
          fiat,
          tradeType,
          page: 1,
          rows: 10,
          payTypes: [],
          publisherType: null,
        } as BinanceP2PRequest),
      },
    );

    if (!response.ok) {
      console.error(`Binance P2P API error: ${response.status}`);
      return null;
    }

    const data: BinanceP2PResponse = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Calculate average of top 5 listings
    const prices = data.data
      .slice(0, 5)
      .map((item) => parseFloat(item.adv.price))
      .filter((price) => !isNaN(price));

    if (prices.length === 0) {
      return null;
    }

    const average =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    return average;
  } catch (error) {
    console.error("Error fetching Binance P2P rate:", error);
    return null;
  }
}

/**
 * Crypto assets supported
 */
export const CRYPTO_ASSETS = ["USDT", "BTC", "ETH", "BNB", "SOL"] as const;

/**
 * Fiat currencies for Binance P2P
 */
export const BINANCE_FIATS = ["VES", "COP", "USD"] as const;

export type CryptoAsset = (typeof CRYPTO_ASSETS)[number];
export type BinanceFiat = (typeof BINANCE_FIATS)[number];
