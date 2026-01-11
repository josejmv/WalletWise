"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";

interface ExchangeRate {
  id: string;
  rate: number;
  source: "official" | "binance" | "manual";
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

function getSourceLabel(source: string): string {
  switch (source) {
    case "official":
      return "Oficial";
    case "binance":
      return "Binance";
    case "manual":
      return "Manual";
    default:
      return source;
  }
}

function getSourceColor(source: string): string {
  switch (source) {
    case "official":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "binance":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "manual":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default:
      return "";
  }
}

export default function ExchangeRatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSyncingOfficial, setIsSyncingOfficial] = useState(false);
  const [isSyncingBinance, setIsSyncingBinance] = useState(false);

  const {
    data: rates,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
  });

  const isSyncing = isSyncingAll || isSyncingOfficial || isSyncingBinance;

  async function handleSyncAll() {
    setIsSyncingAll(true);
    try {
      // Sync official first
      const officialRes = await fetch("/api/exchange-rates/sync/official", {
        method: "POST",
      });
      const officialData = await officialRes.json();

      // Then sync binance
      const binanceRes = await fetch("/api/exchange-rates/sync/binance", {
        method: "POST",
      });
      const binanceData = await binanceRes.json();

      const totalSynced =
        (officialData.data?.synced || 0) + (binanceData.data?.synced || 0);
      const allErrors = [
        ...(officialData.data?.errors || []),
        ...(binanceData.data?.errors || []),
      ];

      if (totalSynced > 0) {
        toast({
          title: "Sincronizacion exitosa",
          description: `${totalSynced} tasa(s) sincronizada(s)${allErrors.length ? `. Errores: ${allErrors.slice(0, 3).join(", ")}` : ""}`,
        });
        queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
        queryClient.invalidateQueries({ queryKey: ["exchange-rate"] });
      } else {
        toast({
          title: "Error al sincronizar",
          description: allErrors.join("; ") || "No se pudo sincronizar",
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
      setIsSyncingAll(false);
    }
  }

  async function handleSyncOfficial() {
    setIsSyncingOfficial(true);
    try {
      const res = await fetch("/api/exchange-rates/sync/official", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Tasas oficiales sincronizadas",
          description: `${data.data?.synced || 0} tasa(s) sincronizada(s)`,
        });
        queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
        queryClient.invalidateQueries({ queryKey: ["exchange-rate"] });
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
      setIsSyncingOfficial(false);
    }
  }

  async function handleSyncBinance() {
    setIsSyncingBinance(true);
    try {
      const res = await fetch("/api/exchange-rates/sync/binance", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Tasas Binance sincronizadas",
          description: `${data.data?.synced || 0} tasa(s) sincronizada(s)`,
        });
        queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
        queryClient.invalidateQueries({ queryKey: ["exchange-rate"] });
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
      setIsSyncingBinance(false);
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
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isSyncing}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={handleSyncOfficial}
            disabled={isSyncing}
          >
            {isSyncingOfficial ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Oficial
          </Button>
          <Button
            variant="outline"
            onClick={handleSyncBinance}
            disabled={isSyncing}
          >
            {isSyncingBinance ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Binance
          </Button>
          <Button onClick={handleSyncAll} disabled={isSyncing}>
            {isSyncingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CloudDownload className="mr-2 h-4 w-4" />
            )}
            Sincronizar Todo
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
                  <TableHead className="text-center">Fuente</TableHead>
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
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={getSourceColor(rate.source)}
                      >
                        {getSourceLabel(rate.source)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(rate.rate).toLocaleString("es-CO", {
                        maximumFractionDigits: 6,
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
