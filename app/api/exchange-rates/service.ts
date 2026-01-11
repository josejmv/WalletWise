import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateExchangeRateInput,
  UpdateExchangeRateInput,
  ExchangeRateFilters,
  ConversionResult,
  SyncResult,
} from "./types";
import {
  canSyncRates,
  canSyncOfficialRates,
  canSyncBinanceRates,
  updateLastRateSyncAt,
  updateLastOfficialSyncAt,
  updateLastBinanceSyncAt,
} from "@/app/api/user-config/service";
import {
  fetchBinanceP2PRate,
  CRYPTO_ASSETS,
  BINANCE_FIATS,
} from "@/lib/exchange-rates";

export async function getExchangeRates(filters?: ExchangeRateFilters) {
  return repository.findAll(filters);
}

export async function getLatestRates() {
  return repository.findLatestAll();
}

export async function getExchangeRateById(id: string) {
  const rate = await repository.findById(id);
  if (!rate) {
    throw new Error("Tasa de cambio no encontrada");
  }
  return rate;
}

export async function getLatestRate(
  fromCurrencyId: string,
  toCurrencyId: string,
) {
  const rate = await repository.findLatest(fromCurrencyId, toCurrencyId);
  if (!rate) {
    throw new Error("No hay tasa de cambio registrada para estas monedas");
  }
  return rate;
}

export async function createExchangeRate(data: CreateExchangeRateInput) {
  if (data.fromCurrencyId === data.toCurrencyId) {
    throw new Error("Las monedas de origen y destino deben ser diferentes");
  }

  const fromCurrency = await prisma.currency.findUnique({
    where: { id: data.fromCurrencyId },
  });
  if (!fromCurrency) {
    throw new Error("Moneda de origen no encontrada");
  }

  const toCurrency = await prisma.currency.findUnique({
    where: { id: data.toCurrencyId },
  });
  if (!toCurrency) {
    throw new Error("Moneda de destino no encontrada");
  }

  return repository.create(data);
}

export async function updateExchangeRate(
  id: string,
  data: UpdateExchangeRateInput,
) {
  const rate = await repository.findById(id);
  if (!rate) {
    throw new Error("Tasa de cambio no encontrada");
  }

  return repository.update(id, data);
}

export async function deleteExchangeRate(id: string) {
  const rate = await repository.findById(id);
  if (!rate) {
    throw new Error("Tasa de cambio no encontrada");
  }

  return repository.remove(id);
}

export async function convert(
  fromCurrencyId: string,
  toCurrencyId: string,
  amount: number,
): Promise<ConversionResult> {
  if (fromCurrencyId === toCurrencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: fromCurrencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
    return {
      fromAmount: amount,
      toAmount: amount,
      rate: 1,
      fromCurrency: currency,
      toCurrency: currency,
    };
  }

  const rate = await repository.findLatest(fromCurrencyId, toCurrencyId);
  if (!rate) {
    const inverseRate = await repository.findLatest(
      toCurrencyId,
      fromCurrencyId,
    );
    if (!inverseRate) {
      throw new Error("No hay tasa de cambio registrada para estas monedas");
    }
    const inverseRateValue = 1 / Number(inverseRate.rate);
    return {
      fromAmount: amount,
      toAmount: amount * inverseRateValue,
      rate: inverseRateValue,
      fromCurrency: inverseRate.toCurrency,
      toCurrency: inverseRate.fromCurrency,
    };
  }

  return {
    fromAmount: amount,
    toAmount: amount * Number(rate.rate),
    rate: Number(rate.rate),
    fromCurrency: rate.fromCurrency,
    toCurrency: rate.toCurrency,
  };
}

export async function getHistory(
  fromCurrencyId: string,
  toCurrencyId: string,
  limit?: number,
) {
  return repository.getHistory(fromCurrencyId, toCurrencyId, limit);
}

// ExchangeRate-API integration
const EXCHANGE_API_URL = "https://open.er-api.com/v6/latest";

interface ExchangeAPIResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

/**
 * Check if sync is allowed (6 hour cooldown)
 */
export async function checkSyncCooldown(): Promise<{
  canSync: boolean;
  nextSyncAt?: Date;
  lastSyncAt?: Date;
}> {
  return canSyncRates();
}

/**
 * Create a sync log entry
 */
async function createSyncLog(
  source: "official" | "binance",
  status: "success" | "error",
  ratesCount: number,
  message?: string,
) {
  return prisma.exchangeRateSyncLog.create({
    data: {
      source,
      status,
      ratesCount,
      message,
    },
  });
}

/**
 * Sync rates from official API (er-api.com)
 * Only syncs fiat currencies (USD, COP, VES)
 */
export async function syncFromAPI(): Promise<SyncResult> {
  const errors: string[] = [];
  let synced = 0;

  try {
    // Check cooldown (separate for official rates)
    const cooldownCheck = await canSyncOfficialRates();
    if (!cooldownCheck.canSync) {
      const nextSync = cooldownCheck.nextSyncAt
        ? cooldownCheck.nextSyncAt.toLocaleString("es-CO")
        : "desconocido";
      return {
        synced: 0,
        errors: [
          `Debes esperar hasta ${nextSync} para sincronizar tasas oficiales`,
        ],
        source: "official",
      };
    }

    // Get fiat currencies only (exclude crypto)
    const currencies = await prisma.currency.findMany({
      where: {
        code: {
          notIn: [...CRYPTO_ASSETS],
        },
      },
    });

    if (currencies.length === 0) {
      await createSyncLog(
        "official",
        "error",
        0,
        "No hay monedas fiat registradas",
      );
      return {
        synced: 0,
        errors: ["No hay monedas fiat registradas"],
        source: "official",
      };
    }

    // Find the base currency (USD typically)
    const baseCurrency = currencies.find((c) => c.isBase) || currencies[0];

    // Fetch rates from API using base currency
    const response = await fetch(`${EXCHANGE_API_URL}/${baseCurrency.code}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ExchangeAPIResponse = await response.json();
    if (data.result !== "success") {
      throw new Error("API returned error");
    }

    // Create exchange rates for all fiat currency pairs
    const now = new Date();
    for (const targetCurrency of currencies) {
      if (targetCurrency.id === baseCurrency.id) continue;

      const rate = data.rates[targetCurrency.code];
      if (!rate) {
        errors.push(`No se encontro tasa para ${targetCurrency.code}`);
        continue;
      }

      // Create rate from base to target with source=official
      await repository.create({
        fromCurrencyId: baseCurrency.id,
        toCurrencyId: targetCurrency.id,
        rate,
        source: "official",
        fetchedAt: now,
      });
      synced++;

      // Create inverse rate automatically
      await repository.create({
        fromCurrencyId: targetCurrency.id,
        toCurrencyId: baseCurrency.id,
        rate: 1 / rate,
        source: "official",
        fetchedAt: now,
      });
      synced++;
    }

    // Update last official sync timestamp
    await updateLastOfficialSyncAt();

    // Log sync
    await createSyncLog(
      "official",
      errors.length > 0 ? "error" : "success",
      synced,
      errors.length > 0 ? errors.join("; ") : undefined,
    );

    return { synced, errors, source: "official" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al sincronizar";
    errors.push(message);
    await createSyncLog("official", "error", synced, message);
    return { synced, errors, source: "official" };
  }
}

/**
 * Sync rates from Binance P2P
 * Syncs crypto/fiat pairs (USDT, BTC, etc. to USD, COP, VES)
 */
export async function syncFromBinance(): Promise<SyncResult> {
  const errors: string[] = [];
  let synced = 0;

  try {
    // Check cooldown (separate for Binance rates)
    const cooldownCheck = await canSyncBinanceRates();
    if (!cooldownCheck.canSync) {
      const nextSync = cooldownCheck.nextSyncAt
        ? cooldownCheck.nextSyncAt.toLocaleString("es-CO")
        : "desconocido";
      return {
        synced: 0,
        errors: [
          `Debes esperar hasta ${nextSync} para sincronizar tasas Binance`,
        ],
        source: "binance",
      };
    }

    // Get all currencies from database
    const currencies = await prisma.currency.findMany();

    // Map currency codes to IDs
    const currencyMap = new Map(currencies.map((c) => [c.code, c.id]));

    const now = new Date();

    // Fetch rates for each crypto/fiat pair
    for (const crypto of CRYPTO_ASSETS) {
      const cryptoId = currencyMap.get(crypto);
      if (!cryptoId) {
        errors.push(`Moneda ${crypto} no encontrada en BD`);
        continue;
      }

      for (const fiat of BINANCE_FIATS) {
        const fiatId = currencyMap.get(fiat);
        if (!fiatId) {
          errors.push(`Moneda ${fiat} no encontrada en BD`);
          continue;
        }

        // Fetch rate from Binance P2P (SELL = crypto to fiat)
        const rate = await fetchBinanceP2PRate(crypto, fiat, "SELL");

        if (rate === null) {
          errors.push(`No se pudo obtener tasa ${crypto}/${fiat}`);
          continue;
        }

        // Create rate from crypto to fiat
        await repository.create({
          fromCurrencyId: cryptoId,
          toCurrencyId: fiatId,
          rate,
          source: "binance",
          fetchedAt: now,
        });
        synced++;

        // Create inverse rate automatically (fiat to crypto)
        await repository.create({
          fromCurrencyId: fiatId,
          toCurrencyId: cryptoId,
          rate: 1 / rate,
          source: "binance",
          fetchedAt: now,
        });
        synced++;
      }
    }

    // v1.3.0: Create fixed USDT-USD = 1 rate (and inverse)
    const usdtId = currencyMap.get("USDT");
    const usdId = currencyMap.get("USD");
    if (usdtId && usdId) {
      // USDT -> USD = 1
      await repository.create({
        fromCurrencyId: usdtId,
        toCurrencyId: usdId,
        rate: 1,
        source: "binance", // Using binance as source since it's part of crypto sync
        fetchedAt: now,
      });
      synced++;

      // USD -> USDT = 1
      await repository.create({
        fromCurrencyId: usdId,
        toCurrencyId: usdtId,
        rate: 1,
        source: "binance",
        fetchedAt: now,
      });
      synced++;
    }

    // Update last Binance sync timestamp
    await updateLastBinanceSyncAt();

    // Log sync
    await createSyncLog(
      "binance",
      errors.length > 0 ? "error" : "success",
      synced,
      errors.length > 0 ? errors.join("; ") : undefined,
    );

    return { synced, errors, source: "binance" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al sincronizar Binance";
    errors.push(message);
    await createSyncLog("binance", "error", synced, message);
    return { synced, errors, source: "binance" };
  }
}

/**
 * Get sync logs with pagination
 */
export async function getSyncLogs(limit: number = 20) {
  return prisma.exchangeRateSyncLog.findMany({
    orderBy: { syncedAt: "desc" },
    take: limit,
  });
}
