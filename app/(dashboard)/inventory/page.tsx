"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Package, AlertTriangle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  estimatedPrice: number;
  isActive: boolean;
  category: { name: string };
  currency: { code: string; symbol: string };
}

async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory-items");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${new Intl.NumberFormat("es-CO").format(value)}`;
}

export default function InventoryPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: fetchInventoryItems,
  });

  const lowStockCount =
    items?.filter((item) => item.currentQuantity <= item.minQuantity).length ||
    0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
        </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario del hogar
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items?.length || 0}</div>
          </CardContent>
        </Card>
        {lowStockCount > 0 && (
          <Card className="border-orange-500/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {lowStockCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Productos por reponer
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>{items?.length || 0} producto(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Precio Est.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const stockPercent =
                    item.maxQuantity > 0
                      ? (item.currentQuantity / item.maxQuantity) * 100
                      : 0;
                  const isLowStock = item.currentQuantity <= item.minQuantity;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {item.name}
                          {isLowStock && (
                            <Badge variant="warning" className="text-xs">
                              Bajo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.category.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-xs">
                            <span>{item.currentQuantity}</span>
                            <span className="text-muted-foreground">
                              /{item.maxQuantity}
                            </span>
                          </div>
                          <Progress
                            value={stockPercent}
                            className={cn(
                              "h-1.5",
                              isLowStock && "[&>div]:bg-orange-500",
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          item.estimatedPrice,
                          item.currency.symbol,
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay productos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
