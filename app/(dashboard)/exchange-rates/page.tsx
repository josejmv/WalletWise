"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ArrowRight, CloudDownload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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

interface ExchangeRate {
  id: string;
  rate: number;
  fetchedAt: string;
  fromCurrency: { code: string; symbol: string };
  toCurrency: { code: string; symbol: string };
}

async function fetchExchangeRates(): Promise<ExchangeRate[]> {
  const res = await fetch("/api/exchange-rates");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export default function ExchangeRatesPage() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    data: rates,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
  });

  async function handleSync() {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/exchange-rates/sync", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Sincronizacion exitosa",
          description: `${data.synced} tasa(s) sincronizada(s)${data.errors?.length ? `. Errores: ${data.errors.join(", ")}` : ""}`,
        });
        refetch();
      } else {
        toast({
          title: "Error al sincronizar",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexion",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Tasas de Cambio</h1>
          <p className="text-muted-foreground">Conversion entre monedas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CloudDownload className="mr-2 h-4 w-4" />
            )}
            Sincronizar desde API
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasas Actuales</CardTitle>
          <CardDescription>
            {rates?.length || 0} tasa(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rates && rates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>De</TableHead>
                  <TableHead></TableHead>
                  <TableHead>A</TableHead>
                  <TableHead className="text-right">Tasa</TableHead>
                  <TableHead className="text-right">Actualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">
                      {rate.fromCurrency.code}
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {rate.toCurrency.code}
                    </TableCell>
                    <TableCell className="text-right">
                      {rate.rate.toLocaleString("es-CO", {
                        maximumFractionDigits: 4,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(rate.fetchedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay tasas de cambio registradas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
