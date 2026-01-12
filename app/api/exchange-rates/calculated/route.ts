import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRateViaIntermediate, type RateResult } from "@/lib/currency-utils";

interface CalculatedRate {
  fromCurrency: { id: string; code: string };
  toCurrency: { id: string; code: string };
  intermediateCurrency: { id: string; code: string };
  rate: number;
  rate1: number;
  rate2: number;
}

/**
 * v1.5.0: Get calculated exchange rates via intermediate currencies
 * Returns rates for currency pairs that go through USD, USDT, or other intermediaries
 */
export async function GET() {
  try {
    // Get all currencies
    const currencies = await prisma.currency.findMany({
      select: { id: true, code: true },
      orderBy: { code: "asc" },
    });

    // Get currencies that can be intermediaries (typically USD, USDT)
    const intermediateCodes = ["USD", "USDT"];
    const intermediateCurrencies = currencies.filter((c) =>
      intermediateCodes.includes(c.code),
    );

    // Get existing direct rates to know which pairs need calculated rates
    const existingRates = await prisma.exchangeRate.findMany({
      select: { fromCurrencyId: true, toCurrencyId: true },
      distinct: ["fromCurrencyId", "toCurrencyId"],
    });

    const existingPairs = new Set(
      existingRates.map((r) => `${r.fromCurrencyId}-${r.toCurrencyId}`),
    );

    const calculatedRates: CalculatedRate[] = [];

    // For each currency pair that doesn't have a direct rate,
    // calculate via each intermediate
    for (const from of currencies) {
      for (const to of currencies) {
        if (from.id === to.id) continue;

        // Check if direct rate exists
        const hasDirectRate =
          existingPairs.has(`${from.id}-${to.id}`) ||
          existingPairs.has(`${to.id}-${from.id}`);

        // Calculate via each intermediate
        for (const intermediate of intermediateCurrencies) {
          // Skip if intermediate is one of the currencies
          if (intermediate.id === from.id || intermediate.id === to.id) {
            continue;
          }

          const rateResult = await getRateViaIntermediate(
            from.id,
            to.id,
            intermediate.id,
          );

          if (rateResult?.intermediateRoute) {
            calculatedRates.push({
              fromCurrency: { id: from.id, code: from.code },
              toCurrency: { id: to.id, code: to.code },
              intermediateCurrency: {
                id: intermediate.id,
                code: intermediate.code,
              },
              rate: rateResult.rate,
              rate1: rateResult.intermediateRoute.rate1,
              rate2: rateResult.intermediateRoute.rate2,
            });
          }
        }
      }
    }

    // Sort by from currency, then to currency, then intermediate
    calculatedRates.sort((a, b) => {
      if (a.fromCurrency.code !== b.fromCurrency.code) {
        return a.fromCurrency.code.localeCompare(b.fromCurrency.code);
      }
      if (a.toCurrency.code !== b.toCurrency.code) {
        return a.toCurrency.code.localeCompare(b.toCurrency.code);
      }
      return a.intermediateCurrency.code.localeCompare(
        b.intermediateCurrency.code,
      );
    });

    return NextResponse.json({
      success: true,
      data: calculatedRates,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error calculating exchange rates";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
