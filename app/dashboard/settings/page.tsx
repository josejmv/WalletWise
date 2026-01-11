"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Settings,
  Palette,
  Calendar,
  Hash,
  Coins,
  Menu,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";

// v1.3.0: Sidebar item structure
interface SidebarItem {
  id: string;
  type: "item" | "group";
  pageId?: string;
  label?: string;
  icon?: string;
  isOpen?: boolean;
  children?: SidebarItem[];
}

interface SidebarConfig {
  items: SidebarItem[];
}

interface UserConfig {
  id: string;
  baseCurrencyId: string;
  dateFormat: string;
  numberFormat: string;
  theme: string;
  sidebarConfig?: SidebarConfig;
  baseCurrency: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
}

// v1.3.0: Default sidebar items for display
const DEFAULT_SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Transacciones" },
  { id: "finances", label: "Finanzas" },
  { id: "inventory", label: "Inventario" },
  { id: "configuration", label: "Configuracion" },
  { id: "reports", label: "Reportes" },
];

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

      {/* v1.3.0: Sidebar Order */}
      <SidebarOrderConfig
        config={config}
        onUpdate={(sidebarConfig) =>
          updateMutation.mutate({ sidebarConfig } as Partial<UserConfig>)
        }
        isPending={updateMutation.isPending}
      />
    </div>
  );
}

// v1.3.0: Sidebar order configuration component
function SidebarOrderConfig({
  config,
  onUpdate,
  isPending,
}: {
  config: UserConfig | undefined;
  onUpdate: (sidebarConfig: SidebarConfig) => void;
  isPending: boolean;
}) {
  // Get current order from config or use default
  const getInitialOrder = useCallback(() => {
    if (config?.sidebarConfig?.items) {
      return config.sidebarConfig.items.map((item) => {
        const defaultItem = DEFAULT_SIDEBAR_ITEMS.find((d) => d.id === item.id);
        return {
          id: item.id,
          label: item.label || defaultItem?.label || item.pageId || item.id,
        };
      });
    }
    return DEFAULT_SIDEBAR_ITEMS;
  }, [config]);

  const [items, setItems] = useState(getInitialOrder);
  const [hasChanges, setHasChanges] = useState(false);

  const moveItem = useCallback(
    (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return;

      const newItems = [...items];
      [newItems[index], newItems[newIndex]] = [
        newItems[newIndex],
        newItems[index],
      ];
      setItems(newItems);
      setHasChanges(true);
    },
    [items],
  );

  const handleSave = useCallback(() => {
    // Convert to sidebar config format
    const sidebarConfig: SidebarConfig = {
      items: items.map((item) => {
        // Find original item from config to preserve structure
        const originalItem = config?.sidebarConfig?.items?.find(
          (i) => i.id === item.id,
        );
        if (originalItem) {
          return originalItem;
        }
        // Create basic item structure
        return {
          id: item.id,
          type:
            item.id === "dashboard" || item.id === "reports" ? "item" : "group",
          ...(item.id === "dashboard" || item.id === "reports"
            ? { pageId: item.id }
            : { label: item.label }),
        } as SidebarItem;
      }),
    };
    onUpdate(sidebarConfig);
    setHasChanges(false);
  }, [items, config, onUpdate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Menu className="h-5 w-5" />
          Orden del Sidebar
        </CardTitle>
        <CardDescription>
          Reordena los elementos del menu lateral usando las flechas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 font-medium">{item.label}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === items.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              Guardar orden
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Nota: Los cambios en el orden del sidebar se aplicaran despues de
          recargar la pagina.
        </p>
      </CardContent>
    </Card>
  );
}
