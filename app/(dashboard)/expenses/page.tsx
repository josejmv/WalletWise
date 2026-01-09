"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  isRecurring: boolean;
  category: { name: string; color: string | null };
  account: { name: string };
  currency: { code: string; symbol: string };
}

async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch("/api/expenses");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${new Intl.NumberFormat("es-CO").format(value)}`;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function ExpensesPage() {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const totalExpenses =
    expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">Registro de tus gastos</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Gasto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${new Intl.NumberFormat("es-CO").format(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses?.length || 0} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
          <CardDescription>Todos tus gastos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell className="font-medium">
                      {expense.category.name}
                    </TableCell>
                    <TableCell>{expense.account.name}</TableCell>
                    <TableCell>{expense.description || "-"}</TableCell>
                    <TableCell>
                      {expense.isRecurring && (
                        <Badge variant="outline">Recurrente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-red-500 font-medium">
                      -{formatCurrency(expense.amount, expense.currency.symbol)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay gastos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
