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

const budgetSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["goal", "envelope"]),
  targetAmount: z.number().min(1, "El monto objetivo debe ser mayor a 0"),
  currentAmount: z.number().optional(),
  currencyId: z.string().min(1, "La moneda es requerida"),
  accountId: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  budget?: {
    id: string;
    name: string;
    type: "goal" | "envelope";
    targetAmount: number;
    currentAmount: number;
    deadline: string | null;
    status: "active" | "completed" | "cancelled";
    currency: { id: string };
    account: { id: string } | null;
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

async function createBudget(data: BudgetFormData) {
  const res = await fetch("/api/budgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function updateBudget(id: string, data: BudgetFormData) {
  const res = await fetch(`/api/budgets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : null,
    }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function BudgetForm({ budget, onSuccess, onCancel }: BudgetFormProps) {
  const { toast } = useToast();
  const isEditing = !!budget;

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
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      type: "goal",
      targetAmount: 0,
      currentAmount: 0,
      currencyId: "",
      accountId: "none",
      deadline: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        type: budget.type,
        targetAmount: budget.targetAmount,
        currentAmount: budget.currentAmount,
        currencyId: budget.currency.id,
        accountId: budget.account?.id ?? "none",
        deadline: budget.deadline
          ? new Date(budget.deadline).toISOString().split("T")[0]
          : "",
        status: budget.status,
      });
    }
  }, [budget, reset]);

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      toast({ title: "Presupuesto creado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear presupuesto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BudgetFormData) => updateBudget(budget!.id, data),
    onSuccess: () => {
      toast({ title: "Presupuesto actualizado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar presupuesto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    const submitData = {
      ...data,
      accountId: data.accountId === "none" ? undefined : data.accountId,
      deadline: data.deadline || undefined,
    };
    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
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
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Fondo de emergencia"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={watch("type")}
            onValueChange={(value: "goal" | "envelope") =>
              setValue("type", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">Meta de Ahorro</SelectItem>
              <SelectItem value="envelope">Sobre de Gasto</SelectItem>
            </SelectContent>
          </Select>
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
          {errors.currencyId && (
            <p className="text-sm text-destructive">
              {errors.currencyId.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Monto Objetivo</Label>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("targetAmount", { valueAsNumber: true })}
          />
          {errors.targetAmount && (
            <p className="text-sm text-destructive">
              {errors.targetAmount.message}
            </p>
          )}
        </div>
        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="currentAmount">Monto Actual</Label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("currentAmount", { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Cuenta (opcional)</Label>
          <Select
            value={watch("accountId") || "none"}
            onValueChange={(value) =>
              setValue("accountId", value === "none" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin cuenta asignada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin cuenta asignada</SelectItem>
              {accounts?.map((account: { id: string; name: string }) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Fecha Limite (opcional)</Label>
          <Input id="deadline" type="date" {...register("deadline")} />
        </div>
      </div>

      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={watch("status")}
            onValueChange={(value: "active" | "completed" | "cancelled") =>
              setValue("status", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar Cambios" : "Crear Presupuesto"}
        </Button>
      </div>
    </form>
  );
}
