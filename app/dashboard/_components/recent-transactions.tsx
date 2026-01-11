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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatters } from "@/contexts/user-config-context";

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer" | "contribution" | "withdrawal";
  amount: number;
  currencyCode: string;
  description: string | null;
  date: string;
  category?: string;
  account: string;
  budgetName?: string;
}

async function fetchRecentTransactions(): Promise<Transaction[]> {
  const res = await fetch(
    "/api/dashboard?section=recent-transactions&limit=10",
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

const typeConfig = {
  income: {
    label: "Ingreso",
    icon: TrendingUp,
    variant: "default" as const,
    className: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  },
  expense: {
    label: "Gasto",
    icon: TrendingDown,
    variant: "destructive" as const,
    className: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  },
  transfer: {
    label: "Transferencia",
    icon: ArrowLeftRight,
    variant: "secondary" as const,
    className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  },
  contribution: {
    label: "Contribucion",
    icon: PiggyBank,
    variant: "default" as const,
    className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  },
  withdrawal: {
    label: "Retiro",
    icon: PiggyBank,
    variant: "default" as const,
    className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  },
};

export function RecentTransactions() {
  const { formatDate, formatCurrency } = useFormatters();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "recent-transactions"],
    queryFn: fetchRecentTransactions,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Ultimos movimientos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
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
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Ultimos movimientos</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No hay transacciones registradas
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>Ultimos movimientos</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((transaction) => {
              const config = typeConfig[transaction.type];
              const Icon = config.icon;

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={config.className}>
                      <Icon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.budgetName
                      ? `${transaction.budgetName}${transaction.description ? ` - ${transaction.description}` : ""}`
                      : transaction.description || transaction.category || "-"}
                  </TableCell>
                  <TableCell>{transaction.account}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.type === "income" && "text-green-500",
                      transaction.type === "expense" && "text-red-500",
                      transaction.type === "contribution" && "text-purple-500",
                      transaction.type === "withdrawal" && "text-orange-500",
                    )}
                  >
                    {(transaction.type === "expense" ||
                      transaction.type === "withdrawal") &&
                      "-"}
                    {formatCurrency(
                      transaction.amount,
                      transaction.currencyCode,
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
