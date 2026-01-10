"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserConfig {
  id: string;
  baseCurrencyId: string;
  dateFormat: string;
  numberFormat: string;
  theme: string;
  sidebarConfig: unknown;
  lastRateSyncAt: string | null;
  baseCurrency: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
}

interface UpdateUserConfigInput {
  baseCurrencyId?: string;
  dateFormat?: string;
  numberFormat?: string;
  theme?: string;
  sidebarConfig?: unknown;
}

async function fetchUserConfig(): Promise<UserConfig> {
  const res = await fetch("/api/user-config");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function updateUserConfig(
  input: UpdateUserConfigInput,
): Promise<UserConfig> {
  const res = await fetch("/api/user-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export function useUserConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-config"],
    queryFn: fetchUserConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateUserConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(["user-config"], data);
    },
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateConfig: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

// Helper to get locale from numberFormat
export function getLocaleFromFormat(numberFormat: string): string {
  switch (numberFormat) {
    case "es-CO":
      return "es-CO";
    case "en-US":
      return "en-US";
    default:
      return "es-CO";
  }
}

// Helper to format date according to user preference
export function formatDateWithConfig(
  date: Date | string,
  dateFormat: string,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

// Helper to format number according to user preference
export function formatNumberWithConfig(
  value: number,
  numberFormat: string,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = getLocaleFromFormat(numberFormat);
  return new Intl.NumberFormat(locale, options).format(value);
}

// Helper to format currency according to user preference
export function formatCurrencyWithConfig(
  amount: number,
  currencyCode: string,
  numberFormat: string,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = getLocaleFromFormat(numberFormat);

  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    COP: "COP$",
    VES: "Bs.",
    USDT: "USDT",
    BTC: "BTC",
    ETH: "ETH",
    BNB: "BNB",
    SOL: "SOL",
  };

  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);

  return `${symbol} ${formattedNumber}`;
}
