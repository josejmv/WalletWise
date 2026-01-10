"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useState } from "react";

interface RateHistoryEntry {
  id: string;
  rate: number;
  source: "official" | "binance" | "manual";
  fetchedAt: string;
  fromCurrency: { code: string };
  toCurrency: { code: string };
}

interface Currency {
  id: string;
  code: string;
  name: string;
}

async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch("/api/currencies");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchRateHistory(
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<RateHistoryEntry[]> {
  const res = await fetch(
    `/api/exchange-rates?history=true&fromCurrencyId=${fromCurrencyId}&toCurrencyId=${toCurrencyId}&limit=30`,
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

const SOURCE_COLORS: Record<string, string> = {
  official: "#3b82f6",
  binance: "#eab308",
  manual: "#6b7280",
};

export function RateHistoryChart() {
  const [fromCurrencyId, setFromCurrencyId] = useState<string>("");
  const [toCurrencyId, setToCurrencyId] = useState<string>("");

  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["exchange-rates", "history", fromCurrencyId, toCurrencyId],
    queryFn: () => fetchRateHistory(fromCurrencyId, toCurrencyId),
    enabled: !!fromCurrencyId && !!toCurrencyId,
  });

  // Auto-select first currency pair when currencies load
  if (
    currencies &&
    currencies.length >= 2 &&
    !fromCurrencyId &&
    !toCurrencyId
  ) {
    const usd = currencies.find((c) => c.code === "USD");
    const ves = currencies.find((c) => c.code === "VES");
    const cop = currencies.find((c) => c.code === "COP");
    if (usd) {
      setFromCurrencyId(usd.id);
      if (ves) setToCurrencyId(ves.id);
      else if (cop) setToCurrencyId(cop.id);
      else setToCurrencyId(currencies.find((c) => c.id !== usd.id)?.id || "");
    }
  }

  // Prepare chart data - group by date and source
  const chartData =
    history
      ?.slice()
      .reverse()
      .map((entry) => ({
        date: formatDate(entry.fetchedAt),
        fullDate: entry.fetchedAt,
        [entry.source]: Number(entry.rate),
        source: entry.source,
      })) || [];

  // Merge entries with same date
  const mergedData = chartData.reduce(
    (acc, entry) => {
      const existing = acc.find((e) => e.date === entry.date);
      if (existing) {
        existing[entry.source] = entry[entry.source];
      } else {
        acc.push({ ...entry });
      }
      return acc;
    },
    [] as Array<{ date: string; [key: string]: string | number }>,
  );

  // Get unique sources from the data
  const sources = Array.from(new Set(history?.map((e) => e.source) || []));

  const fromCurrency = currencies?.find((c) => c.id === fromCurrencyId);
  const toCurrency = currencies?.find((c) => c.id === toCurrencyId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Historial de Tasas
            </CardTitle>
            <CardDescription>
              {fromCurrency && toCurrency
                ? `${fromCurrency.code} a ${toCurrency.code}`
                : "Selecciona par de monedas"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={fromCurrencyId} onValueChange={setFromCurrencyId}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="De" />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={toCurrencyId} onValueChange={setToCurrencyId}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="A" />
              </SelectTrigger>
              <SelectContent>
                {currencies
                  ?.filter((c) => c.id !== fromCurrencyId)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingCurrencies ||
        (loadingHistory && fromCurrencyId && toCurrencyId) ? (
          <Skeleton className="h-64" />
        ) : !fromCurrencyId || !toCurrencyId ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Selecciona las monedas para ver el historial
          </div>
        ) : mergedData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No hay historial de tasas para este par
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  Number(value).toLocaleString("es-CO", {
                    notation: "compact",
                    maximumFractionDigits: 2,
                  })
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  Number(value).toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  }),
                  name === "official"
                    ? "Oficial"
                    : name === "binance"
                      ? "Binance"
                      : "Manual",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "official"
                    ? "Oficial"
                    : value === "binance"
                      ? "Binance"
                      : "Manual"
                }
              />
              {sources.includes("official") && (
                <Line
                  type="monotone"
                  dataKey="official"
                  name="official"
                  stroke={SOURCE_COLORS.official}
                  strokeWidth={2}
                  dot={{ fill: SOURCE_COLORS.official, r: 4 }}
                  connectNulls
                />
              )}
              {sources.includes("binance") && (
                <Line
                  type="monotone"
                  dataKey="binance"
                  name="binance"
                  stroke={SOURCE_COLORS.binance}
                  strokeWidth={2}
                  dot={{ fill: SOURCE_COLORS.binance, r: 4 }}
                  connectNulls
                />
              )}
              {sources.includes("manual") && (
                <Line
                  type="monotone"
                  dataKey="manual"
                  name="manual"
                  stroke={SOURCE_COLORS.manual}
                  strokeWidth={2}
                  dot={{ fill: SOURCE_COLORS.manual, r: 4 }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
