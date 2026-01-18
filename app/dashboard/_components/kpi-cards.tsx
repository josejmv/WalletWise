"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useFormatters } from "@/contexts/user-config-context";

interface DashboardKPIs {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  activeAccounts: number;
  activeJobs: number;
  activeBudgets: number;
}

async function fetchKPIs(): Promise<DashboardKPIs> {
  const res = await fetch("/api/dashboard?section=kpis");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export function KPICards() {
  const { formatCurrency } = useFormatters();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: fetchKPIs,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error al cargar los KPIs
      </div>
    );
  }

  // Reordered: Ingresos → Gastos → Balance → Ahorro (aligned with quick actions)
  const kpis = [
    {
      title: "Ingresos del Mes",
      value: formatCurrency(data.totalIncome),
      description: `${data.activeJobs} trabajos activos`,
      icon: TrendingUp,
      cardClass: "border-green-500/50 bg-green-500/5",
      iconClass: "text-green-500",
      valueClass: "text-green-600 dark:text-green-400",
    },
    {
      title: "Gastos del Mes",
      value: formatCurrency(data.totalExpenses),
      description: "Este mes",
      icon: TrendingDown,
      cardClass: "border-red-500/50 bg-red-500/5",
      iconClass: "text-red-500",
      valueClass: "text-red-600 dark:text-red-400",
    },
    {
      title: "Balance Total",
      value: formatCurrency(data.totalBalance),
      description: `${data.activeAccounts} cuentas activas`,
      icon: Wallet,
      cardClass: "border-blue-500/50 bg-blue-500/5",
      iconClass: "text-blue-500",
      valueClass: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Ahorro Neto",
      value: formatCurrency(data.netSavings),
      description: `${data.savingsRate.toFixed(1)}% tasa de ahorro`,
      icon: PiggyBank,
      cardClass: data.netSavings >= 0
        ? "border-emerald-500/50 bg-emerald-500/5"
        : "border-amber-500/50 bg-amber-500/5",
      iconClass: data.netSavings >= 0 ? "text-emerald-500" : "text-amber-500",
      valueClass: data.netSavings >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className={kpi.cardClass}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.iconClass}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpi.valueClass}`}>{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
