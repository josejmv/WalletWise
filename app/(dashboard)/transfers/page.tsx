"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, ArrowLeftRight } from "lucide-react";
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

interface Transfer {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  exchangeRate: number | null;
  fromAccount: { name: string };
  toAccount: { name: string };
  currency: { code: string; symbol: string };
}

async function fetchTransfers(): Promise<Transfer[]> {
  const res = await fetch("/api/transfers");
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

export default function TransfersPage() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ["transfers"],
    queryFn: fetchTransfers,
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Transferencias</h1>
          <p className="text-muted-foreground">Movimientos entre tus cuentas</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transferencia
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Transferencias</CardTitle>
          <CardDescription>
            {transfers?.length || 0} transferencia(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transfers && transfers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Hacia</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{formatDate(transfer.date)}</TableCell>
                    <TableCell className="font-medium">
                      {transfer.fromAccount.name}
                    </TableCell>
                    <TableCell>
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {transfer.toAccount.name}
                    </TableCell>
                    <TableCell>{transfer.description || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(
                        transfer.amount,
                        transfer.currency.symbol,
                      )}
                      {transfer.exchangeRate && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (x{transfer.exchangeRate})
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay transferencias registradas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
