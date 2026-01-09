const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  COP: "COP$",
  VES: "Bs.",
};

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  options?: Intl.NumberFormatOptions,
): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  const formattedNumber = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);

  return `${symbol} ${formattedNumber}`;
}

export function formatCompactCurrency(
  amount: number,
  currency: string = "USD",
): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  if (amount >= 1_000_000) {
    return `${symbol} ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${symbol} ${(amount / 1_000).toFixed(1)}K`;
  }

  return formatCurrency(amount, currency);
}

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(dateObj);
}

export function formatShortDate(date: Date | string): string {
  return formatDate(date, {
    day: "2-digit",
    month: "short",
  });
}

export function formatMonth(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
  }).format(dateObj);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("es-ES", options).format(value);
}
