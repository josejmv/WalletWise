"use client";

import * as React from "react";
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

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

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {/* Dashboard */}
        <SidebarItem
          title="Dashboard"
          href="/dashboard"
          icon={LayoutDashboard}
          collapsed={collapsed}
        />

        {/* Transacciones */}
        <SidebarGroup
          title="Transacciones"
          icon={Receipt}
          collapsed={collapsed}
          defaultOpen
          items={[
            {
              title: "Ingresos",
              href: "/dashboard/incomes",
              icon: ArrowDownCircle,
            },
            {
              title: "Gastos",
              href: "/dashboard/expenses",
              icon: ArrowUpCircle,
            },
            {
              title: "Transferencias",
              href: "/dashboard/transfers",
              icon: ArrowLeftRight,
            },
          ]}
        />

        {/* Finanzas */}
        <SidebarGroup
          title="Finanzas"
          icon={Landmark}
          collapsed={collapsed}
          defaultOpen
          items={[
            { title: "Cuentas", href: "/dashboard/accounts", icon: Wallet },
            {
              title: "Presupuestos",
              href: "/dashboard/budgets",
              icon: PiggyBank,
            },
            { title: "Trabajos", href: "/dashboard/jobs", icon: Briefcase },
          ]}
        />

        {/* Inventario */}
        <SidebarGroup
          title="Inventario"
          icon={Package}
          collapsed={collapsed}
          items={[
            {
              title: "Items",
              href: "/dashboard/inventory",
              icon: PackageSearch,
            },
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
          ]}
        />

        {/* Configuracion */}
        <SidebarGroup
          title="Configuracion"
          icon={Settings2}
          collapsed={collapsed}
          items={[
            { title: "Monedas", href: "/dashboard/currencies", icon: Coins },
            {
              title: "Tasas de Cambio",
              href: "/dashboard/exchange-rates",
              icon: ArrowLeftRight,
            },
            {
              title: "Categorias Gastos",
              href: "/dashboard/categories",
              icon: Tags,
            },
            {
              title: "Tipos de Cuenta",
              href: "/dashboard/account-types",
              icon: CreditCard,
            },
          ]}
        />

        {/* Reportes */}
        <SidebarItem
          title="Reportes"
          href="/dashboard/reports"
          icon={FileText}
          collapsed={collapsed}
        />
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
