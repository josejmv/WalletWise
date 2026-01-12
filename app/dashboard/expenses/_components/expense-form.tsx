"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ControlledDatePicker } from "@/components/ui/date-picker";
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
import { ExchangeRateDisplay } from "@/components/exchange-rate-display";
import { useExchangeRate } from "@/hooks/use-exchange-rate";

const expenseSchema = z.object({
  categoryId: z.string().min(1, "La categoria es requerida"),
  accountId: z.string().min(1, "La cuenta es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string().optional(),
  isRecurring: z.boolean(),
  periodicity: z.enum(["weekly", "monthly", "yearly"]).optional(),
  // Exchange rate fields
  exchangeRate: z.number().optional(),
  officialRate: z.number().optional(),
  customRate: z.number().optional(),
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

interface Category {
  id: string;
  name: string;
  parent: { id: string; name: string } | null;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Helper to get category display name with parent
function getCategoryDisplayName(category: Category): string {
  if (category.parent) {
    return `${category.name} (${category.parent.name})`;
  }
  return category.name;
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

async function createExpense(data: ExpenseFormData) {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      // Parse as noon local time to avoid timezone issues
      date: new Date(data.date + "T12:00:00"),
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
      // Parse as noon local time to avoid timezone issues
      date: new Date(data.date + "T12:00:00"),
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
  const [customRate, setCustomRate] = useState<number | null>(null);

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
      // v1.3.0: No default value for amount - use placeholder instead
      amount: undefined as unknown as number,
      currencyId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      isRecurring: false,
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
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {getCategoryDisplayName(cat)}
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
              {currencies?.map((currency) => (
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
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <ControlledDatePicker
            id="date"
            field={{
              value: watch("date"),
              onChange: (value) => setValue("date", value),
            }}
          />
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
