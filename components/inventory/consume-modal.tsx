"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Search, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  currentQuantity: number;
  maxQuantity: number;
  unit: string;
  category: { id: string; name: string } | null;
}

interface ConsumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory-items?isActive=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function consumeItems(
  items: { id: string; quantity: number }[],
): Promise<void> {
  const res = await fetch("/api/inventory-items/consume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

// Unit display mapping
const unitLabels: Record<string, string> = {
  unidades: "uds",
  kg: "kg",
  g: "g",
  L: "L",
  mL: "mL",
  paquetes: "paq",
};

export function ConsumeModal({ open, onOpenChange }: ConsumeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory-items", "active"],
    queryFn: fetchInventoryItems,
    enabled: open,
  });

  const consumeMutation = useMutation({
    mutationFn: consumeItems,
    onSuccess: () => {
      toast({ title: "Consumo registrado correctamente" });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setQuantities({});
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar consumo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.category?.name.toLowerCase().includes(term),
    );
  }, [items, searchTerm]);

  // Calculate selected count
  const selectedCount = Object.values(quantities).filter((q) => q > 0).length;

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = items?.find((i) => i.id === itemId);
    if (!item) return;

    const current = quantities[itemId] || 0;
    const newValue = Math.max(
      0,
      Math.min(item.currentQuantity, current + delta),
    );
    setQuantities((prev) => ({
      ...prev,
      [itemId]: newValue,
    }));
  };

  const handleSubmit = () => {
    const itemsToConsume = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => ({ id, quantity }));

    if (itemsToConsume.length === 0) {
      toast({
        title: "Selecciona al menos un producto",
        variant: "destructive",
      });
      return;
    }

    consumeMutation.mutate(itemsToConsume);
  };

  const handleClose = () => {
    setSearchTerm("");
    setQuantities({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Registrar Consumo
          </DialogTitle>
          <DialogDescription>
            Selecciona los productos y las cantidades consumidas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Items list */}
          <div className="h-[300px] rounded-md border overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {searchTerm
                  ? "No se encontraron productos"
                  : "No hay productos en inventario"}
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const quantity = quantities[item.id] || 0;
                  const isSelected = quantity > 0;
                  const unitLabel = unitLabels[item.unit] || item.unit;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 ${
                        isSelected ? "bg-accent/50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category.name}
                            </Badge>
                          )}
                          <span>
                            Stock: {item.currentQuantity} {unitLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={quantity === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-medium">
                          {quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          disabled={quantity >= item.currentQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected count */}
          {selectedCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedCount} producto(s) seleccionado(s)
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCount === 0 || consumeMutation.isPending}
          >
            {consumeMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Registrar Consumo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
