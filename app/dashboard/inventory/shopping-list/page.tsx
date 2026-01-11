"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatters";

interface InventoryItem {
  id: string;
  name: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  estimatedPrice: number;
  category: { name: string } | null;
  currency: { id: string; code: string };
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

interface ExchangeRate {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
}

interface ConvertedItem extends InventoryItem {
  quantityNeeded: number;
  originalSubtotal: number;
  convertedSubtotal: number | null;
  rate: number | null;
}

async function fetchLowStockItems(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory-items?lowStock=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch("/api/currencies");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchExchangeRates(): Promise<ExchangeRate[]> {
  const res = await fetch("/api/exchange-rates");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export default function ShoppingListPage() {
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>("");

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ["inventory-items", "lowStock"],
    queryFn: fetchLowStockItems,
  });

  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const { data: exchangeRates } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
  });

  // Find rate between two currencies
  const findRate = (
    fromCurrencyId: string,
    toCurrencyId: string,
  ): number | null => {
    if (fromCurrencyId === toCurrencyId) return 1;
    if (!exchangeRates) return null;

    // Direct rate
    const directRate = exchangeRates.find(
      (r) =>
        r.fromCurrencyId === fromCurrencyId && r.toCurrencyId === toCurrencyId,
    );
    if (directRate) return directRate.rate;

    // Inverse rate
    const inverseRate = exchangeRates.find(
      (r) =>
        r.fromCurrencyId === toCurrencyId && r.toCurrencyId === fromCurrencyId,
    );
    if (inverseRate && inverseRate.rate > 0) return 1 / inverseRate.rate;

    return null;
  };

  // Calculate conversions
  const { convertedItems, totalConverted, itemsWithoutRate } = useMemo((): {
    convertedItems: ConvertedItem[];
    totalConverted: number;
    itemsWithoutRate: number;
  } => {
    if (!items || !selectedCurrencyId) {
      return { convertedItems: [], totalConverted: 0, itemsWithoutRate: 0 };
    }

    let total = 0;
    let noRateCount = 0;

    const converted: ConvertedItem[] = items.map((item) => {
      const quantityNeeded = item.maxQuantity - item.currentQuantity;
      const originalSubtotal = quantityNeeded * Number(item.estimatedPrice);
      const rate = findRate(item.currency.id, selectedCurrencyId);

      if (rate === null) {
        noRateCount++;
        return {
          ...item,
          quantityNeeded,
          originalSubtotal,
          convertedSubtotal: null,
          rate: null,
        };
      }

      const convertedSubtotal = originalSubtotal * rate;
      total += convertedSubtotal;

      return {
        ...item,
        quantityNeeded,
        originalSubtotal,
        convertedSubtotal,
        rate,
      };
    });

    return {
      convertedItems: converted,
      totalConverted: total,
      itemsWithoutRate: noRateCount,
    };
  }, [items, selectedCurrencyId, exchangeRates]);

  const selectedCurrency = currencies?.find((c) => c.id === selectedCurrencyId);

  if (loadingItems || loadingCurrencies) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Lista de Compras
          </h1>
          <p className="text-muted-foreground">
            Items con stock bajo que necesitan reposicion
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Currency selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ver total en:</span>
            <Select
              value={selectedCurrencyId}
              onValueChange={setSelectedCurrencyId}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Total card */}
          {items && items.length > 0 && selectedCurrencyId && (
            <Card className="w-fit">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-muted-foreground">Costo estimado</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      totalConverted,
                      selectedCurrency?.code ?? "USD",
                    )}
                  </p>
                  {itemsWithoutRate > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {itemsWithoutRate} item(s) sin tasa de conversion
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Items a Comprar
          </CardTitle>
          <CardDescription>
            {items?.length || 0} item(s) con stock bajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">
                    Cantidad a Comprar
                  </TableHead>
                  <TableHead className="text-right">Precio Est.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  {selectedCurrencyId && (
                    <TableHead className="text-right">
                      Subtotal ({selectedCurrency?.code})
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCurrencyId
                  ? convertedItems.map((item) => {
                      const isCritical =
                        item.currentQuantity <= item.minQuantity;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isCritical && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.category?.name ? (
                              <Badge variant="outline">
                                {item.category.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground italic text-sm">
                                Sin categoria
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                isCritical ? "text-destructive font-medium" : ""
                              }
                            >
                              {item.currentQuantity} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.quantityNeeded} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(item.estimatedPrice),
                              item.currency.code,
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(
                              item.originalSubtotal,
                              item.currency.code,
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.convertedSubtotal !== null ? (
                              formatCurrency(
                                item.convertedSubtotal,
                                selectedCurrency?.code ?? "USD",
                              )
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-amber-500 flex items-center gap-1">
                                      <AlertCircle className="h-4 w-4" />
                                      Sin tasa
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      No hay tasa de {item.currency.code} a{" "}
                                      {selectedCurrency?.code}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : items?.map((item) => {
                      const quantityNeeded =
                        item.maxQuantity - item.currentQuantity;
                      const subtotal =
                        quantityNeeded * Number(item.estimatedPrice);
                      const isCritical =
                        item.currentQuantity <= item.minQuantity;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isCritical && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.category?.name ? (
                              <Badge variant="outline">
                                {item.category.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground italic text-sm">
                                Sin categoria
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                isCritical ? "text-destructive font-medium" : ""
                              }
                            >
                              {item.currentQuantity} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {quantityNeeded} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(item.estimatedPrice),
                              item.currency.code,
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(subtotal, item.currency.code)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">
                Todos los items tienen stock suficiente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
