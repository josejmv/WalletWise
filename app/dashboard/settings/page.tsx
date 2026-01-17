"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
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
  FolderOpen,
  FileText,
  ArrowRight,
  CornerDownRight,
} from "lucide-react";

// Sidebar item structure
interface SidebarChildItem {
  id: string;
  title: string;
  href: string;
}

interface SidebarItem {
  id: string;
  type: "item" | "group";
  title: string;
  href?: string;
  children?: SidebarChildItem[];
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

// Complete default sidebar structure
const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  items: [
    { id: "dashboard", type: "item", title: "Dashboard", href: "/dashboard" },
    {
      id: "transactions",
      type: "group",
      title: "Transacciones",
      children: [
        { id: "incomes", title: "Ingresos", href: "/dashboard/incomes" },
        { id: "expenses", title: "Gastos", href: "/dashboard/expenses" },
        {
          id: "transfers",
          title: "Transferencias",
          href: "/dashboard/transfers",
        },
        {
          id: "history",
          title: "Historial",
          href: "/dashboard/transactions/history",
        },
      ],
    },
    {
      id: "finances",
      type: "group",
      title: "Finanzas",
      children: [
        { id: "accounts", title: "Cuentas", href: "/dashboard/accounts" },
        { id: "budgets", title: "Presupuestos", href: "/dashboard/budgets" },
        { id: "jobs", title: "Trabajos", href: "/dashboard/jobs" },
      ],
    },
    {
      id: "inventory",
      type: "group",
      title: "Inventario",
      children: [
        { id: "inventory-items", title: "Items", href: "/dashboard/inventory" },
        {
          id: "inventory-categories",
          title: "Categorias",
          href: "/dashboard/inventory/categories",
        },
        {
          id: "price-history",
          title: "Historial Precios",
          href: "/dashboard/inventory/price-history",
        },
        {
          id: "shopping-list",
          title: "Lista de Compras",
          href: "/dashboard/inventory/shopping-list",
        },
      ],
    },
    {
      id: "configuration",
      type: "group",
      title: "Configuracion",
      children: [
        { id: "currencies", title: "Monedas", href: "/dashboard/currencies" },
        {
          id: "exchange-rates",
          title: "Tasas de Cambio",
          href: "/dashboard/exchange-rates",
        },
        {
          id: "categories",
          title: "Categorias Gastos",
          href: "/dashboard/categories",
        },
        {
          id: "account-types",
          title: "Tipos de Cuenta",
          href: "/dashboard/account-types",
        },
      ],
    },
    {
      id: "reports",
      type: "item",
      title: "Reportes",
      href: "/dashboard/reports",
    },
  ],
};

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

// Helper to get title from default config
function getTitleFromDefaults(id: string, href?: string): string {
  // Check top-level items
  for (const item of DEFAULT_SIDEBAR_CONFIG.items) {
    if (item.id === id) return item.title;
    if (item.type === "item" && item.href === href) return item.title;
    // Check children
    if (item.children) {
      for (const child of item.children) {
        if (child.id === id || child.href === href) return child.title;
      }
    }
  }
  return id; // Fallback to id if not found
}

// Sidebar order configuration component
function SidebarOrderConfig({
  config,
  onUpdate,
  isPending,
}: {
  config: UserConfig | undefined;
  onUpdate: (sidebarConfig: SidebarConfig) => void;
  isPending: boolean;
}) {
  // Initialize items from config or default, ensuring titles are present
  const getInitialItems = useCallback((): SidebarItem[] => {
    if (config?.sidebarConfig?.items?.length) {
      // Merge saved config with defaults to ensure titles exist
      const savedItems = config.sidebarConfig.items as SidebarItem[];
      return savedItems.map((item) => ({
        ...item,
        title: item.title || getTitleFromDefaults(item.id, item.href),
        children: item.children?.map((child) => ({
          ...child,
          title: child.title || getTitleFromDefaults(child.id, child.href),
        })),
      }));
    }
    return JSON.parse(JSON.stringify(DEFAULT_SIDEBAR_CONFIG.items));
  }, [config]);

  const [items, setItems] = useState<SidebarItem[]>(getInitialItems);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset items when config changes
  useEffect(() => {
    setItems(getInitialItems());
    setHasChanges(false);
  }, [getInitialItems]);

  // Move top-level item
  const moveTopLevelItem = useCallback(
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

  // Move child item within a group
  const moveChildItem = useCallback(
    (groupIndex: number, childIndex: number, direction: "up" | "down") => {
      const group = items[groupIndex];
      if (!group.children) return;

      const newChildIndex =
        direction === "up" ? childIndex - 1 : childIndex + 1;
      if (newChildIndex < 0 || newChildIndex >= group.children.length) return;

      const newItems = [...items];
      const newChildren = [...group.children];
      [newChildren[childIndex], newChildren[newChildIndex]] = [
        newChildren[newChildIndex],
        newChildren[childIndex],
      ];
      newItems[groupIndex] = { ...group, children: newChildren };
      setItems(newItems);
      setHasChanges(true);
    },
    [items],
  );

  // Move child to another group
  const moveChildToGroup = useCallback(
    (fromGroupIndex: number, childIndex: number, toGroupId: string) => {
      const fromGroup = items[fromGroupIndex];
      if (!fromGroup.children) return;

      const child = fromGroup.children[childIndex];
      const newItems = [...items];

      // Remove from source group
      const newSourceChildren = fromGroup.children.filter(
        (_, i) => i !== childIndex,
      );
      newItems[fromGroupIndex] = { ...fromGroup, children: newSourceChildren };

      if (toGroupId === "__standalone__") {
        // Convert to standalone item
        const newStandaloneItem: SidebarItem = {
          id: child.id,
          type: "item",
          title: child.title,
          href: child.href,
        };
        // Insert after the source group
        newItems.splice(fromGroupIndex + 1, 0, newStandaloneItem);
      } else {
        // Add to target group
        const toGroupIndex = newItems.findIndex(
          (item) => item.id === toGroupId,
        );
        if (toGroupIndex === -1) return;

        const toGroup = newItems[toGroupIndex];
        const newTargetChildren = [...(toGroup.children || []), child];
        newItems[toGroupIndex] = { ...toGroup, children: newTargetChildren };
      }

      setItems(newItems);
      setHasChanges(true);
    },
    [items],
  );

  // Convert standalone item to child of a group
  const moveItemToGroup = useCallback(
    (itemIndex: number, toGroupId: string) => {
      const item = items[itemIndex];
      if (item.type !== "item" || !item.href) return;

      const newItems = items.filter((_, i) => i !== itemIndex);

      const toGroupIndex = newItems.findIndex((i) => i.id === toGroupId);
      if (toGroupIndex === -1) return;

      const toGroup = newItems[toGroupIndex];
      const newChild: SidebarChildItem = {
        id: item.id,
        title: item.title,
        href: item.href,
      };
      const newTargetChildren = [...(toGroup.children || []), newChild];
      newItems[toGroupIndex] = { ...toGroup, children: newTargetChildren };

      setItems(newItems);
      setHasChanges(true);
    },
    [items],
  );

  const handleSave = useCallback(() => {
    onUpdate({ items });
    setHasChanges(false);
  }, [items, onUpdate]);

  // Get list of groups for move dropdown
  const groups = items.filter((item) => item.type === "group");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Menu className="h-5 w-5" />
          Orden del Sidebar
        </CardTitle>
        <CardDescription>
          Reordena los elementos del menu lateral. Puedes mover items entre
          categorias o sacarlos como items independientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, itemIndex) => (
            <div key={item.id} className="space-y-1">
              {/* Top level item/group */}
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                {item.type === "group" ? (
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1 font-medium">{item.title}</span>
                {item.type === "group" && (
                  <Badge variant="secondary" className="text-xs">
                    {item.children?.length || 0} items
                  </Badge>
                )}
                {/* Move to group (for standalone items) */}
                {item.type === "item" && groups.length > 0 && (
                  <Select
                    value=""
                    onValueChange={(groupId) =>
                      moveItemToGroup(itemIndex, groupId)
                    }
                  >
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue placeholder="Mover a..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveTopLevelItem(itemIndex, "up")}
                    disabled={itemIndex === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveTopLevelItem(itemIndex, "down")}
                    disabled={itemIndex === items.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Children of groups */}
              {item.type === "group" &&
                item.children &&
                item.children.length > 0 && (
                  <div className="ml-6 space-y-1 border-l-2 border-muted pl-2">
                    {item.children.map((child, childIndex) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 p-2 border rounded-md bg-background"
                      >
                        <CornerDownRight className="h-3 w-3 text-muted-foreground" />
                        <span className="flex-1 text-sm">{child.title}</span>
                        {/* Move to other group or standalone */}
                        <Select
                          value=""
                          onValueChange={(targetId) =>
                            moveChildToGroup(itemIndex, childIndex, targetId)
                          }
                        >
                          <SelectTrigger className="w-[130px] h-7 text-xs">
                            <SelectValue placeholder="Mover a..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__standalone__">
                              <span className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                Independiente
                              </span>
                            </SelectItem>
                            {groups
                              .filter((g) => g.id !== item.id)
                              .map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              moveChildItem(itemIndex, childIndex, "up")
                            }
                            disabled={childIndex === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              moveChildItem(itemIndex, childIndex, "down")
                            }
                            disabled={childIndex === item.children!.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setItems(getInitialItems());
                setHasChanges(false);
              }}
            >
              Descartar
            </Button>
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
