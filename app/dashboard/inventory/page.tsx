"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { InventoryItemForm } from "./_components/inventory-item-form";
import { ConsumeModal } from "@/components/inventory/consume-modal";

interface InventoryItem {
  id: string;
  name: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: "unidades" | "kg" | "g" | "L" | "mL" | "paquetes";
  estimatedPrice: number;
  isActive: boolean;
  notes: string | null;
  category: { id: string; name: string } | null;
  currency: { id: string; code: string; symbol: string };
}

async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory-items");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function deleteInventoryItem(id: string): Promise<void> {
  const res = await fetch(`/api/inventory-items/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol} ${new Intl.NumberFormat("es-CO").format(value)}`;
}

export default function InventoryPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // v1.4.0: Consume modal state
  const [consumeOpen, setConsumeOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: fetchInventoryItems,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      // v1.4.0: Also invalidate categories to update item counts
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      toast({ title: "Producto eliminado" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
    // v1.4.0: Also invalidate categories to update item counts
    queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Inventario
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona tu inventario del hogar
          </p>
        </div>
        <div className="flex gap-2">
          {/* v1.4.0: Consume button */}
          <Button
            variant="outline"
            size="sm"
            className="sm:size-default"
            onClick={() => setConsumeOpen(true)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Consumir</span>
          </Button>
          <Button
            size="sm"
            className="sm:size-default"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Nuevo</span> Producto
          </Button>
        </div>
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
        <CardContent className="px-2 sm:px-6">
          {items && items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Categoria
                    </TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Unidad
                    </TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Precio Est.
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
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
                            <span className="truncate max-w-[100px] sm:max-w-none">
                              {item.name}
                            </span>
                            {isLowStock && (
                              <Badge
                                variant="warning"
                                className="text-xs shrink-0"
                              >
                                Bajo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {item.category?.name ?? (
                            <span className="text-muted-foreground italic">
                              Sin categoria
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 w-20 sm:w-32">
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
                        <TableCell className="hidden md:table-cell">
                          {item.unit}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {formatCurrency(
                            item.estimatedPrice,
                            item.currency.symbol,
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay productos registrados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            item={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              este producto del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* v1.4.0: Consume modal */}
      <ConsumeModal open={consumeOpen} onOpenChange={setConsumeOpen} />
    </div>
  );
}
