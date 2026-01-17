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
import { ArrowLeftRight } from "lucide-react";
import { useFormatters } from "@/contexts/user-config-context";
import { cn } from "@/lib/utils";

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

const SOURCE_LABELS: Record<string, string> = {
  official: "Oficial",
  binance: "Binance",
  manual: "Manual",
};

// Pastel colors for source badges
const SOURCE_STYLES: Record<string, string> = {
  official: "bg-blue-500/20 text-blue-400",
  binance: "bg-yellow-500/20 text-yellow-400",
  manual: "bg-gray-500/20 text-gray-400",
};

/**
 * v1.6.0: Replaced bar chart with compact list view
 * Shows exchange rates in a simple list format: PAIR  RATE  (SOURCE)
 */
export function RateComparisonChart() {
  const { formatNumber } = useFormatters();
  const { data: rates, isLoading } = useQuery({
    queryKey: ["exchange-rates", "latest"],
    queryFn: fetchLatestRates,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowLeftRight className="h-4 w-4" />
            Tasas de Cambio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    );
  }

  // Group rates by currency pair, keeping the most recent/preferred source
  const pairMap = new Map<
    string,
    { pair: string; rate: number; source: string }
  >();

  rates?.forEach((rate) => {
    const pairKey = `${rate.fromCurrency.code}/${rate.toCurrency.code}`;
    const existing = pairMap.get(pairKey);

    // Priority: binance > official > manual (prefer binance for crypto pairs)
    const sourcePriority: Record<string, number> = { binance: 3, official: 2, manual: 1 };
    const newPriority = sourcePriority[rate.source] || 0;
    const existingPriority = existing ? (sourcePriority[existing.source] || 0) : 0;

    if (!existing || newPriority > existingPriority) {
      pairMap.set(pairKey, {
        pair: pairKey,
        rate: Number(rate.rate),
        source: rate.source,
      });
    }
  });

  // Sort by pair name and limit
  const displayData = Array.from(pairMap.values())
    .sort((a, b) => a.pair.localeCompare(b.pair))
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="h-4 w-4" />
          Tasas de Cambio Actuales
        </CardTitle>
        <CardDescription>
          {displayData.length} par(es) de monedas disponibles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayData.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No hay tasas de cambio registradas
          </div>
        ) : (
          <div className="space-y-2">
            {displayData.map((item) => (
              <div
                key={item.pair}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-sm">{item.pair}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">
                    {formatNumber(item.rate, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: item.rate < 10 ? 4 : 2,
                    })}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      SOURCE_STYLES[item.source] || SOURCE_STYLES.manual
                    )}
                  >
                    {SOURCE_LABELS[item.source] || item.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
