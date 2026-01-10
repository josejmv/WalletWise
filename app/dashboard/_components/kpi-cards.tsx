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

  const kpis = [
    {
      title: "Balance Total",
      value: formatCurrency(data.totalBalance),
      description: `${data.activeAccounts} cuentas activas`,
      icon: Wallet,
      trend: null,
    },
    {
      title: "Ingresos del Mes",
      value: formatCurrency(data.totalIncome),
      description: `${data.activeJobs} trabajos activos`,
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Gastos del Mes",
      value: formatCurrency(data.totalExpenses),
      description: "Este mes",
      icon: TrendingDown,
      trend: "down",
    },
    {
      title: "Ahorro Neto",
      value: formatCurrency(data.netSavings),
      description: `${data.savingsRate.toFixed(1)}% tasa de ahorro`,
      icon: PiggyBank,
      trend: data.netSavings >= 0 ? "up" : "down",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
