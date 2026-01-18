"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountForm } from "./_components/account-form";
import { useToast } from "@/components/ui/use-toast";
import { useFormatters, useUserConfigContext } from "@/contexts/user-config-context";
import type { RateResult } from "@/lib/currency-utils";

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

async function fetchAccountsWithBlocked(): Promise<AccountWithBlocked[]> {
  const res = await fetch("/api/accounts?withBlocked=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function deleteAccount(id: string): Promise<void> {
  const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

async function fetchRatesToBase(
  sourceCurrencyIds: string[],
  baseCurrencyId: string
): Promise<Record<string, RateResult | null>> {
  if (sourceCurrencyIds.length === 0) return {};

  const res = await fetch("/api/calculator/rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceCurrencyId: baseCurrencyId,
      targetCurrencyIds: sourceCurrencyIds,
    }),
  });
  const data = await res.json();
  if (!data.success) return {};
  return data.data;
}

export default function AccountsPage() {
  const { formatCurrency } = useFormatters();
  const { config } = useUserConfigContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<AccountWithBlocked | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const baseCurrency = config?.baseCurrency;

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts", "withBlocked"],
    queryFn: fetchAccountsWithBlocked,
  });

  // Get unique currency IDs that are different from base currency
  const uniqueCurrencyIds = accounts
    ? [...new Set(accounts.map((a) => a.currency.id))].filter(
        (id) => id !== baseCurrency?.id
      )
    : [];

  // Fetch rates from each currency to base currency
  const { data: ratesToBase } = useQuery({
    queryKey: ["rates-to-base", baseCurrency?.id, uniqueCurrencyIds],
    queryFn: () => fetchRatesToBase(uniqueCurrencyIds, baseCurrency!.id),
    enabled: !!baseCurrency?.id && uniqueCurrencyIds.length > 0,
  });

  // Helper to convert amount to base currency
  const convertToBase = (amount: number, currencyId: string): number | null => {
    if (!baseCurrency) return null;
    if (currencyId === baseCurrency.id) return amount;

    const rateResult = ratesToBase?.[currencyId];
    if (!rateResult?.rate) return null;

    // Rate is from base to this currency, so we need to divide
    return amount / rateResult.rate;
  };

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({ title: "Cuenta eliminada correctamente" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (account: AccountWithBlocked) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  // Calculate totals by currency
  const totalsByCurrency =
    accounts?.reduce(
      (acc, account) => {
        const key = account.currency.code;
        if (!acc[key]) {
          acc[key] = { total: 0, available: 0, blocked: 0 };
        }
        acc[key].total += account.totalBalance;
        acc[key].available += account.availableBalance;
        acc[key].blocked += account.blockedBalance;
        return acc;
      },
      {} as Record<
        string,
        { total: number; available: number; blocked: number }
      >,
    ) ?? {};

  // Calculate total equivalent in base currency
  const totalEquivalent = accounts?.reduce((sum, account) => {
    const equivalent = convertToBase(account.totalBalance, account.currency.id);
    return sum + (equivalent ?? 0);
  }, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Error al cargar las cuentas
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas</h1>
          <p className="text-muted-foreground">
            Gestiona tus cuentas bancarias y billeteras
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAccount(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Cuenta" : "Nueva Cuenta"}
              </DialogTitle>
              <DialogDescription>
                {editingAccount
                  ? "Modifica los datos de la cuenta"
                  : "Agrega una nueva cuenta a tu perfil"}
              </DialogDescription>
            </DialogHeader>
            <AccountForm
              account={editingAccount}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary by currency */}
      {Object.keys(totalsByCurrency).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(totalsByCurrency).map(([currency, totals]) => (
            <Card key={currency}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total en {currency}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totals.total, currency)}
                </div>
                {totals.blocked > 0 && (
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-green-600">
                      Disponible: {formatCurrency(totals.available, currency)}
                    </span>
                    <span className="text-amber-600">
                      Bloqueado: {formatCurrency(totals.blocked, currency)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {/* Total equivalent card - only show if multiple currencies */}
          {baseCurrency && Object.keys(totalsByCurrency).length > 1 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Total Equivalente en {baseCurrency.code}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalEquivalent, baseCurrency.code)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Suma de todas las cuentas convertidas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Accounts table */}
      <Card>
        <CardContent className="p-0">
          {accounts && accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="text-right">Bloqueado</TableHead>
                  {baseCurrency && (
                    <TableHead className="text-right">
                      Equiv. {baseCurrency.code}
                    </TableHead>
                  )}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {account.name}
                        {!account.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactiva
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {account.accountType.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.currency.code}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(
                        account.totalBalance,
                        account.currency.code,
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {formatCurrency(
                        account.availableBalance,
                        account.currency.code,
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {account.blockedBalance > 0 ? (
                        <span className="text-amber-600">
                          {formatCurrency(
                            account.blockedBalance,
                            account.currency.code,
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {baseCurrency && (
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {(() => {
                          const equivalent = convertToBase(
                            account.totalBalance,
                            account.currency.id
                          );
                          if (equivalent === null) {
                            return <span>-</span>;
                          }
                          if (account.currency.id === baseCurrency.id) {
                            return <span>-</span>;
                          }
                          return formatCurrency(equivalent, baseCurrency.code);
                        })()}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(account)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(account.id)}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay cuentas registradas. Crea tu primera cuenta.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              esta cuenta y todos sus registros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
