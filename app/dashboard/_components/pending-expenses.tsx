"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useFormatters } from "@/contexts/user-config-context";
import { Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface PendingExpense {
  id: string;
  description: string | null;
  amount: string;
  nextDueDate: string;
  periodicity: string;
  category: { name: string };
  account: { name: string };
  currency: { code: string; symbol: string };
}

async function fetchPendingExpenses(): Promise<PendingExpense[]> {
  const res = await fetch("/api/expenses?due=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function processExpense(id: string) {
  const res = await fetch(`/api/expenses/${id}/process`, { method: "POST" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

const periodicityLabels: Record<string, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

export function PendingExpenses() {
  const { formatDate, formatCurrency } = useFormatters();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses", "pending"],
    queryFn: fetchPendingExpenses,
  });

  const processMutation = useMutation({
    mutationFn: processExpense,
    onSuccess: () => {
      toast({ title: "Gasto procesado correctamente" });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al procesar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gastos Pendientes
          </CardTitle>
          <CardDescription>Gastos recurrentes por procesar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gastos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Error al cargar datos
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Gastos Pendientes
          </CardTitle>
          <CardDescription>Gastos recurrentes por procesar</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No hay gastos pendientes
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Gastos Pendientes
          <Badge variant="destructive" className="ml-2">
            {data.length}
          </Badge>
        </CardTitle>
        <CardDescription>Gastos recurrentes por procesar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {expense.description || expense.category.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {periodicityLabels[expense.periodicity] ||
                      expense.periodicity}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {expense.account.name} - Vence:{" "}
                  {formatDate(expense.nextDueDate)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-red-500">
                  {formatCurrency(
                    Number(expense.amount),
                    expense.currency.code,
                  )}
                </span>
                <Button
                  size="sm"
                  onClick={() => processMutation.mutate(expense.id)}
                  disabled={processMutation.isPending}
                >
                  {processMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span className="ml-1">Pagar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
