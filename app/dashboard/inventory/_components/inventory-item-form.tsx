"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

// Schema for form validation - handles NaN from empty inputs
const inventoryItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  categoryId: z.string().nullable().optional(),
  currentQuantity: z.number().transform((v) => (Number.isNaN(v) ? 0 : v)),
  maxQuantity: z
    .number()
    .refine(
      (v) => !Number.isNaN(v) && v >= 1,
      "La cantidad maxima es requerida",
    ),
  minQuantity: z.number().transform((v) => (Number.isNaN(v) ? 0 : v)),
  unit: z.enum(["unidades", "kg", "g", "L", "mL", "paquetes"]),
  estimatedPrice: z.number().transform((v) => (Number.isNaN(v) ? 0 : v)),
  currencyId: z.string().min(1, "La moneda es requerida"),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

interface InventoryItemFormProps {
  item?: {
    id: string;
    name: string;
    currentQuantity: number;
    maxQuantity: number;
    minQuantity: number;
    unit: "unidades" | "kg" | "g" | "L" | "mL" | "paquetes";
    estimatedPrice: number;
    isActive: boolean;
    notes: string | null;
    category: { id: string } | null;
    currency: { id: string };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function fetchCategories() {
  const res = await fetch("/api/inventory-categories");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchCurrencies() {
  const res = await fetch("/api/currencies");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function createInventoryItem(data: InventoryItemFormData) {
  const res = await fetch("/api/inventory-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function updateInventoryItem(id: string, data: InventoryItemFormData) {
  const res = await fetch(`/api/inventory-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function InventoryItemForm({
  item,
  onSuccess,
  onCancel,
}: InventoryItemFormProps) {
  const { toast } = useToast();
  const isEditing = !!item;

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: fetchCategories,
  });

  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          categoryId: item.category?.id ?? null,
          currentQuantity: item.currentQuantity,
          maxQuantity: item.maxQuantity,
          minQuantity: item.minQuantity,
          unit: item.unit,
          estimatedPrice: item.estimatedPrice,
          currencyId: item.currency.id,
          isActive: item.isActive,
          notes: item.notes ?? "",
        }
      : {
          name: "",
          categoryId: null,
          currentQuantity: "" as unknown as number,
          maxQuantity: "" as unknown as number,
          minQuantity: "" as unknown as number,
          unit: "unidades" as const,
          estimatedPrice: "" as unknown as number,
          currencyId: "",
          isActive: true,
          notes: "",
        },
  });

  const createMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      toast({ title: "Producto creado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear producto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InventoryItemFormData) =>
      updateInventoryItem(item!.id, data),
    onSuccess: () => {
      toast({ title: "Producto actualizado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar producto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryItemFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = loadingCategories || loadingCurrencies;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <form
      key={item?.id ?? "new"}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" placeholder="Arroz" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoria (opcional)</Label>
          <Select
            value={watch("categoryId") ?? "__none__"}
            onValueChange={(value) =>
              setValue("categoryId", value === "__none__" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin categoria</SelectItem>
              {categories?.map((cat: { id: string; name: string }) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidad</Label>
          <Select
            value={watch("unit")}
            onValueChange={(
              value: "unidades" | "kg" | "g" | "L" | "mL" | "paquetes",
            ) => setValue("unit", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unidades">Unidades</SelectItem>
              <SelectItem value="kg">Kilogramos</SelectItem>
              <SelectItem value="g">Gramos</SelectItem>
              <SelectItem value="L">Litros</SelectItem>
              <SelectItem value="mL">Mililitros</SelectItem>
              <SelectItem value="paquetes">Paquetes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentQuantity">Cantidad Actual</Label>
          <Input
            id="currentQuantity"
            type="number"
            step="0.01"
            placeholder="0"
            {...register("currentQuantity", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Cantidad Minima</Label>
          <Input
            id="minQuantity"
            type="number"
            step="0.01"
            placeholder="0"
            {...register("minQuantity", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxQuantity">Cantidad Maxima</Label>
          <Input
            id="maxQuantity"
            type="number"
            step="0.01"
            placeholder="10"
            {...register("maxQuantity", { valueAsNumber: true })}
          />
          {errors.maxQuantity && (
            <p className="text-sm text-destructive">
              {errors.maxQuantity.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedPrice">Precio Estimado</Label>
          <Input
            id="estimatedPrice"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("estimatedPrice", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currencyId">Moneda</Label>
          <Select
            value={watch("currencyId")}
            onValueChange={(value) => setValue("currencyId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Moneda" />
            </SelectTrigger>
            <SelectContent>
              {currencies?.map((currency: { id: string; code: string }) => (
                <SelectItem key={currency.id} value={currency.id}>
                  {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input
          id="notes"
          placeholder="Notas adicionales"
          {...register("notes")}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={watch("isActive")}
          onCheckedChange={(checked) => setValue("isActive", !!checked)}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Producto activo
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>
    </form>
  );
}
