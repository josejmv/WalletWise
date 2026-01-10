import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateExchangeRateInput,
  UpdateExchangeRateInput,
  ExchangeRateFilters,
  ConversionResult,
} from "./types";

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

export async function syncFromAPI(): Promise<{
  synced: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let synced = 0;

  try {
    // Get all currencies from the database
    const currencies = await prisma.currency.findMany();
    if (currencies.length === 0) {
      return { synced: 0, errors: ["No hay monedas registradas"] };
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

    // Create exchange rates for all currency pairs
    const now = new Date();
    for (const targetCurrency of currencies) {
      if (targetCurrency.id === baseCurrency.id) continue;

      const rate = data.rates[targetCurrency.code];
      if (!rate) {
        errors.push(`No se encontro tasa para ${targetCurrency.code}`);
        continue;
      }

      // Create rate from base to target
      await repository.create({
        fromCurrencyId: baseCurrency.id,
        toCurrencyId: targetCurrency.id,
        rate,
        fetchedAt: now,
      });
      synced++;
    }

    return { synced, errors };
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Error al sincronizar",
    );
    return { synced, errors };
  }
}
