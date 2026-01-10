"use client";

import { useQuery } from "@tanstack/react-query";

interface ExchangeRateResponse {
  id: string;
  rate: string;
  source: string;
  fetchedAt: string;
  fromCurrency: {
    id: string;
    code: string;
    symbol: string;
  };
  toCurrency: {
    id: string;
    code: string;
    symbol: string;
  };
}

async function fetchLatestRate(
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<ExchangeRateResponse | null> {
  if (!fromCurrencyId || !toCurrencyId || fromCurrencyId === toCurrencyId) {
    return null;
  }

  const res = await fetch(
    `/api/exchange-rates?fromCurrencyId=${fromCurrencyId}&toCurrencyId=${toCurrencyId}`,
  );
  const data = await res.json();

  if (!data.success || !data.data || data.data.length === 0) {
    // Try inverse rate
    const inverseRes = await fetch(
      `/api/exchange-rates?fromCurrencyId=${toCurrencyId}&toCurrencyId=${fromCurrencyId}`,
    );
    const inverseData = await inverseRes.json();

    if (
      !inverseData.success ||
      !inverseData.data ||
      inverseData.data.length === 0
    ) {
      return null;
    }

    // Return inverse rate with swapped currencies
    const inverse = inverseData.data[0];
    return {
      ...inverse,
      rate: String(1 / parseFloat(inverse.rate)),
      fromCurrency: inverse.toCurrency,
      toCurrency: inverse.fromCurrency,
    };
  }

  return data.data[0];
}

export function useExchangeRate(
  fromCurrencyId: string | undefined,
  toCurrencyId: string | undefined,
) {
  const query = useQuery({
    queryKey: ["exchange-rate", fromCurrencyId, toCurrencyId],
    queryFn: () => fetchLatestRate(fromCurrencyId!, toCurrencyId!),
    enabled:
      !!fromCurrencyId && !!toCurrencyId && fromCurrencyId !== toCurrencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    rate: query.data ? parseFloat(query.data.rate) : null,
    rateData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    needsRate:
      !!fromCurrencyId && !!toCurrencyId && fromCurrencyId !== toCurrencyId,
  };
}
