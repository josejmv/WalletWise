"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatters } from "@/contexts/user-config-context";

// v1.3.0: Order options
type OrderBy = "recent" | "oldest" | "highest" | "lowest";

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
  // v1.3.0: Order state
  const [orderBy, setOrderBy] = useState<OrderBy>("recent");

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "recent-transactions"],
    queryFn: fetchRecentTransactions,
  });

  // v1.3.0: Sort transactions based on orderBy
  const sortedData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data];
    switch (orderBy) {
      case "recent":
        return sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      case "highest":
        return sorted.sort((a, b) => b.amount - a.amount);
      case "lowest":
        return sorted.sort((a, b) => a.amount - b.amount);
      default:
        return sorted;
    }
  }, [data, orderBy]);

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
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Ultimos movimientos</CardDescription>
        </div>
        {/* v1.3.0: Order selector */}
        <Select
          value={orderBy}
          onValueChange={(value: OrderBy) => setOrderBy(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mas recientes</SelectItem>
            <SelectItem value="oldest">Mas antiguas</SelectItem>
            <SelectItem value="highest">Mayor monto</SelectItem>
            <SelectItem value="lowest">Menor monto</SelectItem>
          </SelectContent>
        </Select>
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
            {sortedData.map((transaction) => {
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
