"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface ShoppingListItem {
  id: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  currentQuantity: number;
  neededQuantity: number;
  unit: string;
  estimatedPrice: number;
  currencyCode: string;
  estimatedTotal: number;
  priority: "high" | "medium" | "low";
  isPurchased: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  totalEstimatedCost: number;
  itemCount: number;
}

async function fetchShoppingList(): Promise<ShoppingList> {
  const res = await fetch("/api/shopping-list");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

const priorityConfig = {
  high: { label: "Alta", variant: "destructive" as const },
  medium: { label: "Media", variant: "warning" as const },
  low: { label: "Baja", variant: "secondary" as const },
};

export default function ShoppingListPage() {
  const {
    data: list,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["shopping-list"],
    queryFn: fetchShoppingList,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
        </div>
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-2" />
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
            Lista de Compras
          </h1>
          <p className="text-muted-foreground">
            Productos que necesitas reponer
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{list?.itemCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Costo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {new Intl.NumberFormat("es-CO").format(
                list?.totalEstimatedCost || 0,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{list?.name || "Lista de Compras"}</CardTitle>
          <CardDescription>Ordenado por prioridad</CardDescription>
        </CardHeader>
        <CardContent>
          {list?.items && list.items.length > 0 ? (
            <div className="space-y-4">
              {list.items.map((item) => {
                const config = priorityConfig[item.priority];

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox checked={item.isPurchased} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.itemName}</span>
                          <Badge variant={config.variant} className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.categoryName} • {item.neededQuantity}{" "}
                          {item.unit}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        $
                        {new Intl.NumberFormat("es-CO").format(
                          item.estimatedTotal,
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${item.estimatedPrice}/{item.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No hay productos por comprar</p>
              <p className="text-sm">Tu inventario esta completo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
