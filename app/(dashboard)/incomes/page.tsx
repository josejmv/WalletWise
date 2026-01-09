"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, TrendingUp } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface Income {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  job: { name: string };
  account: { name: string };
  currency: { code: string; symbol: string };
}

async function fetchIncomes(): Promise<Income[]> {
  const res = await fetch("/api/incomes");
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

export default function IncomesPage() {
  const { data: incomes, isLoading } = useQuery({
    queryKey: ["incomes"],
    queryFn: fetchIncomes,
  });

  const totalIncome = incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
        </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Ingresos</h1>
          <p className="text-muted-foreground">Registro de tus ingresos</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ingreso
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ingresos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${new Intl.NumberFormat("es-CO").format(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {incomes?.length || 0} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos</CardTitle>
          <CardDescription>Todos tus ingresos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {incomes && incomes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{formatDate(income.date)}</TableCell>
                    <TableCell className="font-medium">
                      {income.job.name}
                    </TableCell>
                    <TableCell>{income.account.name}</TableCell>
                    <TableCell>{income.description || "-"}</TableCell>
                    <TableCell className="text-right text-green-500 font-medium">
                      {formatCurrency(income.amount, income.currency.symbol)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay ingresos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
