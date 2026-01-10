"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/formatters";

interface ExchangeRate {
  id: string;
  rate: number;
  source: "official" | "binance" | "manual";
  fetchedAt: string;
  fromCurrency: {
    id: string;
    code: string;
    symbol: string;
  };
  toCurrency: {
    id: string;
    code: string;
    symbol: string;
  };
}

interface SyncCooldown {
  canSync: boolean;
  nextSyncAt?: string;
  lastSyncAt?: string;
}

async function fetchLatestRates(): Promise<ExchangeRate[]> {
  const res = await fetch("/api/exchange-rates?latest=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchSyncCooldown(): Promise<SyncCooldown> {
  const res = await fetch("/api/exchange-rates/sync/cooldown");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function syncOfficial() {
  const res = await fetch("/api/exchange-rates/sync/official", {
    method: "POST",
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Error al sincronizar");
  return data.data;
}

async function syncBinance() {
  const res = await fetch("/api/exchange-rates/sync/binance", {
    method: "POST",
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Error al sincronizar");
  return data.data;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} dia${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  return "justo ahora";
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
      return "bg-blue-500/10 text-blue-500";
    case "binance":
      return "bg-yellow-500/10 text-yellow-500";
    case "manual":
      return "bg-gray-500/10 text-gray-500";
    default:
      return "";
  }
}

export function ExchangeRateWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rates, isLoading: loadingRates } = useQuery({
    queryKey: ["exchange-rates", "latest"],
    queryFn: fetchLatestRates,
  });

  const { data: cooldown, isLoading: loadingCooldown } = useQuery({
    queryKey: ["exchange-rates", "cooldown"],
    queryFn: fetchSyncCooldown,
    refetchInterval: 60000, // Check every minute
  });

  const officialMutation = useMutation({
    mutationFn: syncOfficial,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      toast({
        title: "Tasas sincronizadas",
        description: `${data.synced} tasas oficiales actualizadas`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al sincronizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const binanceMutation = useMutation({
    mutationFn: syncBinance,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      toast({
        title: "Tasas sincronizadas",
        description: `${data.synced} tasas de Binance actualizadas`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al sincronizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isSyncing = officialMutation.isPending || binanceMutation.isPending;
  const canSync = cooldown?.canSync ?? false;

  if (loadingRates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasas de Cambio</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  // Group rates by source
  const officialRates = rates?.filter((r) => r.source === "official") || [];
  const binanceRates = rates?.filter((r) => r.source === "binance") || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Tasas de Cambio
            </CardTitle>
            <CardDescription>
              {cooldown?.lastSyncAt
                ? `Ultima sync: ${formatRelativeTime(cooldown.lastSyncAt)}`
                : "Sin sincronizar"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => officialMutation.mutate()}
              disabled={isSyncing || !canSync}
            >
              {isSyncing && officialMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Oficial"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => binanceMutation.mutate()}
              disabled={isSyncing || !canSync}
            >
              {isSyncing && binanceMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Binance"
              )}
            </Button>
          </div>
        </div>
        {!canSync && cooldown?.nextSyncAt && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Siguiente sync disponible:{" "}
            {new Date(cooldown.nextSyncAt).toLocaleString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!rates || rates.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay tasas registradas</p>
            <p className="text-xs mt-1">
              Sincroniza para obtener tasas actuales
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Official Rates */}
            {officialRates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Tasas Oficiales (Fiat)
                </h4>
                <div className="space-y-2">
                  {officialRates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {rate.fromCurrency.code}/{rate.toCurrency.code}
                        </span>
                        <Badge
                          variant="secondary"
                          className={getSourceColor(rate.source)}
                        >
                          {getSourceLabel(rate.source)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-medium">
                          {Number(rate.rate).toLocaleString("es-CO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {rate.toCurrency.symbol}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Binance Rates */}
            {binanceRates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Tasas Crypto (Binance P2P)
                </h4>
                <div className="space-y-2">
                  {binanceRates.slice(0, 6).map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {rate.fromCurrency.code}/{rate.toCurrency.code}
                        </span>
                        <Badge
                          variant="secondary"
                          className={getSourceColor(rate.source)}
                        >
                          {getSourceLabel(rate.source)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-medium">
                          {Number(rate.rate).toLocaleString("es-CO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {rate.toCurrency.symbol}
                        </span>
                      </div>
                    </div>
                  ))}
                  {binanceRates.length > 6 && (
                    <p className="text-xs text-center text-muted-foreground">
                      +{binanceRates.length - 6} tasas mas
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
