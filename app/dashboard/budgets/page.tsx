"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useFormatters } from "@/contexts/user-config-context";
import { BudgetForm } from "./_components/budget-form";
import { ContributeModal } from "./_components/contribute-modal";
import { WithdrawModal } from "./_components/withdraw-modal";

interface Budget {
  id: string;
  name: string;
  type: "goal" | "envelope";
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: "active" | "completed" | "cancelled";
  currency: { id: string; code: string; symbol: string };
  account: { id: string; name: string; currencyId: string };
}

async function fetchBudgets(): Promise<Budget[]> {
  const res = await fetch("/api/budgets");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function deleteBudget(id: string): Promise<void> {
  const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

const statusLabels: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

const typeLabels: Record<string, string> = {
  goal: "Meta",
  envelope: "Sobre",
};

export default function BudgetsPage() {
  const { formatDate, formatCurrency } = useFormatters();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [contributeBudget, setContributeBudget] = useState<Budget | null>(null);
  const [withdrawBudget, setWithdrawBudget] = useState<Budget | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Presupuesto eliminado" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingBudget(null);
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingBudget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground">
            Metas de ahorro y sobres de gasto
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Presupuesto
        </Button>
      </div>

      {budgets && budgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progress =
              budget.targetAmount > 0
                ? (budget.currentAmount / budget.targetAmount) * 100
                : 0;

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {budget.type === "goal" ? (
                        <Target className="h-5 w-5 text-primary" />
                      ) : (
                        <Wallet className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{budget.name}</CardTitle>
                        <CardDescription>
                          {typeLabels[budget.type]}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(budget)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(budget.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {formatCurrency(
                          budget.currentAmount,
                          budget.currency.code,
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(
                          budget.targetAmount,
                          budget.currency.code,
                        )}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} />
                    <p className="text-xs text-muted-foreground text-center">
                      {progress.toFixed(1)}% completado
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge
                      variant={
                        budget.status === "completed"
                          ? "success"
                          : budget.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {statusLabels[budget.status]}
                    </Badge>
                    {budget.deadline && (
                      <span className="text-muted-foreground">
                        {formatDate(budget.deadline)}
                      </span>
                    )}
                  </div>
                  {budget.status !== "cancelled" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setContributeBudget(budget)}
                        disabled={budget.status === "completed"}
                      >
                        <ArrowDownCircle className="mr-1 h-4 w-4" />
                        Contribuir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setWithdrawBudget(budget)}
                        disabled={budget.currentAmount <= 0}
                      >
                        <ArrowUpCircle className="mr-1 h-4 w-4" />
                        Retirar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No hay presupuestos registrados
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            budget={editingBudget}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Presupuesto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              este presupuesto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {contributeBudget && (
        <ContributeModal
          budget={contributeBudget}
          open={!!contributeBudget}
          onOpenChange={(open) => !open && setContributeBudget(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
          }}
        />
      )}

      {withdrawBudget && (
        <WithdrawModal
          budget={withdrawBudget}
          open={!!withdrawBudget}
          onOpenChange={(open) => !open && setWithdrawBudget(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
          }}
        />
      )}
    </div>
  );
}
