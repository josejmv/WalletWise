"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
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

  // Set default currency to USD when currencies load
  useEffect(() => {
    if (!selectedCurrencyId && currencies && currencies.length > 0) {
      const usd = currencies.find((c) => c.code === "USD");
      if (usd) {
        setSelectedCurrencyId(usd.id);
      }
    }
  }, [currencies, selectedCurrencyId]);

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

  // v1.3.0: Export to PDF
  const exportToPDF = useCallback(() => {
    if (!items || items.length === 0) return;

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("es-CO");

    // Title
    doc.setFontSize(18);
    doc.text("Lista de Compras", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generada el ${today}`, 14, 30);

    // Table data
    const tableData = selectedCurrencyId
      ? convertedItems.map((item) => [
          item.name,
          item.category?.name || "Sin categoria",
          `${item.quantityNeeded} ${item.unit}`,
          formatCurrency(Number(item.estimatedPrice), item.currency.code),
          formatCurrency(item.originalSubtotal, item.currency.code),
          item.convertedSubtotal !== null
            ? formatCurrency(
                item.convertedSubtotal,
                selectedCurrency?.code ?? "USD",
              )
            : "Sin tasa",
        ])
      : items.map((item) => {
          const quantityNeeded = item.maxQuantity - item.currentQuantity;
          const subtotal = quantityNeeded * Number(item.estimatedPrice);
          return [
            item.name,
            item.category?.name || "Sin categoria",
            `${quantityNeeded} ${item.unit}`,
            formatCurrency(Number(item.estimatedPrice), item.currency.code),
            formatCurrency(subtotal, item.currency.code),
          ];
        });

    // Table headers
    const headers = selectedCurrencyId
      ? [
          "Producto",
          "Categoria",
          "Cantidad",
          "Precio Unit.",
          "Subtotal",
          `Subtotal (${selectedCurrency?.code})`,
        ]
      : ["Producto", "Categoria", "Cantidad", "Precio Unit.", "Subtotal"];

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 38,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Total
    // @ts-expect-error jspdf-autotable adds lastAutoTable to doc
    const finalY = doc.lastAutoTable.finalY || 38;

    if (selectedCurrencyId && totalConverted > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(
        `Total estimado: ${formatCurrency(totalConverted, selectedCurrency?.code ?? "USD")}`,
        14,
        finalY + 10,
      );
      if (itemsWithoutRate > 0) {
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
          `* ${itemsWithoutRate} item(s) sin tasa de conversion`,
          14,
          finalY + 18,
        );
      }
    }

    doc.save(`lista-compras-${today.replace(/\//g, "-")}.pdf`);
  }, [
    items,
    convertedItems,
    selectedCurrencyId,
    selectedCurrency,
    totalConverted,
    itemsWithoutRate,
  ]);

  // v1.3.0: Share via WhatsApp
  const shareViaWhatsApp = useCallback(() => {
    if (!items || items.length === 0) return;

    let message = "Lista de Compras:\n\n";

    if (selectedCurrencyId && convertedItems.length > 0) {
      convertedItems.forEach((item) => {
        const subtotalStr =
          item.convertedSubtotal !== null
            ? formatCurrency(
                item.convertedSubtotal,
                selectedCurrency?.code ?? "USD",
              )
            : formatCurrency(item.originalSubtotal, item.currency.code);
        message += `- ${item.name}: ${item.quantityNeeded} ${item.unit} x ${formatCurrency(Number(item.estimatedPrice), item.currency.code)} = ${subtotalStr}\n`;
      });
      message += `\n*Total estimado: ${formatCurrency(totalConverted, selectedCurrency?.code ?? "USD")}*`;
      if (itemsWithoutRate > 0) {
        message += `\n_(${itemsWithoutRate} item(s) sin tasa de conversion)_`;
      }
    } else {
      items.forEach((item) => {
        const quantityNeeded = item.maxQuantity - item.currentQuantity;
        const subtotal = quantityNeeded * Number(item.estimatedPrice);
        message += `- ${item.name}: ${quantityNeeded} ${item.unit} x ${formatCurrency(Number(item.estimatedPrice), item.currency.code)} = ${formatCurrency(subtotal, item.currency.code)}\n`;
      });
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  }, [
    items,
    convertedItems,
    selectedCurrencyId,
    selectedCurrency,
    totalConverted,
    itemsWithoutRate,
  ]);

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
        <div className="flex items-center gap-4 flex-wrap">
          {/* v1.3.0: Export buttons */}
          {items && items.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaWhatsApp}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          )}
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
