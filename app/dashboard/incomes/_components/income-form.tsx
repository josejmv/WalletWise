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
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { ExchangeRateDisplay } from "@/components/exchange-rate-display";
import { useExchangeRate } from "@/hooks/use-exchange-rate";

import { Checkbox } from "@/components/ui/checkbox";

const incomeSchema = z.object({
  // jobId is optional - empty string or null means "Ingreso Extra"
  jobId: z.string().optional(),
  accountId: z.string().min(1, "La cuenta es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string().optional(),
  exchangeRate: z.number().optional(),
  officialRate: z.number().optional(),
  customRate: z.number().optional(),
  // Change (vuelto) system
  hasChange: z.boolean().optional(),
  changeAmount: z.number().min(0).optional(),
  changeAccountId: z.string().optional(),
  changeCurrencyId: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  income?: {
    id: string;
    amount: number;
    date: string;
    description: string | null;
    // job is optional (null = "Ingreso Extra")
    job: { id: string } | null;
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
      // Send null if no job selected (Ingreso Extra)
      jobId: data.jobId || null,
      // Parse as noon local time to avoid timezone issues
      date: new Date(data.date + "T12:00:00"),
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
      // Send null if no job selected (Ingreso Extra)
      jobId: data.jobId || null,
      // Parse as noon local time to avoid timezone issues
      date: new Date(data.date + "T12:00:00"),
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
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: income
      ? {
          // job can be null for "Ingreso Extra"
          jobId: income.job?.id ?? "",
          accountId: income.account.id,
          amount: income.amount,
          currencyId: income.currency.id,
          date: new Date(income.date).toISOString().split("T")[0],
          description: income.description ?? "",
        }
      : {
          jobId: "",
          accountId: "",
          amount: "" as unknown as number,
          currencyId: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          // Change (vuelto) system
          hasChange: false,
          changeAmount: undefined as unknown as number,
          changeAccountId: "",
          changeCurrencyId: "",
        },
  });

  const watchedAccountId = watch("accountId");
  const watchedCurrencyId = watch("currencyId");
  const watchedAmount = watch("amount");
  const watchedChangeAccountId = watch("changeAccountId");
  const watchedChangeCurrencyId = watch("changeCurrencyId");
  const watchedChangeAmount = watch("changeAmount");

  // Get selected account and its currency
  const selectedAccount = accounts?.find((a) => a.id === watchedAccountId);
  const selectedCurrency = currencies?.find((c) => c.id === watchedCurrencyId);
  const accountCurrency = selectedAccount?.currency;

  // Get change account and currency for vuelto calculations
  const effectiveChangeAccountId = watchedChangeAccountId || watchedAccountId;
  const changeAccount = accounts?.find((a) => a.id === effectiveChangeAccountId);
  const changeCurrency = currencies?.find((c) => c.id === watchedChangeCurrencyId);

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

  // Fetch exchange rate from account currency to change currency
  // This allows us to convert change amount back to account currency
  const changeNeedsConversion =
    changeCurrency &&
    accountCurrency &&
    changeCurrency.id !== accountCurrency.id;

  const { rate: accountToChangeRate } = useExchangeRate(
    changeNeedsConversion ? accountCurrency?.id : undefined,
    changeNeedsConversion ? watchedChangeCurrencyId : undefined,
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
    <form
      key={income?.id ?? "new"}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="jobId">Trabajo (opcional)</Label>
        <Select
          value={watch("jobId") || "none"}
          onValueChange={(value) =>
            setValue("jobId", value === "none" ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un trabajo" />
          </SelectTrigger>
          <SelectContent>
            {/* v1.4.0: Option for income without job */}
            <SelectItem value="none" className="text-muted-foreground italic">
              Sin trabajo (Ingreso Extra)
            </SelectItem>
            {jobs?.map((job: { id: string; name: string }) => (
              <SelectItem key={job.id} value={job.id}>
                {job.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* v1.6.0: Change (vuelto) system */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasChange"
            checked={watch("hasChange") || false}
            onCheckedChange={(checked) => {
              setValue("hasChange", !!checked);
              if (!checked) {
                setValue("changeAmount", undefined as unknown as number);
                setValue("changeAccountId", "");
                setValue("changeCurrencyId", "");
              } else {
                // Auto-select account currency as change currency
                const changeAccId = watch("changeAccountId") || watch("accountId");
                const changeAcc = accounts?.find((a) => a.id === changeAccId);
                if (changeAcc) {
                  setValue("changeCurrencyId", changeAcc.currency.id);
                }
              }
            }}
          />
          <Label htmlFor="hasChange" className="cursor-pointer">
            Di vuelto
          </Label>
        </div>

        {watch("hasChange") && (
          <div className="space-y-4 pl-6 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="changeAccountId">Cuenta del vuelto</Label>
              <Select
                value={watch("changeAccountId") || watch("accountId")}
                onValueChange={(value) => {
                  setValue("changeAccountId", value);
                  // Auto-select the account's currency
                  const changeAcc = accounts?.find((a) => a.id === value);
                  if (changeAcc) {
                    setValue("changeCurrencyId", changeAcc.currency.id);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Misma cuenta" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="changeAmount">
                Monto del vuelto
                {changeCurrency && (
                  <span className="text-muted-foreground ml-1">
                    ({changeCurrency.code})
                  </span>
                )}
              </Label>
              <Input
                id="changeAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("changeAmount", { valueAsNumber: true })}
              />
              {errors.changeAmount && (
                <p className="text-sm text-destructive">
                  {errors.changeAmount.message}
                </p>
              )}
            </div>
            {/* v1.6.0: Detailed transaction summary */}
            {watchedAmount > 0 && (watchedChangeAmount || 0) > 0 && selectedAccount && changeCurrency && accountCurrency && (
              <div className="text-sm bg-muted/50 p-3 rounded space-y-2">
                <p className="font-medium text-foreground border-b border-border pb-1 mb-2">
                  Resumen del movimiento:
                </p>

                {(() => {
                  // Check if change comes from same account
                  const sameAccount = effectiveChangeAccountId === watchedAccountId;
                  const sameAccountCurrency = changeCurrency.id === accountCurrency.id;

                  // Calculate income amount in account currency
                  const incomeInAccountCurrency = needsExchangeRate && officialRate
                    ? watchedAmount * officialRate
                    : watchedAmount;

                  // Convert change to account currency using rate: accountCurrency -> changeCurrency
                  // changeAmount / rate = equivalent in account currency
                  // Example: 3671.77 COP / 3671.77 = 1 USD
                  const changeInAccountCurrency = !sameAccountCurrency && accountToChangeRate
                    ? (watchedChangeAmount || 0) / accountToChangeRate
                    : (watchedChangeAmount || 0);

                  // Net credit = income - change given (both in account currency)
                  const netCredit = incomeInAccountCurrency - changeInAccountCurrency;

                  return (
                    <>
                      {/* 1. Net credit to income account */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Crédito a {selectedAccount.name} ({accountCurrency.code}):
                        </span>
                        <span className="font-mono text-success font-medium">
                          +{accountCurrency.symbol}{netCredit.toFixed(2)} {accountCurrency.code}
                        </span>
                      </div>

                      {/* 2. Change given - only show if different account or currency */}
                      {(!sameAccount || !sameAccountCurrency) && (
                        <div className="flex justify-between pt-1">
                          <span className="text-muted-foreground">
                            Vuelto dado de {changeAccount?.name || selectedAccount.name} ({changeCurrency.code}):
                          </span>
                          <span className="font-mono text-destructive font-medium">
                            -{changeCurrency.symbol}{watchedChangeAmount.toFixed(2)} {changeCurrency.code}
                          </span>
                        </div>
                      )}

                      {/* 3. Exchange rate if currencies differ */}
                      {!sameAccountCurrency && accountToChangeRate && (
                        <>
                          <div className="flex justify-between pt-2 border-t border-border mt-2 text-xs text-muted-foreground">
                            <span>Tasa de cambio ({accountCurrency.code} → {changeCurrency.code}):</span>
                            <span className="font-mono">{accountToChangeRate.toFixed(2)}</span>
                          </div>
                          {/* Show conversion detail */}
                          <div className="text-xs text-muted-foreground pl-4">
                            ({changeCurrency.symbol}{watchedChangeAmount.toFixed(2)} ÷ {accountToChangeRate.toFixed(2)} = {accountCurrency.symbol}{changeInAccountCurrency.toFixed(2)} {accountCurrency.code})
                          </div>
                        </>
                      )}

                      {/* Show explanation for same account */}
                      {sameAccount && sameAccountCurrency && (
                        <div className="text-xs text-muted-foreground pt-1">
                          (Monto - Vuelto = Crédito neto)
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
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
