"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

interface InventoryItem {
  id: string;
  name: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  estimatedPrice: number;
  category: { name: string };
  currency: { code: string };
}

async function fetchLowStockItems(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory-items?lowStock=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export default function ShoppingListPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory-items", "lowStock"],
    queryFn: fetchLowStockItems,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Calculate total estimated cost
  const totalEstimatedCost =
    items?.reduce((sum, item) => {
      const quantityNeeded = item.maxQuantity - item.currentQuantity;
      return sum + quantityNeeded * Number(item.estimatedPrice);
    }, 0) || 0;

  // Group by category
  const groupedItems = items?.reduce(
    (acc, item) => {
      const key = item.category.name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, InventoryItem[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Lista de Compras
          </h1>
          <p className="text-muted-foreground">
            Items con stock bajo que necesitan reposicion
          </p>
        </div>
        {items && items.length > 0 && (
          <Card className="w-fit">
            <CardContent className="py-3 px-4">
              <p className="text-sm text-muted-foreground">Costo estimado</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalEstimatedCost, "USD")}
              </p>
            </CardContent>
          </Card>
        )}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const quantityNeeded =
                    item.maxQuantity - item.currentQuantity;
                  const subtotal = quantityNeeded * Number(item.estimatedPrice);
                  const isCritical = item.currentQuantity <= item.minQuantity;

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
                        <Badge variant="outline">{item.category.name}</Badge>
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
