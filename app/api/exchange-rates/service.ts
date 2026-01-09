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
