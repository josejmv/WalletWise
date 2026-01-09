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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

const expenseSchema = z.object({
  categoryId: z.string().min(1, "La categoria es requerida"),
  accountId: z.string().min(1, "La cuenta es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string().optional(),
  isRecurring: z.boolean(),
  periodicity: z.enum(["weekly", "monthly", "yearly"]).optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: {
    id: string;
    amount: number;
    date: string;
    description: string | null;
    isRecurring: boolean;
    periodicity: "weekly" | "monthly" | "yearly" | null;
    category: { id: string };
    account: { id: string };
    currency: { id: string };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function fetchCategories() {
  const res = await fetch("/api/categories");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
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

async function createExpense(data: ExpenseFormData) {
  const res = await fetch("/api/expenses", {
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

async function updateExpense(id: string, data: ExpenseFormData) {
  const res = await fetch(`/api/expenses/${id}`, {
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

export function ExpenseForm({
  expense,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const { toast } = useToast();
  const isEditing = !!expense;

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

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
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      categoryId: "",
      accountId: "",
      amount: 0,
      currencyId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      isRecurring: false,
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        categoryId: expense.category.id,
        accountId: expense.account.id,
        amount: expense.amount,
        currencyId: expense.currency.id,
        date: new Date(expense.date).toISOString().split("T")[0],
        description: expense.description ?? "",
        isRecurring: expense.isRecurring,
        periodicity: expense.periodicity ?? undefined,
      });
    }
  }, [expense, reset]);

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      toast({ title: "Gasto registrado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar gasto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => updateExpense(expense!.id, data),
    onSuccess: () => {
      toast({ title: "Gasto actualizado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar gasto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoadingData =
    loadingCategories || loadingAccounts || loadingCurrencies;
  const isRecurring = watch("isRecurring");

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
        <Label htmlFor="categoryId">Categoria</Label>
        <Select
          value={watch("categoryId")}
          onValueChange={(value) => setValue("categoryId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat: { id: string; name: string }) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-destructive">
            {errors.categoryId.message}
          </p>
        )}
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
          <Label htmlFor="accountId">Cuenta</Label>
          <Select
            value={watch("accountId")}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cuenta origen" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: { id: string; name: string }) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRecurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setValue("isRecurring", !!checked)}
          />
          <Label htmlFor="isRecurring" className="cursor-pointer">
            Gasto recurrente
          </Label>
        </div>

        {isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="periodicity">Periodicidad</Label>
            <Select
              value={watch("periodicity") || ""}
              onValueChange={(value: "weekly" | "monthly" | "yearly") =>
                setValue("periodicity", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona periodicidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar Cambios" : "Registrar Gasto"}
        </Button>
      </div>
    </form>
  );
}
