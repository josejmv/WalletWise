"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Settings, Palette, Calendar, Hash, Coins } from "lucide-react";

interface UserConfig {
  id: string;
  baseCurrencyId: string;
  dateFormat: string;
  numberFormat: string;
  theme: string;
  baseCurrency: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

async function fetchUserConfig(): Promise<UserConfig> {
  const res = await fetch("/api/user-config");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch("/api/currencies");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function updateUserConfig(
  updates: Partial<UserConfig>,
): Promise<UserConfig> {
  const res = await fetch("/api/user-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ["user-config"],
    queryFn: fetchUserConfig,
  });

  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const updateMutation = useMutation({
    mutationFn: updateUserConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-config"] });
      toast({ title: "Configuración actualizada" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (field: string, value: string) => {
    updateMutation.mutate({ [field]: value });
  };

  if (loadingConfig || loadingCurrencies) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
          <p className="text-muted-foreground">
            Configura las preferencias de tu aplicación
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Moneda Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Moneda Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Los totales del dashboard se mostrarán en esta moneda
            </p>
            <div className="space-y-2">
              <Label>Moneda principal</Label>
              <Select
                value={config?.baseCurrencyId}
                onValueChange={(value) => handleUpdate("baseCurrencyId", value)}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies?.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Formato de Fecha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Formato de Fecha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cómo se mostrarán las fechas en la aplicación
            </p>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={config?.dateFormat}
                onValueChange={(value) => handleUpdate("dateFormat", value)}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">
                    DD/MM/YYYY (31/12/2024)
                  </SelectItem>
                  <SelectItem value="MM/DD/YYYY">
                    MM/DD/YYYY (12/31/2024)
                  </SelectItem>
                  <SelectItem value="YYYY-MM-DD">
                    YYYY-MM-DD (2024-12-31)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Formato de Números */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Formato de Números
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cómo se mostrarán los montos y números
            </p>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={config?.numberFormat}
                onValueChange={(value) => handleUpdate("numberFormat", value)}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es-CO">Español (1.234.567,89)</SelectItem>
                  <SelectItem value="en-US">Inglés (1,234,567.89)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Apariencia visual de la aplicación
            </p>
            <div className="space-y-2">
              <Label>Modo</Label>
              <Select
                value={config?.theme}
                onValueChange={(value) => handleUpdate("theme", value)}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            La personalización del sidebar estará disponible próximamente en la
            sección de configuración avanzada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
