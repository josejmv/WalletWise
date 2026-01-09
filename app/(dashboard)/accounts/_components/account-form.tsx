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

const accountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  accountTypeId: z.string().min(1, "El tipo de cuenta es requerido"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  balance: z.number(),
  isActive: z.boolean(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: {
    id: string;
    name: string;
    balance: number;
    isActive: boolean;
    accountType: { id: string };
    currency: { id: string };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function fetchAccountTypes() {
  const res = await fetch("/api/account-types");
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

async function createAccount(data: AccountFormData) {
  const res = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function updateAccount(id: string, data: AccountFormData) {
  const res = await fetch(`/api/accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function AccountForm({
  account,
  onSuccess,
  onCancel,
}: AccountFormProps) {
  const { toast } = useToast();
  const isEditing = !!account;

  const { data: accountTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ["account-types"],
    queryFn: fetchAccountTypes,
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
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      accountTypeId: "",
      currencyId: "",
      balance: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        accountTypeId: account.accountType.id,
        currencyId: account.currency.id,
        balance: account.balance,
        isActive: account.isActive,
      });
    }
  }, [account, reset]);

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      toast({ title: "Cuenta creada correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear cuenta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AccountFormData) => updateAccount(account!.id, data),
    onSuccess: () => {
      toast({ title: "Cuenta actualizada correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar cuenta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = loadingTypes || loadingCurrencies;

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
          placeholder="Mi cuenta bancaria"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountTypeId">Tipo de Cuenta</Label>
        <Select
          value={watch("accountTypeId")}
          onValueChange={(value) => setValue("accountTypeId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            {accountTypes?.map((type: { id: string; name: string }) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.accountTypeId && (
          <p className="text-sm text-destructive">
            {errors.accountTypeId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currencyId">Moneda</Label>
        <Select
          value={watch("currencyId")}
          onValueChange={(value) => setValue("currencyId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una moneda" />
          </SelectTrigger>
          <SelectContent>
            {currencies?.map(
              (currency: { id: string; code: string; name: string }) => (
                <SelectItem key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
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

      <div className="space-y-2">
        <Label htmlFor="balance">Balance Inicial</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("balance", { valueAsNumber: true })}
        />
        {errors.balance && (
          <p className="text-sm text-destructive">{errors.balance.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar Cambios" : "Crear Cuenta"}
        </Button>
      </div>
    </form>
  );
}
