"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  accountTypeId: z.string().min(1, "El tipo es requerido"),
  currencyId: z.string().min(1, "La moneda es requerida"),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface InlineAccountModalProps {
  onAccountCreated: (accountId: string) => void;
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
    body: JSON.stringify({ ...data, balance: 0 }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function InlineAccountModal({
  onAccountCreated,
}: InlineAccountModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accountTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ["account-types"],
    queryFn: fetchAccountTypes,
    enabled: open,
  });

  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      accountTypeId: "",
      currencyId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: (data) => {
      toast({ title: "Cuenta creada correctamente" });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onAccountCreated(data.id);
      setOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear cuenta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    createMutation.mutate(data);
  };

  const isLoading = loadingTypes || loadingCurrencies;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          title="Crear nueva cuenta"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Cuenta</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inline-name">Nombre</Label>
              <Input
                id="inline-name"
                placeholder="Mi cuenta"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inline-type">Tipo</Label>
              <Select
                value={watch("accountTypeId")}
                onValueChange={(value) => setValue("accountTypeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes?.map(
                    (type: { id: string; name: string; type: string }) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {errors.accountTypeId && (
                <p className="text-sm text-destructive">
                  {errors.accountTypeId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inline-currency">Moneda</Label>
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

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Spinner className="mr-2 h-4 w-4" />
                )}
                Crear Cuenta
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
