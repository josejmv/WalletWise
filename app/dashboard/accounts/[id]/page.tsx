"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Target, Wallet, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatters } from "@/contexts/user-config-context";

interface Budget {
  id: string;
  name: string;
  type: "goal" | "envelope";
  currentAmount: number;
  targetAmount: number;
  status: "active" | "completed" | "cancelled";
}

interface AccountDetail {
  id: string;
  name: string;
  balance: number;
  isActive: boolean;
  accountType: { id: string; name: string; type: string };
  currency: { id: string; code: string; symbol: string };
  totalBalance: number;
  availableBalance: number;
  blockedBalance: number;
  budgets: Budget[];
}

async function fetchAccountDetail(id: string): Promise<AccountDetail> {
  const res = await fetch(`/api/accounts/${id}?withBlocked=true`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

const typeLabels: Record<string, string> = {
  goal: "Meta de Ahorro",
  envelope: "Sobre de Gasto",
};

const statusLabels: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { formatCurrency } = useFormatters();

  const { data: account, isLoading } = useQuery({
    queryKey: ["account", id, "withBlocked"],
    queryFn: () => fetchAccountDetail(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cuenta no encontrada
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/accounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
          <p className="text-muted-foreground">
            {account.accountType.name} - {account.currency.code}
          </p>
        </div>
        {!account.isActive && (
          <Badge variant="secondary" className="ml-auto">
            Inactiva
          </Badge>
        )}
      </div>

      {/* Balance summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Saldos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Saldo Total</p>
              <p className="text-3xl font-bold">
                {formatCurrency(account.totalBalance, account.currency.code)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Disponible</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(
                  account.availableBalance,
                  account.currency.code,
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Bloqueado en Presupuestos
              </p>
              <p className="text-2xl font-semibold text-amber-600">
                {formatCurrency(account.blockedBalance, account.currency.code)}
              </p>
            </div>
          </div>

          {/* Visual balance bar */}
          {hasBlockedBalance && (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${availablePercent}%` }}
                />
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${blockedPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Disponible ({availablePercent.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Bloqueado ({blockedPercent.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related budgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Presupuestos Vinculados
          </CardTitle>
          <CardDescription>
            Presupuestos que bloquean saldo de esta cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {account.budgets && account.budgets.length > 0 ? (
            <div className="space-y-4">
              {account.budgets.map((budget) => {
                const progress =
                  Number(budget.targetAmount) > 0
                    ? (Number(budget.currentAmount) /
                        Number(budget.targetAmount)) *
                      100
                    : 0;

                return (
                  <div
                    key={budget.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="flex-shrink-0">
                      {budget.type === "goal" ? (
                        <Target className="h-8 w-8 text-primary" />
                      ) : (
                        <Wallet className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href="/dashboard/budgets"
                          className="font-medium hover:underline truncate"
                        >
                          {budget.name}
                        </Link>
                        <Badge
                          variant={
                            budget.status === "completed"
                              ? "success"
                              : budget.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                          }
                          className="flex-shrink-0"
                        >
                          {statusLabels[budget.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {typeLabels[budget.type]}
                      </p>
                      <div className="mt-2 space-y-1">
                        <Progress
                          value={Math.min(progress, 100)}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {formatCurrency(
                              Number(budget.currentAmount),
                              account.currency.code,
                            )}
                          </span>
                          <span>
                            {formatCurrency(
                              Number(budget.targetAmount),
                              account.currency.code,
                            )}{" "}
                            ({progress.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-amber-600">
                        {formatCurrency(
                          Number(budget.currentAmount),
                          account.currency.code,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">bloqueado</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay presupuestos vinculados a esta cuenta
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
