"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { TrendingUp, ChevronDown } from "lucide-react";

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

interface CurrencyPair {
  id: string;
  label: string;
  fromId: string;
  toId: string;
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

// Colors for different currency pairs
const PAIR_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

export function RateHistoryChart() {
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  // Generate all possible currency pairs
  const availablePairs = useMemo<CurrencyPair[]>(() => {
    if (!currencies || currencies.length < 2) return [];

    const pairs: CurrencyPair[] = [];
    for (const from of currencies) {
      for (const to of currencies) {
        if (from.id !== to.id) {
          pairs.push({
            id: `${from.id}-${to.id}`,
            label: `${from.code} → ${to.code}`,
            fromId: from.id,
            toId: to.id,
          });
        }
      }
    }
    return pairs;
  }, [currencies]);

  // Auto-select default pairs on first load
  useEffect(() => {
    if (availablePairs.length > 0 && selectedPairs.length === 0) {
      const usd = currencies?.find((c) => c.code === "USD");
      const ves = currencies?.find((c) => c.code === "VES");
      const cop = currencies?.find((c) => c.code === "COP");

      const defaultPairs: string[] = [];
      if (usd && ves) defaultPairs.push(`${usd.id}-${ves.id}`);
      if (usd && cop) defaultPairs.push(`${usd.id}-${cop.id}`);

      if (defaultPairs.length > 0) {
        setSelectedPairs(defaultPairs);
      } else if (availablePairs.length > 0) {
        setSelectedPairs([availablePairs[0].id]);
      }
    }
  }, [availablePairs, currencies, selectedPairs.length]);

  // Fetch history for all selected pairs
  const historyQueries = useQuery({
    queryKey: ["exchange-rates", "history", "multi", selectedPairs],
    queryFn: async () => {
      const results: Record<string, RateHistoryEntry[]> = {};
      for (const pairId of selectedPairs) {
        const pair = availablePairs.find((p) => p.id === pairId);
        if (pair) {
          const history = await fetchRateHistory(pair.fromId, pair.toId);
          results[pairId] = history;
        }
      }
      return results;
    },
    enabled: selectedPairs.length > 0,
  });

  const togglePair = (pairId: string) => {
    setSelectedPairs((prev) =>
      prev.includes(pairId)
        ? prev.filter((id) => id !== pairId)
        : [...prev, pairId],
    );
  };

  // Prepare chart data - merge all pairs by date
  const chartData = useMemo(() => {
    if (!historyQueries.data) return [];

    const dateMap = new Map<
      string,
      { date: string; fullDate: string; [key: string]: string | number }
    >();

    for (const [pairId, entries] of Object.entries(historyQueries.data)) {
      const pair = availablePairs.find((p) => p.id === pairId);
      if (!pair) continue;

      for (const entry of entries) {
        const dateKey = formatDate(entry.fetchedAt);
        const existing = dateMap.get(dateKey) || {
          date: dateKey,
          fullDate: entry.fetchedAt,
        };
        existing[pair.label] = Number(entry.rate);
        dateMap.set(dateKey, existing);
      }
    }

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime(),
    );
  }, [historyQueries.data, availablePairs]);

  // Get labels for selected pairs
  const selectedLabels = selectedPairs
    .map((id) => availablePairs.find((p) => p.id === id)?.label)
    .filter(Boolean) as string[];

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
              {selectedLabels.length > 0
                ? `${selectedLabels.length} par(es) seleccionado(s)`
                : "Selecciona pares de monedas"}
            </CardDescription>
          </div>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Pares
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {availablePairs.map((pair) => (
                  <label
                    key={pair.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedPairs.includes(pair.id)}
                      onCheckedChange={() => togglePair(pair.id)}
                    />
                    <span className="text-sm">{pair.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {loadingCurrencies || historyQueries.isLoading ? (
          <Skeleton className="h-64" />
        ) : selectedPairs.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Selecciona pares de monedas para ver el historial
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No hay historial de tasas para los pares seleccionados
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
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
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {selectedLabels.map((label, index) => (
                <Line
                  key={label}
                  type="monotone"
                  dataKey={label}
                  name={label}
                  stroke={PAIR_COLORS[index % PAIR_COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: PAIR_COLORS[index % PAIR_COLORS.length], r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
