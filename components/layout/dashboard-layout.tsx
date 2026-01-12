"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { Header } from "./header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserConfigProvider } from "@/contexts/user-config-context";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <UserConfigProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile Sidebar - drawer */}
          <MobileSidebar
            open={mobileSidebarOpen}
            onOpenChange={setMobileSidebarOpen}
          />

          <div
            className={cn(
              "flex flex-col transition-all duration-300",
              // No margin on mobile, margin on md+ based on sidebar state
              "ml-0 md:ml-16",
              !sidebarCollapsed && "md:ml-64",
            )}
          >
            <Header
              title={title}
              onMenuClick={() => setMobileSidebarOpen(true)}
            />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </UserConfigProvider>
  );
}
