"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
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

export default function PriceHistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["price-history"],
    queryFn: fetchPriceHistory,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Group by item
  const groupedHistory = history?.reduce(
    (acc, entry) => {
      const key = entry.item.id;
      if (!acc[key]) {
        acc[key] = {
          item: entry.item,
          entries: [],
        };
      }
      acc[key].entries.push(entry);
      return acc;
    },
    {} as Record<
      string,
      { item: PriceHistory["item"]; entries: PriceHistory[] }
    >,
  );

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historial de Precios
          </CardTitle>
          <CardDescription>
            {history?.length || 0} registro(s) de precios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
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
                {history.map((entry, index) => {
                  const prevEntry = history[index + 1];
                  const priceChange =
                    prevEntry && prevEntry.item.id === entry.item.id
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
