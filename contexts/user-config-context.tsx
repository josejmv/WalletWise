"use client";

import { createContext, useContext, type ReactNode } from "react";
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

interface UserConfigContextValue {
  config: UserConfig | null;
  isLoading: boolean;
  error: Error | null;
  updateConfig: (input: UpdateUserConfigInput) => void;
  isUpdating: boolean;
  // Formatting helpers that use the config
  formatDate: (date: Date | string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (
    amount: number,
    currencyCode?: string,
    options?: Intl.NumberFormatOptions,
  ) => string;
}

const UserConfigContext = createContext<UserConfigContextValue | null>(null);

async function fetchUserConfig(): Promise<UserConfig> {
  const res = await fetch("/api/user-config");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function updateUserConfigApi(
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

// Default config for SSR and initial load
const DEFAULT_CONFIG: Partial<UserConfig> = {
  dateFormat: "DD/MM/YYYY",
  numberFormat: "es-CO",
  theme: "system",
};

// Symbols equal to currency codes for consistency
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "USD",
  COP: "COP",
  VES: "VES",
  USDT: "USDT",
};

function getLocale(numberFormat: string): string {
  return numberFormat === "en-US" ? "en-US" : "es-CO";
}

function formatDateImpl(date: Date | string, dateFormat: string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return "-";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
}

function formatNumberImpl(
  value: number,
  numberFormat: string,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = getLocale(numberFormat);
  return new Intl.NumberFormat(locale, options).format(value);
}

function formatCurrencyImpl(
  amount: number,
  currencyCode: string,
  numberFormat: string,
  options?: Intl.NumberFormatOptions,
): string {
  const locale = getLocale(numberFormat);
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);

  return `${symbol} ${formattedNumber}`;
}

export function UserConfigProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-config"],
    queryFn: fetchUserConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateUserConfigApi,
    onSuccess: (data) => {
      queryClient.setQueryData(["user-config"], data);
    },
  });

  const dateFormat = query.data?.dateFormat ?? DEFAULT_CONFIG.dateFormat!;
  const numberFormat = query.data?.numberFormat ?? DEFAULT_CONFIG.numberFormat!;
  const baseCurrencyCode = query.data?.baseCurrency?.code ?? "USD";

  const value: UserConfigContextValue = {
    config: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    updateConfig: mutation.mutate,
    isUpdating: mutation.isPending,
    formatDate: (date) => formatDateImpl(date, dateFormat),
    formatNumber: (value, options) =>
      formatNumberImpl(value, numberFormat, options),
    formatCurrency: (amount, currencyCode, options) =>
      formatCurrencyImpl(
        amount,
        currencyCode ?? baseCurrencyCode,
        numberFormat,
        options,
      ),
  };

  return (
    <UserConfigContext.Provider value={value}>
      {children}
    </UserConfigContext.Provider>
  );
}

export function useUserConfigContext() {
  const context = useContext(UserConfigContext);
  if (!context) {
    throw new Error(
      "useUserConfigContext must be used within a UserConfigProvider",
    );
  }
  return context;
}

// Standalone hook for components that just need formatting without full context
export function useFormatters() {
  const context = useContext(UserConfigContext);

  // If no context, use defaults
  if (!context) {
    return {
      formatDate: (date: Date | string) =>
        formatDateImpl(date, DEFAULT_CONFIG.dateFormat!),
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumberImpl(value, DEFAULT_CONFIG.numberFormat!, options),
      formatCurrency: (
        amount: number,
        currencyCode?: string,
        options?: Intl.NumberFormatOptions,
      ) =>
        formatCurrencyImpl(
          amount,
          currencyCode ?? "USD",
          DEFAULT_CONFIG.numberFormat!,
          options,
        ),
    };
  }

  return {
    formatDate: context.formatDate,
    formatNumber: context.formatNumber,
    formatCurrency: context.formatCurrency,
  };
}
