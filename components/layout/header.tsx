"use client";

import * as React from "react";
import { Bell, Moon, Sun, Monitor, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserConfigContext } from "@/contexts/user-config-context";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

type Theme = "light" | "dark" | "system";

function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const effectiveTheme = getEffectiveTheme(theme);
  document.documentElement.classList.toggle("dark", effectiveTheme === "dark");
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { config, updateConfig, isLoading } = useUserConfigContext();
  const currentTheme = (config?.theme as Theme) ?? "system";

  // Apply theme on mount and when it changes
  React.useEffect(() => {
    applyTheme(currentTheme);

    // Sync localStorage with DB theme
    try {
      localStorage.setItem("walletwise-theme", currentTheme);
    } catch {
      // localStorage not available
    }
  }, [currentTheme]);

  // Listen for system theme changes when using "system" mode
  React.useEffect(() => {
    if (currentTheme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [currentTheme]);

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    // Save to localStorage for the initialization script
    try {
      localStorage.setItem("walletwise-theme", nextTheme);
    } catch {
      // localStorage not available
    }

    // Update in DB via context
    updateConfig({ theme: nextTheme });
  };

  const effectiveTheme = getEffectiveTheme(currentTheme);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        {title && <h1 className="text-lg font-semibold truncate">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2 font-semibold">
              Notificaciones
            </div>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
              <span className="font-medium">Gasto recurrente pendiente</span>
              <span className="text-xs text-muted-foreground">
                Netflix - $15.99 vence manana
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
              <span className="font-medium">Meta de ahorro alcanzada</span>
              <span className="text-xs text-muted-foreground">
                Vacaciones 2024 - 100% completado
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
              <span className="font-medium">Productos por reponer</span>
              <span className="text-xs text-muted-foreground">
                5 productos con stock bajo
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          disabled={isLoading}
          title={`Tema: ${currentTheme === "system" ? "Sistema" : currentTheme === "dark" ? "Oscuro" : "Claro"}`}
        >
          {currentTheme === "system" ? (
            <Monitor className="h-5 w-5" />
          ) : effectiveTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
