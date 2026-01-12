"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Database, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BackupModal } from "@/components/backup-modal";
import { SidebarItem } from "./sidebar-item";
import { SidebarGroup } from "./sidebar-group";
import { useUserConfigContext } from "@/contexts/user-config-context";

// Import the same configuration from sidebar
import {
  LayoutDashboard,
  Briefcase,
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
  Settings2,
  Receipt,
  Landmark,
  Coins,
  CreditCard,
  History,
  Calculator,
  type LucideIcon,
} from "lucide-react";

// v1.4.0: Sidebar item configuration (shared with desktop sidebar)
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
  // v1.5.0: Calculator for currency conversions
  {
    id: "calculator",
    type: "item",
    title: "Calculadora",
    href: "/dashboard/calculator",
    icon: Calculator,
  },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();

  // Close sidebar when navigating
  React.useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-lg">WalletWise</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {SIDEBAR_ITEMS.map((item) =>
            item.type === "item" ? (
              <SidebarItem
                key={item.id}
                title={item.title}
                href={item.href!}
                icon={item.icon}
                collapsed={false}
              />
            ) : (
              <SidebarGroup
                key={item.id}
                title={item.title}
                icon={item.icon}
                collapsed={false}
                defaultOpen={item.defaultOpen}
                items={item.items!}
              />
            ),
          )}
        </nav>

        {/* Footer */}
        <div className="border-t p-2 space-y-1">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
