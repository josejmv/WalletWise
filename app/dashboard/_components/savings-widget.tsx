"use client";

import { useQuery } from "@tanstack/react-query";
import { PiggyBank, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

interface SavingsData {
  totalSavings: number;
  transactionCount: number;
  breakdown: {
    incomes: { savings: number; count: number };
    expenses: { savings: number; count: number };
    transfers: { savings: number; count: number };
  };
  currencyCode: string;
}

async function fetchSavings(): Promise<SavingsData> {
  const res = await fetch("/api/dashboard?section=savings");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export function SavingsWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "savings"],
    queryFn: fetchSavings,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ahorro por Tasas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PiggyBank className="h-4 w-4" />
            Ahorro por Tasas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4 text-muted-foreground text-sm">
          Sin datos de ahorro
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.totalSavings > 0;
  const isNegative = data.totalSavings < 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <PiggyBank className="h-4 w-4" />
          Ahorro por Tasas Custom
        </CardTitle>
        <CardDescription>
          {data.transactionCount} transaccion(es) con tasa personalizada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-full ${
              isPositive
                ? "bg-green-500/10"
                : isNegative
                  ? "bg-red-500/10"
                  : "bg-muted"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-6 w-6 text-green-500" />
            ) : isNegative ? (
              <TrendingDown className="h-6 w-6 text-red-500" />
            ) : (
              <Minus className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${
                isPositive ? "text-green-500" : isNegative ? "text-red-500" : ""
              }`}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(data.totalSavings, data.currencyCode)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPositive
                ? "Ahorro total"
                : isNegative
                  ? "Costo adicional"
                  : "Sin diferencia"}
            </p>
          </div>
        </div>

        {data.transactionCount > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Ingresos</p>
              <p
                className={`text-sm font-medium ${
                  data.breakdown.incomes.savings > 0
                    ? "text-green-500"
                    : data.breakdown.incomes.savings < 0
                      ? "text-red-500"
                      : ""
                }`}
              >
                {data.breakdown.incomes.savings >= 0 ? "+" : ""}
                {formatCurrency(
                  data.breakdown.incomes.savings,
                  data.currencyCode,
                )}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Gastos</p>
              <p
                className={`text-sm font-medium ${
                  data.breakdown.expenses.savings > 0
                    ? "text-green-500"
                    : data.breakdown.expenses.savings < 0
                      ? "text-red-500"
                      : ""
                }`}
              >
                {data.breakdown.expenses.savings >= 0 ? "+" : ""}
                {formatCurrency(
                  data.breakdown.expenses.savings,
                  data.currencyCode,
                )}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Transfer</p>
              <p
                className={`text-sm font-medium ${
                  data.breakdown.transfers.savings > 0
                    ? "text-green-500"
                    : data.breakdown.transfers.savings < 0
                      ? "text-red-500"
                      : ""
                }`}
              >
                {data.breakdown.transfers.savings >= 0 ? "+" : ""}
                {formatCurrency(
                  data.breakdown.transfers.savings,
                  data.currencyCode,
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
