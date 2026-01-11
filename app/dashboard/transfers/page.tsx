"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRightLeft,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { useFormatters } from "@/contexts/user-config-context";
import { RateDetailsPopover } from "@/components/rate-details-popover";
import { TransferForm } from "./_components/transfer-form";

type TransferType =
  | "account_to_account"
  | "account_to_budget"
  | "budget_to_account";

interface Transfer {
  id: string;
  type: TransferType;
  amount: number;
  exchangeRate: number | null;
  officialRate: number | null;
  customRate: number | null;
  date: string;
  description: string | null;
  fromAccount: { id: string; name: string; currency?: { code: string } } | null;
  toAccount: { id: string; name: string; currency?: { code: string } } | null;
  fromBudget: { id: string; name: string } | null;
  toBudget: { id: string; name: string } | null;
  currency: { id: string; code: string; symbol: string };
}

const transferTypeLabels: Record<TransferType, string> = {
  account_to_account: "Cuenta → Cuenta",
  account_to_budget: "Cuenta → Budget",
  budget_to_account: "Budget → Cuenta",
};

interface PaginatedResponse {
  success: boolean;
  data: Transfer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchTransfers(
  page: number,
  limit: number,
): Promise<PaginatedResponse> {
  const res = await fetch(
    `/api/transfers?paginated=true&page=${page}&limit=${limit}`,
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

async function deleteTransfer(id: string): Promise<void> {
  const res = await fetch(`/api/transfers/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

export default function TransfersPage() {
  const { formatDate, formatCurrency } = useFormatters();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transfersData, isLoading } = useQuery({
    queryKey: ["transfers", page, limit],
    queryFn: () => fetchTransfers(page, limit),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "recent-transactions"],
      });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
      toast({ title: "Transferencia eliminada" });
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

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingTransfer(null);
    queryClient.invalidateQueries({ queryKey: ["transfers"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({
      queryKey: ["dashboard", "recent-transactions"],
    });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
  };

  const handleEdit = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTransfer(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const transfers = transfersData?.data || [];
  const meta = transfersData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transferencias</h1>
          <p className="text-muted-foreground">
            Mueve dinero entre tus cuentas
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transferencia
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Transferencias</CardTitle>
          <CardDescription>{meta.total} transferencia(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {transfers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-center">Tasa</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => {
                    const fromName =
                      transfer.fromAccount?.name ||
                      transfer.fromBudget?.name ||
                      "-";
                    const toName =
                      transfer.toAccount?.name ||
                      transfer.toBudget?.name ||
                      "-";
                    const fromCurrency =
                      transfer.fromAccount?.currency?.code ||
                      transfer.currency.code;
                    const toCurrency =
                      transfer.toAccount?.currency?.code ||
                      transfer.currency.code;
                    const isBudgetTransfer =
                      transfer.type !== "account_to_account";

                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(transfer.date)}
                        </TableCell>
                        <TableCell>
                          {isBudgetTransfer ? (
                            <Badge variant="outline" className="text-xs gap-1">
                              <PiggyBank className="h-3 w-3" />
                              {transfer.type === "account_to_budget"
                                ? "A Budget"
                                : "De Budget"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs gap-1"
                            >
                              <Wallet className="h-3 w-3" />
                              Cuentas
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {fromName}
                        </TableCell>
                        <TableCell>
                          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">{toName}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {formatCurrency(
                              transfer.amount,
                              transfer.currency.code,
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <RateDetailsPopover
                            officialRate={transfer.officialRate}
                            customRate={transfer.customRate}
                            exchangeRate={transfer.exchangeRate}
                            fromCurrency={fromCurrency}
                            toCurrency={toCurrency}
                            amount={transfer.amount}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transfer)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(transfer.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay transferencias registradas
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransfer ? "Editar Transferencia" : "Nueva Transferencia"}
            </DialogTitle>
          </DialogHeader>
          <TransferForm
            transfer={editingTransfer}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Transferencia</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              esta transferencia.
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
