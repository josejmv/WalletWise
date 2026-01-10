"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

export interface SidebarItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
  collapsed?: boolean;
}

export function SidebarItem({
  title,
  href,
  icon: Icon,
  collapsed = false,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{title}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
