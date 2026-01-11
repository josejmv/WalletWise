"use client";

import * as React from "react";
import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  Tags,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  PiggyBank,
  Package,
  PackageSearch,
  FolderTree,
  TrendingUp,
  ShoppingCart,
  FileText,
  Settings,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Database,
  Receipt,
  Landmark,
  Coins,
  CreditCard,
  History,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BackupModal } from "@/components/backup-modal";
import { SidebarItem } from "./sidebar-item";
import { SidebarGroup } from "./sidebar-group";
import { useUserConfigContext } from "@/contexts/user-config-context";

// v1.3.0: Sidebar item configuration for dynamic ordering
interface SidebarItemConfig {
  id: string;
  type: "item" | "group";
  title: string;
  href?: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  items?: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
}

// v1.3.0: Default sidebar structure
const SIDEBAR_ITEMS: SidebarItemConfig[] = [
  {
    id: "dashboard",
    type: "item",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "transactions",
    type: "group",
    title: "Transacciones",
    icon: Receipt,
    defaultOpen: true,
    items: [
      { title: "Ingresos", href: "/dashboard/incomes", icon: ArrowDownCircle },
      { title: "Gastos", href: "/dashboard/expenses", icon: ArrowUpCircle },
      {
        title: "Transferencias",
        href: "/dashboard/transfers",
        icon: ArrowLeftRight,
      },
      {
        title: "Historial",
        href: "/dashboard/transactions/history",
        icon: History,
      },
    ],
  },
  {
    id: "finances",
    type: "group",
    title: "Finanzas",
    icon: Landmark,
    defaultOpen: true,
    items: [
      { title: "Cuentas", href: "/dashboard/accounts", icon: Wallet },
      { title: "Presupuestos", href: "/dashboard/budgets", icon: PiggyBank },
      { title: "Trabajos", href: "/dashboard/jobs", icon: Briefcase },
    ],
  },
  {
    id: "inventory",
    type: "group",
    title: "Inventario",
    icon: Package,
    defaultOpen: false,
    items: [
      { title: "Items", href: "/dashboard/inventory", icon: PackageSearch },
      {
        title: "Categorias",
        href: "/dashboard/inventory/categories",
        icon: FolderTree,
      },
      {
        title: "Historial Precios",
        href: "/dashboard/inventory/price-history",
        icon: TrendingUp,
      },
      {
        title: "Lista de Compras",
        href: "/dashboard/inventory/shopping-list",
        icon: ShoppingCart,
      },
    ],
  },
  {
    id: "configuration",
    type: "group",
    title: "Configuracion",
    icon: Settings2,
    defaultOpen: false,
    items: [
      { title: "Monedas", href: "/dashboard/currencies", icon: Coins },
      {
        title: "Tasas de Cambio",
        href: "/dashboard/exchange-rates",
        icon: ArrowLeftRight,
      },
      { title: "Categorias Gastos", href: "/dashboard/categories", icon: Tags },
      {
        title: "Tipos de Cuenta",
        href: "/dashboard/account-types",
        icon: CreditCard,
      },
    ],
  },
  {
    id: "reports",
    type: "item",
    title: "Reportes",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// v1.3.0: Type for sidebarConfig from UserConfig
interface SidebarConfigChild {
  id: string;
  title: string;
  href: string;
}

interface SidebarConfigItem {
  id: string;
  type: "item" | "group";
  title: string;
  href?: string;
  children?: SidebarConfigChild[];
}

interface SidebarConfig {
  items: SidebarConfigItem[];
}

// Map of href to icon for dynamic items
const HREF_TO_ICON: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/incomes": ArrowDownCircle,
  "/dashboard/expenses": ArrowUpCircle,
  "/dashboard/transfers": ArrowLeftRight,
  "/dashboard/transactions/history": History,
  "/dashboard/accounts": Wallet,
  "/dashboard/budgets": PiggyBank,
  "/dashboard/jobs": Briefcase,
  "/dashboard/inventory": PackageSearch,
  "/dashboard/inventory/categories": FolderTree,
  "/dashboard/inventory/price-history": TrendingUp,
  "/dashboard/inventory/shopping-list": ShoppingCart,
  "/dashboard/currencies": Coins,
  "/dashboard/exchange-rates": ArrowLeftRight,
  "/dashboard/categories": Tags,
  "/dashboard/account-types": CreditCard,
  "/dashboard/reports": FileText,
};

// Map of group id to icon
const GROUP_TO_ICON: Record<string, LucideIcon> = {
  transactions: Receipt,
  finances: Landmark,
  inventory: Package,
  configuration: Settings2,
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { config } = useUserConfigContext();

  // v1.3.0: Get ordered sidebar items based on user config
  const orderedItems = useMemo(() => {
    const sidebarConfig = config?.sidebarConfig as SidebarConfig | undefined;

    if (!sidebarConfig?.items?.length) {
      return SIDEBAR_ITEMS;
    }

    // Build sidebar items from config
    const ordered: SidebarItemConfig[] = [];

    for (const configItem of sidebarConfig.items) {
      if (configItem.type === "item" && configItem.href) {
        // Standalone item
        ordered.push({
          id: configItem.id,
          type: "item",
          title: configItem.title,
          href: configItem.href,
          icon: HREF_TO_ICON[configItem.href] || FileText,
        });
      } else if (configItem.type === "group" && configItem.children) {
        // Group with children - filter out children without valid hrefs
        const validChildren = configItem.children.filter(
          (child) => child.href && child.title,
        );
        if (validChildren.length > 0) {
          ordered.push({
            id: configItem.id,
            type: "group",
            title: configItem.title,
            icon: GROUP_TO_ICON[configItem.id] || Settings2,
            defaultOpen:
              configItem.id === "transactions" || configItem.id === "finances",
            items: validChildren.map((child) => ({
              title: child.title,
              href: child.href,
              icon: HREF_TO_ICON[child.href] || FileText,
            })),
          });
        }
      }
    }

    // Fallback: if config produced no items, use defaults
    if (ordered.length === 0) {
      return SIDEBAR_ITEMS;
    }

    return ordered;
  }, [config?.sidebarConfig]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-lg">WalletWise</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Wallet className="h-6 w-6 text-primary" />
          </Link>
        )}
      </div>

      {/* Navigation - v1.3.0: Dynamic ordering based on user config */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {orderedItems.map((item) =>
          item.type === "item" ? (
            <SidebarItem
              key={item.id}
              title={item.title}
              href={item.href!}
              icon={item.icon}
              collapsed={collapsed}
            />
          ) : (
            <SidebarGroup
              key={item.id}
              title={item.title}
              icon={item.icon}
              collapsed={collapsed}
              defaultOpen={item.defaultOpen}
              items={item.items!}
            />
          ),
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-2 space-y-1">
        {!collapsed ? (
          <>
            <BackupModal
              trigger={
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Database className="h-5 w-5" />
                  <span>Backup</span>
                </button>
              }
            />
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard/settings"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Ajustes</span>
            </Link>
          </>
        ) : (
          <>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <BackupModal
                  trigger={
                    <button
                      className={cn(
                        "flex w-full items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Database className="h-5 w-5" />
                    </button>
                  }
                />
              </TooltipTrigger>
              <TooltipContent side="right">Backup</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                    pathname === "/dashboard/settings"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Ajustes</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={onToggle}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
}
