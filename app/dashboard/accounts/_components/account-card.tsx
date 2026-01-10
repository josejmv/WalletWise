"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrency } from "@/lib/formatters";

interface AccountWithBlocked {
  id: string;
  name: string;
  balance: number;
  isActive: boolean;
  accountType: { id: string; name: string; type: string };
  currency: { id: string; code: string; symbol: string };
  totalBalance: number;
  availableBalance: number;
  blockedBalance: number;
  budgetsCount: number;
}

interface AccountCardProps {
  account: AccountWithBlocked;
  onEdit: () => void;
  onDelete: () => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasBlockedBalance = account.blockedBalance > 0;
  const availablePercent =
    account.totalBalance > 0
      ? (account.availableBalance / account.totalBalance) * 100
      : 100;
  const blockedPercent =
    account.totalBalance > 0
      ? (account.blockedBalance / account.totalBalance) * 100
      : 0;

  return (
    <Card className={!account.isActive ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link
                href={`/dashboard/accounts/${account.id}`}
                className="hover:underline"
              >
                {account.name}
              </Link>
              {!account.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactiva
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {account.accountType.name} - {account.currency.code}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance totals */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">
              {formatCurrency(account.totalBalance, account.currency.code)}
            </span>
          </div>

          {hasBlockedBalance && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disponible</span>
              <span className="text-green-600 font-medium">
                {formatCurrency(
                  account.availableBalance,
                  account.currency.code,
                )}
              </span>
            </div>
          )}
        </div>

        {/* Visual balance bar */}
        {hasBlockedBalance && (
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${availablePercent}%` }}
                title={`Disponible: ${availablePercent.toFixed(1)}%`}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${blockedPercent}%` }}
                title={`Bloqueado: ${blockedPercent.toFixed(1)}%`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Disponible ({availablePercent.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Bloqueado ({blockedPercent.toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Blocked balance expandable section */}
        {hasBlockedBalance && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  {account.budgetsCount} presupuesto(s) vinculado(s)
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo bloqueado</span>
                  <span className="font-medium text-amber-600">
                    {formatCurrency(
                      account.blockedBalance,
                      account.currency.code,
                    )}
                  </span>
                </div>
                <Link
                  href={`/dashboard/accounts/${account.id}`}
                  className="text-xs text-primary hover:underline block"
                >
                  Ver detalle de presupuestos
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
