"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BudgetData {
  budgetId: string;
  budgetName: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  status: string;
}

async function fetchBudgetProgress(): Promise<BudgetData[]> {
  const res = await fetch("/api/dashboard?section=budget-progress");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function BudgetProgress() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "budget-progress"],
    queryFn: fetchBudgetProgress,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Presupuestos</CardTitle>
          <CardDescription>Metas activas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Presupuestos</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Error al cargar datos
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Presupuestos</CardTitle>
          <CardDescription>Metas activas</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No hay presupuestos activos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de Presupuestos</CardTitle>
        <CardDescription>Metas activas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.slice(0, 5).map((budget) => (
          <div key={budget.budgetId} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{budget.budgetName}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({budget.type === "goal" ? "Meta" : "Envelope"})
                </span>
              </div>
              <span className="text-muted-foreground">
                {budget.progress.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={Math.min(budget.progress, 100)}
              className={cn(
                "h-2",
                budget.progress >= 100 && "[&>div]:bg-green-500",
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(budget.currentAmount)}</span>
              <span>{formatCurrency(budget.targetAmount)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
