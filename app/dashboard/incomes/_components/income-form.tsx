"use client";

import { useEffect, useState, useCallback } from "react";
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
import { ExchangeRateDisplay } from "@/components/exchange-rate-display";
import { useExchangeRate } from "@/hooks/use-exchange-rate";

const incomeSchema = z.object({
  jobId: z.string().min(1, "El trabajo es requerido"),
  accountId: z.string().min(1, "La cuenta es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string().optional(),
  exchangeRate: z.number().optional(),
  officialRate: z.number().optional(),
  customRate: z.number().optional(),
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

interface Account {
  id: string;
  name: string;
  currency: {
    id: string;
    code: string;
    symbol: string;
  };
}

interface Currency {
  id: string;
  code: string;
  symbol: string;
}

async function fetchAccounts(): Promise<Account[]> {
  const res = await fetch("/api/accounts");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchCurrencies(): Promise<Currency[]> {
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
  const [customRate, setCustomRate] = useState<number | null>(null);

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

  const watchedAccountId = watch("accountId");
  const watchedCurrencyId = watch("currencyId");
  const watchedAmount = watch("amount");

  // Get selected account and its currency
  const selectedAccount = accounts?.find((a) => a.id === watchedAccountId);
  const selectedCurrency = currencies?.find((c) => c.id === watchedCurrencyId);
  const accountCurrency = selectedAccount?.currency;

  // Check if currencies differ (need exchange rate)
  const needsExchangeRate =
    accountCurrency &&
    selectedCurrency &&
    accountCurrency.id !== selectedCurrency.id;

  // Fetch exchange rate when currencies differ
  const { rate: officialRate, isLoading: loadingRate } = useExchangeRate(
    needsExchangeRate ? watchedCurrencyId : undefined,
    needsExchangeRate ? accountCurrency?.id : undefined,
  );

  // Auto-select currency when account changes
  useEffect(() => {
    if (selectedAccount && !isEditing) {
      setValue("currencyId", selectedAccount.currency.id);
    }
  }, [selectedAccount, setValue, isEditing]);

  // Handle custom rate changes
  const handleCustomRateChange = useCallback((rate: number | null) => {
    setCustomRate(rate);
  }, []);

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
    // Add exchange rate data if currencies differ
    if (needsExchangeRate) {
      const activeRate = customRate || officialRate;
      if (!activeRate) {
        toast({
          title: "Tasa de cambio requerida",
          description: "Ingresa una tasa de cambio para continuar",
          variant: "destructive",
        });
        return;
      }
      data.exchangeRate = activeRate;
      if (officialRate) data.officialRate = officialRate;
      if (customRate) data.customRate = customRate;
    }

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
              {currencies?.map((currency) => (
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
          <Label htmlFor="accountId">Cuenta</Label>
          <Select
            value={watch("accountId")}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cuenta destino" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.currency.code})
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

      {/* Exchange Rate Display */}
      {needsExchangeRate && selectedCurrency && accountCurrency && (
        <ExchangeRateDisplay
          amount={watchedAmount || 0}
          fromCurrencyCode={selectedCurrency.code}
          fromCurrencySymbol={selectedCurrency.symbol}
          toCurrencyCode={accountCurrency.code}
          toCurrencySymbol={accountCurrency.symbol}
          officialRate={officialRate}
          isLoading={loadingRate}
          onCustomRateChange={handleCustomRateChange}
          showCustomInput={true}
        />
      )}

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
