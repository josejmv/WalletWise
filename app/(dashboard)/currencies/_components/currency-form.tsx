"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

const currencySchema = z.object({
  code: z
    .string()
    .min(1, "El codigo es requerido")
    .max(3, "Maximo 3 caracteres"),
  name: z.string().min(1, "El nombre es requerido"),
  symbol: z.string().min(1, "El simbolo es requerido"),
  isBase: z.boolean(),
});

type CurrencyFormData = z.infer<typeof currencySchema>;

interface CurrencyFormProps {
  currency?: {
    id: string;
    code: string;
    name: string;
    symbol: string;
    isBase: boolean;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function createCurrency(data: CurrencyFormData) {
  const res = await fetch("/api/currencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function updateCurrency(id: string, data: CurrencyFormData) {
  const res = await fetch(`/api/currencies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function CurrencyForm({
  currency,
  onSuccess,
  onCancel,
}: CurrencyFormProps) {
  const { toast } = useToast();
  const isEditing = !!currency;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
      isBase: false,
    },
  });

  useEffect(() => {
    if (currency) {
      reset({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        isBase: currency.isBase,
      });
    }
  }, [currency, reset]);

  const createMutation = useMutation({
    mutationFn: createCurrency,
    onSuccess: () => {
      toast({ title: "Moneda creada correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear moneda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CurrencyFormData) => updateCurrency(currency!.id, data),
    onSuccess: () => {
      toast({ title: "Moneda actualizada correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar moneda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CurrencyFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Codigo</Label>
          <Input
            id="code"
            placeholder="USD"
            maxLength={3}
            {...register("code")}
          />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="symbol">Simbolo</Label>
          <Input id="symbol" placeholder="$" {...register("symbol")} />
          {errors.symbol && (
            <p className="text-sm text-destructive">{errors.symbol.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Dolar Estadounidense"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isBase"
          checked={watch("isBase")}
          onCheckedChange={(checked) => setValue("isBase", !!checked)}
        />
        <Label htmlFor="isBase" className="cursor-pointer">
          Moneda base (para conversiones)
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar Cambios" : "Crear Moneda"}
        </Button>
      </div>
    </form>
  );
}
