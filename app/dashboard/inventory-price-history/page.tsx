"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface PriceHistoryEntry {
  id: string;
  price: number;
  date: string;
  source: string | null;
  item: { id: string; name: string };
  currency: { id: string; code: string; symbol: string };
}

interface InventoryItem {
  id: string;
  name: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

async function fetchPriceHistory(): Promise<PriceHistoryEntry[]> {
  const res = await fetch("/api/inventory-price-history");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory-items");
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

async function createPriceHistory(input: {
  itemId: string;
  price: number;
  currencyId: string;
  source?: string;
}) {
  const res = await fetch("/api/inventory-price-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol} ${new Intl.NumberFormat("es-CO").format(value)}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InventoryPriceHistoryPage() {
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState("");
  const [price, setPrice] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [source, setSource] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ["inventory-price-history"],
    queryFn: fetchPriceHistory,
  });

  const { data: items } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: fetchInventoryItems,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const createMutation = useMutation({
    mutationFn: createPriceHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-price-history"] });
      toast({ title: "Precio registrado correctamente" });
      setOpen(false);
      setItemId("");
      setPrice("");
      setCurrencyId("");
      setSource("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar precio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      itemId,
      price: parseFloat(price),
      currencyId,
      ...(source && { source }),
    });
  };

  // Group history by item to calculate price changes
  const historyByItem = history?.reduce(
    (acc, entry) => {
      if (!acc[entry.item.id]) {
        acc[entry.item.id] = [];
      }
      acc[entry.item.id].push(entry);
      return acc;
    },
    {} as Record<string, PriceHistoryEntry[]>,
  );

  const getPriceChange = (entry: PriceHistoryEntry) => {
    const itemHistory = historyByItem?.[entry.item.id];
    if (!itemHistory || itemHistory.length < 2) return null;

    const sortedHistory = [...itemHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const currentIndex = sortedHistory.findIndex((e) => e.id === entry.id);
    if (currentIndex === sortedHistory.length - 1) return null;

    const previousEntry = sortedHistory[currentIndex + 1];
    const change = entry.price - previousEntry.price;
    const percentChange = (change / previousEntry.price) * 100;

    return { change, percentChange };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Historial de Precios
          </h1>
          <p className="text-muted-foreground">
            Seguimiento de precios de productos
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Precio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Precio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemId">Producto</Label>
                <Select value={itemId} onValueChange={setItemId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {items?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencyId">Moneda</Label>
                  <Select
                    value={currencyId}
                    onValueChange={setCurrencyId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Moneda" />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Fuente (opcional)</Label>
                <Input
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Supermercado, tienda, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>
            {history?.length || 0} registro(s) de precios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead>Variacion</TableHead>
                  <TableHead>Fuente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => {
                  const priceChange = getPriceChange(entry);

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.item.name}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.price, entry.currency.symbol)}
                      </TableCell>
                      <TableCell>
                        {priceChange ? (
                          <div className="flex items-center gap-1">
                            {priceChange.change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : priceChange.change < 0 ? (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge
                              variant={
                                priceChange.change > 0
                                  ? "destructive"
                                  : priceChange.change < 0
                                    ? "success"
                                    : "secondary"
                              }
                            >
                              {priceChange.percentChange > 0 ? "+" : ""}
                              {priceChange.percentChange.toFixed(1)}%
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.source || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay registros de precios
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
