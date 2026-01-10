"use client";

import { useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

const transferSchema = z.object({
  fromAccountId: z.string().min(1, "La cuenta origen es requerida"),
  toAccountId: z.string().min(1, "La cuenta destino es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  exchangeRate: z.number().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  transfer?: {
    id: string;
    amount: number;
    exchangeRate: number | null;
    date: string;
    description: string | null;
    fromAccount: { id: string };
    toAccount: { id: string };
    currency: { id: string };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function fetchAccounts() {
  const res = await fetch("/api/accounts");
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

async function createTransfer(data: TransferFormData) {
  const res = await fetch("/api/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      date: new Date(data.date),
    }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function updateTransfer(id: string, data: TransferFormData) {
  const res = await fetch(`/api/transfers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      date: new Date(data.date),
    }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function TransferForm({
  transfer,
  onSuccess,
  onCancel,
}: TransferFormProps) {
  const { toast } = useToast();
  const isEditing = !!transfer;

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
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
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: 0,
      currencyId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  useEffect(() => {
    if (transfer) {
      reset({
        fromAccountId: transfer.fromAccount.id,
        toAccountId: transfer.toAccount.id,
        amount: transfer.amount,
        currencyId: transfer.currency.id,
        exchangeRate: transfer.exchangeRate ?? undefined,
        date: new Date(transfer.date).toISOString().split("T")[0],
        description: transfer.description ?? "",
      });
    }
  }, [transfer, reset]);

  const createMutation = useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      toast({ title: "Transferencia registrada correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar transferencia",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TransferFormData) => updateTransfer(transfer!.id, data),
    onSuccess: () => {
      toast({ title: "Transferencia actualizada correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar transferencia",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    if (data.fromAccountId === data.toAccountId) {
      toast({
        title: "Error",
        description: "La cuenta origen y destino deben ser diferentes",
        variant: "destructive",
      });
      return;
    }
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = loadingAccounts || loadingCurrencies;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccountId">Cuenta Origen</Label>
          <Select
            value={watch("fromAccountId")}
            onValueChange={(value) => setValue("fromAccountId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Desde" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: { id: string; name: string }) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fromAccountId && (
            <p className="text-sm text-destructive">
              {errors.fromAccountId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="toAccountId">Cuenta Destino</Label>
          <Select
            value={watch("toAccountId")}
            onValueChange={(value) => setValue("toAccountId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Hacia" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: { id: string; name: string }) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.toAccountId && (
            <p className="text-sm text-destructive">
              {errors.toAccountId.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exchangeRate">Tasa de Cambio (opcional)</Label>
          <Input
            id="exchangeRate"
            type="number"
            step="0.0001"
            placeholder="1.0000"
            {...register("exchangeRate", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripcion (opcional)</Label>
        <Input
          id="description"
          placeholder="Nota adicional"
          {...register("description")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar Cambios" : "Registrar Transferencia"}
        </Button>
      </div>
    </form>
  );
}
