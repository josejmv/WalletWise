"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, PiggyBank, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Budget {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  deadline: string | null;
  currency: { code: string; symbol: string };
}

async function fetchBudgets(): Promise<Budget[]> {
  const res = await fetch("/api/budgets");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${new Intl.NumberFormat("es-CO").format(value)}`;
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
  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
            Metas de ahorro y presupuestos
          </p>
        </div>
        <Button>
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
            const isCompleted = progress >= 100;

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {budget.type === "goal" ? (
                        <Target className="h-5 w-5 text-primary" />
                      ) : (
                        <PiggyBank className="h-5 w-5 text-primary" />
                      )}
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        budget.status === "completed"
                          ? "success"
                          : budget.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {statusLabels[budget.status] || budget.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {typeLabels[budget.type] || budget.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span className="font-medium">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={cn(
                        "h-2",
                        isCompleted && "[&>div]:bg-green-500",
                      )}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Actual: </span>
                      <span className="font-medium">
                        {formatCurrency(
                          budget.currentAmount,
                          budget.currency.symbol,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Meta: </span>
                      <span className="font-medium">
                        {formatCurrency(
                          budget.targetAmount,
                          budget.currency.symbol,
                        )}
                      </span>
                    </div>
                  </div>
                  {budget.status === "active" && (
                    <Button variant="outline" className="w-full" size="sm">
                      Aportar
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No hay presupuestos registrados. Crea tu primera meta de ahorro.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
