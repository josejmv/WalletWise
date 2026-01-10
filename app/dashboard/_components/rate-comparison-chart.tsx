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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { ArrowLeftRight } from "lucide-react";

interface ExchangeRate {
  id: string;
  rate: number;
  source: "official" | "binance" | "manual";
  fetchedAt: string;
  fromCurrency: {
    id: string;
    code: string;
  };
  toCurrency: {
    id: string;
    code: string;
  };
}

async function fetchLatestRates(): Promise<ExchangeRate[]> {
  const res = await fetch("/api/exchange-rates?latest=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

const SOURCE_COLORS: Record<string, string> = {
  official: "#3b82f6",
  binance: "#eab308",
  manual: "#6b7280",
};

const SOURCE_LABELS: Record<string, string> = {
  official: "Oficial",
  binance: "Binance",
  manual: "Manual",
};

export function RateComparisonChart() {
  const { data: rates, isLoading } = useQuery({
    queryKey: ["exchange-rates", "latest"],
    queryFn: fetchLatestRates,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparacion de Tasas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  // Group rates by currency pair and compare sources
  const pairMap = new Map<
    string,
    { pair: string; official?: number; binance?: number; manual?: number }
  >();

  rates?.forEach((rate) => {
    const pairKey = `${rate.fromCurrency.code}/${rate.toCurrency.code}`;
    const existing = pairMap.get(pairKey) || { pair: pairKey };
    existing[rate.source] = Number(rate.rate);
    pairMap.set(pairKey, existing);
  });

  // Filter to only show pairs with multiple sources for comparison
  const comparisonData = Array.from(pairMap.values()).filter(
    (item) =>
      (item.official !== undefined ? 1 : 0) +
        (item.binance !== undefined ? 1 : 0) +
        (item.manual !== undefined ? 1 : 0) >=
      1,
  );

  // Sort by pair name
  comparisonData.sort((a, b) => a.pair.localeCompare(b.pair));

  // Limit to top 6 pairs for readability
  const displayData = comparisonData.slice(0, 6);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="h-4 w-4" />
          Comparacion de Tasas
        </CardTitle>
        <CardDescription>
          Tasas por fuente para diferentes pares de monedas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No hay suficientes tasas para comparar
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={displayData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  Number(value).toLocaleString("es-CO", {
                    notation: "compact",
                    maximumFractionDigits: 0,
                  })
                }
              />
              <YAxis
                type="category"
                dataKey="pair"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                formatter={(value, name) => [
                  Number(value).toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  }),
                  SOURCE_LABELS[name as string] || name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend formatter={(value) => SOURCE_LABELS[value] || value} />
              <Bar
                dataKey="official"
                name="official"
                fill={SOURCE_COLORS.official}
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="binance"
                name="binance"
                fill={SOURCE_COLORS.binance}
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="manual"
                name="manual"
                fill={SOURCE_COLORS.manual}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
