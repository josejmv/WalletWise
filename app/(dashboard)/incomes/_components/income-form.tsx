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

const incomeSchema = z.object({
  jobId: z.string().min(1, "El trabajo es requerido"),
  accountId: z.string().min(1, "La cuenta es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  income?: {
    id: string;
    amount: number;
    date: string;
    description: string | null;
    job: { id: string };
    account: { id: string };
    currency: { id: string };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function fetchJobs() {
  const res = await fetch("/api/jobs?status=active");
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

async function createIncome(data: IncomeFormData) {
  const res = await fetch("/api/incomes", {
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

async function updateIncome(id: string, data: IncomeFormData) {
  const res = await fetch(`/api/incomes/${id}`, {
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

export function IncomeForm({ income, onSuccess, onCancel }: IncomeFormProps) {
  const { toast } = useToast();
  const isEditing = !!income;

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["jobs", "active"],
    queryFn: fetchJobs,
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
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      jobId: "",
      accountId: "",
      amount: 0,
      currencyId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  useEffect(() => {
    if (income) {
      reset({
        jobId: income.job.id,
        accountId: income.account.id,
        amount: income.amount,
        currencyId: income.currency.id,
        date: new Date(income.date).toISOString().split("T")[0],
        description: income.description ?? "",
      });
    }
  }, [income, reset]);

  const createMutation = useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      toast({ title: "Ingreso registrado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar ingreso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: IncomeFormData) => updateIncome(income!.id, data),
    onSuccess: () => {
      toast({ title: "Ingreso actualizado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar ingreso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncomeFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = loadingJobs || loadingAccounts || loadingCurrencies;

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
        <Label htmlFor="jobId">Trabajo</Label>
        <Select
          value={watch("jobId")}
          onValueChange={(value) => setValue("jobId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un trabajo" />
          </SelectTrigger>
          <SelectContent>
            {jobs?.map((job: { id: string; name: string }) => (
              <SelectItem key={job.id} value={job.id}>
                {job.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.jobId && (
          <p className="text-sm text-destructive">{errors.jobId.message}</p>
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
              {currencies?.map(
                (currency: { id: string; code: string; name: string }) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    {currency.code}
                  </SelectItem>
                ),
              )}
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
          <Label htmlFor="accountId">Cuenta</Label>
          <Select
            value={watch("accountId")}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cuenta destino" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: { id: string; name: string }) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-destructive">
              {errors.accountId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
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
          {isEditing ? "Guardar Cambios" : "Registrar Ingreso"}
        </Button>
      </div>
    </form>
  );
}
