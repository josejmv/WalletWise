"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface PriceHistory {
  id: string;
  price: number;
  date: string;
  item: {
    id: string;
    name: string;
    currency: { code: string };
  };
}

async function fetchPriceHistory(): Promise<PriceHistory[]> {
  const res = await fetch("/api/inventory-items/price-history");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Color palette for chart lines
const CHART_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export default function PriceHistoryPage() {
  const [selectedItemId, setSelectedItemId] = useState<string>("all");

  const { data: history, isLoading } = useQuery({
    queryKey: ["price-history"],
    queryFn: fetchPriceHistory,
  });

  // Get unique items for the filter
  const uniqueItems = useMemo(() => {
    if (!history) return [];
    const itemMap = new Map<string, { id: string; name: string }>();
    history.forEach((entry) => {
      if (!itemMap.has(entry.item.id)) {
        itemMap.set(entry.item.id, {
          id: entry.item.id,
          name: entry.item.name,
        });
      }
    });
    return Array.from(itemMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [history]);

  // Filter history by selected item
  const filteredHistory = useMemo(() => {
    if (!history) return [];
    if (selectedItemId === "all") return history;
    return history.filter((entry) => entry.item.id === selectedItemId);
  }, [history, selectedItemId]);

  // Prepare chart data - group by date for selected products
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const itemsToShow =
      selectedItemId === "all"
        ? uniqueItems.slice(0, 5) // Show first 5 items when "all" is selected
        : uniqueItems.filter((i) => i.id === selectedItemId);

    // Get all dates from filtered history
    const dataMap = new Map<
      string,
      { date: string; dateObj: Date; [key: string]: number | string | Date }
    >();

    filteredHistory.forEach((entry) => {
      const dateKey = new Date(entry.date).toISOString().split("T")[0];
      const existing = dataMap.get(dateKey) || {
        date: formatDate(entry.date),
        dateObj: new Date(entry.date),
      };
      existing[entry.item.name] = Number(entry.price);
      dataMap.set(dateKey, existing);
    });

    // Sort by date
    return Array.from(dataMap.values()).sort(
      (a, b) => a.dateObj.getTime() - b.dateObj.getTime(),
    );
  }, [history, filteredHistory, selectedItemId, uniqueItems]);

  // Get item names to show in chart
  const chartItemNames = useMemo(() => {
    if (selectedItemId === "all") {
      return uniqueItems.slice(0, 5).map((i) => i.name);
    }
    const item = uniqueItems.find((i) => i.id === selectedItemId);
    return item ? [item.name] : [];
  }, [selectedItemId, uniqueItems]);

  // Calculate stats for selected item
  const stats = useMemo(() => {
    if (filteredHistory.length === 0) return null;

    const prices = filteredHistory.map((e) => Number(e.price));
    const currentPrice = prices[0] || 0;
    const previousPrice = prices[1] || currentPrice;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent =
      previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

    return {
      currentPrice,
      minPrice,
      maxPrice,
      avgPrice,
      priceChange,
      priceChangePercent,
      currencyCode: filteredHistory[0]?.item.currency.code || "USD",
    };
  }, [filteredHistory]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Historial de Precios
        </h1>
        <p className="text-muted-foreground">
          Seguimiento de precios de items de inventario
        </p>
      </div>

      {/* v1.3.0: Explanatory section */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Como funciona el historial de precios
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Cada vez que actualizas el precio de un producto en tu
                inventario, el sistema guarda automaticamente un registro del
                precio anterior. Esto te permite:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>Ver la evolucion de precios de cada producto</li>
                <li>Identificar tendencias de subida o bajada</li>
                <li>Calcular el precio promedio historico</li>
                <li>Comparar precios actuales vs pasados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* v1.3.0: Filter and stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-64">
          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              {uniqueItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats cards */}
        {stats && selectedItemId !== "all" && (
          <div className="flex gap-4 flex-wrap">
            <Card className="flex-1 min-w-[120px]">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Precio actual</p>
                <p className="text-lg font-bold">
                  {formatCurrency(stats.currentPrice, stats.currencyCode)}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[120px]">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Cambio</p>
                <div className="flex items-center gap-1">
                  {stats.priceChange > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {stats.priceChangePercent.toFixed(1)}%
                    </Badge>
                  ) : stats.priceChange < 0 ? (
                    <Badge variant="default" className="bg-green-500 text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {stats.priceChangePercent.toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <Minus className="h-3 w-3 mr-1" />
                      Sin cambio
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[120px]">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Min / Max</p>
                <p className="text-sm">
                  {formatCurrency(stats.minPrice, stats.currencyCode)} /{" "}
                  {formatCurrency(stats.maxPrice, stats.currencyCode)}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[120px]">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Promedio</p>
                <p className="text-lg font-bold">
                  {formatCurrency(stats.avgPrice, stats.currencyCode)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* v1.3.0: Price trend chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChartIcon className="h-4 w-4" />
              Tendencia de Precios
            </CardTitle>
            <CardDescription>
              {selectedItemId === "all"
                ? "Mostrando los primeros 5 productos"
                : `Evolucion del precio de ${chartItemNames[0]}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  formatter={(value) => [
                    Number(value).toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                {chartItemNames.map((itemName, index) => (
                  <Line
                    key={itemName}
                    type="monotone"
                    dataKey={itemName}
                    name={itemName}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{
                      fill: CHART_COLORS[index % CHART_COLORS.length],
                      r: 4,
                    }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Registro de Precios
          </CardTitle>
          <CardDescription>
            {filteredHistory.length} registro(s) de precios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHistory && filteredHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Tendencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry, index) => {
                  // Find previous entry for the same item
                  const prevEntry = filteredHistory
                    .slice(index + 1)
                    .find((e) => e.item.id === entry.item.id);
                  const priceChange = prevEntry
                    ? Number(entry.price) - Number(prevEntry.price)
                    : 0;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.item.name}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          Number(entry.price),
                          entry.item.currency.code,
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {priceChange > 0 ? (
                          <span className="flex items-center justify-end gap-1 text-red-500">
                            <TrendingUp className="h-4 w-4" />+
                            {priceChange.toFixed(2)}
                          </span>
                        ) : priceChange < 0 ? (
                          <span className="flex items-center justify-end gap-1 text-green-500">
                            <TrendingDown className="h-4 w-4" />
                            {priceChange.toFixed(2)}
                          </span>
                        ) : (
                          <span className="flex items-center justify-end gap-1 text-muted-foreground">
                            <Minus className="h-4 w-4" />
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay historial de precios registrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
