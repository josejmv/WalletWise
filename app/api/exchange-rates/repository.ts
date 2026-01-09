import { prisma } from "@/lib/prisma";
import type {
  CreateExchangeRateInput,
  UpdateExchangeRateInput,
  ExchangeRateFilters,
} from "./types";

export async function findAll(filters?: ExchangeRateFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.fromCurrencyId) {
    where.fromCurrencyId = filters.fromCurrencyId;
  }
  if (filters?.toCurrencyId) {
    where.toCurrencyId = filters.toCurrencyId;
  }

  return prisma.exchangeRate.findMany({
    where,
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
    orderBy: { fetchedAt: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.exchangeRate.findUnique({
    where: { id },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
  });
}

export async function findLatest(fromCurrencyId: string, toCurrencyId: string) {
  return prisma.exchangeRate.findFirst({
    where: {
      fromCurrencyId,
      toCurrencyId,
    },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
    orderBy: { fetchedAt: "desc" },
  });
}

export async function findLatestAll() {
  const currencies = await prisma.currency.findMany();
  const rates: Awaited<ReturnType<typeof findLatest>>[] = [];

  for (const from of currencies) {
    for (const to of currencies) {
      if (from.id !== to.id) {
        const rate = await findLatest(from.id, to.id);
        if (rate) {
          rates.push(rate);
        }
      }
    }
  }

  return rates.filter(Boolean);
}

export async function create(data: CreateExchangeRateInput) {
  return prisma.exchangeRate.create({
    data: {
      ...data,
      fetchedAt: new Date(),
    },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
  });
}

export async function update(id: string, data: UpdateExchangeRateInput) {
  return prisma.exchangeRate.update({
    where: { id },
    data: {
      ...data,
      fetchedAt: new Date(),
    },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
  });
}

export async function remove(id: string) {
  return prisma.exchangeRate.delete({
    where: { id },
  });
}

export async function getHistory(
  fromCurrencyId: string,
  toCurrencyId: string,
  limit: number = 30,
) {
  return prisma.exchangeRate.findMany({
    where: {
      fromCurrencyId,
      toCurrencyId,
    },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
    orderBy: { fetchedAt: "desc" },
    take: limit,
  });
}
