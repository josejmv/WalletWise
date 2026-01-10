"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";

export interface SidebarGroupItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarGroupProps {
  title: string;
  icon: LucideIcon;
  items: SidebarGroupItem[];
  collapsed?: boolean;
  defaultOpen?: boolean;
}

export function SidebarGroup({
  title,
  icon: Icon,
  items,
  collapsed = false,
  defaultOpen = false,
}: SidebarGroupProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // Check if any child is active
  const hasActiveChild = items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href)),
  );

  // Auto-open if a child is active
  React.useEffect(() => {
    if (hasActiveChild && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveChild, isOpen]);

  if (collapsed) {
    // In collapsed mode, show a tooltip with the group name
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
              hasActiveChild
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-1 p-2">
          <span className="font-medium mb-1">{title}</span>
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded px-2 py-1 text-sm",
                  isActive ? "bg-accent" : "hover:bg-accent",
                )}
              >
                <ItemIcon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            hasActiveChild
              ? "text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-left">{title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 space-y-1 border-l pl-4">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <ItemIcon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
