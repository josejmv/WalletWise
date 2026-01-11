"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useFormatters } from "@/contexts/user-config-context";

const contributeSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  fromAccountId: z.string().min(1, "Selecciona una cuenta"),
  description: z.string().optional(),
});

type ContributeFormData = z.infer<typeof contributeSchema>;

interface Budget {
  id: string;
  name: string;
  currentAmount: number;
  // v1.3.0: targetAmount can be null (budgets without goal)
  targetAmount: number | null;
  currency: { id: string; code: string; symbol: string };
  account: { id: string; name: string };
}

interface ContributeModalProps {
  budget: Budget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

async function fetchAccounts() {
  const res = await fetch("/api/accounts");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function contributeToBudget(budgetId: string, data: ContributeFormData) {
  const res = await fetch(`/api/budgets/${budgetId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "contribute", ...data }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function ContributeModal({
  budget,
  open,
  onOpenChange,
  onSuccess,
}: ContributeModalProps) {
  const { formatCurrency } = useFormatters();
  const { toast } = useToast();

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
    enabled: open,
  });

  // Filtrar cuentas por la misma moneda del budget
  const compatibleAccounts = accounts?.filter(
    (acc: { currencyId: string }) => acc.currencyId === budget.currency.id,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      amount: 0,
      fromAccountId: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ContributeFormData) =>
      contributeToBudget(budget.id, data),
    onSuccess: () => {
      toast({ title: "Contribucion realizada correctamente" });
      reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al contribuir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContributeFormData) => {
    mutation.mutate(data);
  };

  const selectedAccountId = watch("fromAccountId");
  const selectedAccount = compatibleAccounts?.find(
    (acc: { id: string }) => acc.id === selectedAccountId,
  );

  // v1.3.0: Handle null targetAmount
  const hasTarget = budget.targetAmount !== null && budget.targetAmount > 0;
  const remaining = hasTarget
    ? Number(budget.targetAmount) - Number(budget.currentAmount)
    : null;
  const progress = hasTarget
    ? (Number(budget.currentAmount) / Number(budget.targetAmount!)) * 100
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contribuir a {budget.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* v1.3.0: Show progress info only if there's a target */}
          {hasTarget ? (
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso actual</span>
                <span className="font-medium">{progress!.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(progress!, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {formatCurrency(
                    Number(budget.currentAmount),
                    budget.currency.code,
                  )}
                </span>
                <span>
                  Faltan: {formatCurrency(remaining!, budget.currency.code)}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground">
                Monto actual bloqueado:
              </p>
              <p className="text-lg font-bold">
                {formatCurrency(
                  Number(budget.currentAmount),
                  budget.currency.code,
                )}
              </p>
            </div>
          )}

          {loadingAccounts ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccountId">Cuenta origen</Label>
                <Select
                  value={watch("fromAccountId")}
                  onValueChange={(value) => setValue("fromAccountId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {compatibleAccounts?.length === 0 && (
                      <SelectItem value="none" disabled>
                        No hay cuentas en {budget.currency.code}
                      </SelectItem>
                    )}
                    {compatibleAccounts?.map(
                      (account: {
                        id: string;
                        name: string;
                        balance: number;
                      }) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (
                          {formatCurrency(
                            Number(account.balance),
                            budget.currency.code,
                          )}
                          )
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {errors.fromAccountId && (
                  <p className="text-sm text-destructive">
                    {errors.fromAccountId.message}
                  </p>
                )}
                {selectedAccount && (
                  <p className="text-sm text-muted-foreground">
                    Disponible:{" "}
                    {formatCurrency(
                      Number(selectedAccount.balance),
                      budget.currency.code,
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monto a contribuir</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">
                    {errors.amount.message}
                  </p>
                )}
                <div className="flex gap-2">
                  {/* v1.3.0: Only show "Completar meta" if there's a target */}
                  {hasTarget && remaining !== null && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue("amount", remaining)}
                      disabled={remaining <= 0}
                    >
                      Completar meta
                    </Button>
                  )}
                  {selectedAccount && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setValue("amount", Number(selectedAccount.balance))
                      }
                    >
                      Max disponible
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Nota sobre esta contribucion..."
                  {...register("description")}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                  Contribuir
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
