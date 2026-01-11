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
import { InlineAccountModal } from "@/components/inline-account-modal";

const jobSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["fixed", "freelance"]),
  salary: z.number().min(0.01, "El salario es requerido"),
  currencyId: z.string().min(1, "La moneda es requerida"),
  accountId: z.string().min(1, "La cuenta es requerida"),
  periodicity: z.enum(["biweekly", "monthly", "one_time"]),
  payDay: z.number().min(1).max(31).optional(),
  status: z.enum(["active", "archived", "pending"]).optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  job?: {
    id: string;
    name: string;
    type: "fixed" | "freelance";
    salary: number;
    payDay: number | null;
    status: "active" | "archived" | "pending";
    periodicity: "biweekly" | "monthly" | "one_time";
    currency: { id: string };
    account: { id: string };
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

async function createJob(data: JobFormData) {
  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function updateJob(id: string, data: JobFormData) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function JobForm({ job, onSuccess, onCancel }: JobFormProps) {
  const { toast } = useToast();
  const isEditing = !!job;

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
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: "",
      type: "fixed",
      salary: undefined as unknown as number, // Empty by default
      currencyId: "",
      accountId: "",
      periodicity: "monthly",
      status: "active",
    },
  });

  useEffect(() => {
    if (job) {
      reset({
        name: job.name,
        type: job.type,
        salary: job.salary,
        currencyId: job.currency.id,
        accountId: job.account.id,
        periodicity: job.periodicity,
        payDay: job.payDay ?? undefined,
        status: job.status,
      });
    }
  }, [job, reset]);

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast({ title: "Trabajo creado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear trabajo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: JobFormData) => updateJob(job!.id, data),
    onSuccess: () => {
      toast({ title: "Trabajo actualizado correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar trabajo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
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
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" placeholder="Mi trabajo" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={watch("type")}
            onValueChange={(value: "fixed" | "freelance") =>
              setValue("type", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de trabajo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fijo</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodicity">Periodicidad</Label>
          <Select
            value={watch("periodicity")}
            onValueChange={(value: "biweekly" | "monthly" | "one_time") =>
              setValue("periodicity", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Periodicidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="biweekly">Quincenal</SelectItem>
              <SelectItem value="one_time">Unico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary">Salario</Label>
          <Input
            id="salary"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("salary", { valueAsNumber: true })}
          />
          {errors.salary && (
            <p className="text-sm text-destructive">{errors.salary.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payDay">Dia de Pago</Label>
          <Input
            id="payDay"
            type="number"
            min={1}
            max={31}
            placeholder="15"
            {...register("payDay", { valueAsNumber: true })}
          />
        </div>
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
        <Label htmlFor="accountId">Cuenta de Deposito</Label>
        <div className="flex gap-2">
          <Select
            value={watch("accountId")}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecciona una cuenta" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: { id: string; name: string }) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InlineAccountModal
            onAccountCreated={(accountId) => setValue("accountId", accountId)}
          />
        </div>
        {errors.accountId && (
          <p className="text-sm text-destructive">{errors.accountId.message}</p>
        )}
      </div>

      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={watch("status")}
            onValueChange={(value: "active" | "archived" | "pending") =>
              setValue("status", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
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
          {isEditing ? "Guardar Cambios" : "Crear Trabajo"}
        </Button>
      </div>
    </form>
  );
}
