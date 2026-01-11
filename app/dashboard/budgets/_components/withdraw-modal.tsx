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

const withdrawSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  toAccountId: z.string().min(1, "Selecciona una cuenta"),
  description: z.string().optional(),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

interface Budget {
  id: string;
  name: string;
  currentAmount: number;
  // v1.3.0: targetAmount can be null (budgets without goal)
  targetAmount: number | null;
  status: "active" | "completed" | "cancelled";
  currency: { id: string; code: string; symbol: string };
  account: { id: string; name: string };
}

interface WithdrawModalProps {
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

async function withdrawFromBudget(budgetId: string, data: WithdrawFormData) {
  const res = await fetch(`/api/budgets/${budgetId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "withdraw", ...data }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function WithdrawModal({
  budget,
  open,
  onOpenChange,
  onSuccess,
}: WithdrawModalProps) {
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
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      toAccountId: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: WithdrawFormData) => withdrawFromBudget(budget.id, data),
    onSuccess: () => {
      toast({ title: "Retiro realizado correctamente" });
      reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al retirar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WithdrawFormData) => {
    mutation.mutate(data);
  };

  const currentAmount = Number(budget.currentAmount);
  // v1.3.0: Handle null targetAmount
  const hasTarget = budget.targetAmount !== null && budget.targetAmount > 0;
  const progress = hasTarget
    ? (currentAmount / Number(budget.targetAmount!)) * 100
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Retirar de {budget.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Budget info */}
          <div className="rounded-lg bg-muted p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Saldo bloqueado</span>
              <span className="font-medium">
                {formatCurrency(currentAmount, budget.currency.code)}
              </span>
            </div>
            {/* v1.3.0: Only show progress bar if there's a target */}
            {hasTarget && progress !== null && (
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
            {budget.status === "completed" && (
              <p className="text-sm text-green-600 font-medium">
                Meta completada
              </p>
            )}
          </div>

          {currentAmount <= 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No hay saldo disponible para retirar
              </p>
            </div>
          ) : loadingAccounts ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toAccountId">Cuenta destino</Label>
                <Select
                  value={watch("toAccountId")}
                  onValueChange={(value) => setValue("toAccountId", value)}
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
                {errors.toAccountId && (
                  <p className="text-sm text-destructive">
                    {errors.toAccountId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monto a retirar</Label>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("amount", currentAmount)}
                  >
                    Retirar todo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("amount", currentAmount / 2)}
                  >
                    50%
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Nota sobre este retiro..."
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
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  variant="destructive"
                >
                  {mutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                  Retirar
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
