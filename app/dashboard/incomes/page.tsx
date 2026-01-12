"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
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
import {
  useFormatters,
  useUserConfigContext,
} from "@/contexts/user-config-context";
import { IncomeForm } from "./_components/income-form";

interface Income {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  // v1.4.0: job is optional (null = "Ingreso Extra")
  job: { id: string; name: string } | null;
  account: { id: string; name: string };
  currency: { id: string; code: string; symbol: string };
}

interface PaginatedResponse {
  success: boolean;
  data: Income[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SummaryResponse {
  success: boolean;
  data: {
    totalAmount: number;
    count: number;
  };
}

async function fetchIncomes(
  page: number,
  limit: number,
): Promise<PaginatedResponse> {
  const res = await fetch(
    `/api/incomes?paginated=true&page=${page}&limit=${limit}`,
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

async function fetchSummary(): Promise<SummaryResponse> {
  const res = await fetch("/api/incomes?summary=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

async function deleteIncome(id: string): Promise<void> {
  const res = await fetch(`/api/incomes/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

export default function IncomesPage() {
  const { formatDate, formatCurrency } = useFormatters();
  const { config } = useUserConfigContext();
  const baseCurrencyCode = config?.baseCurrency?.code ?? "USD";
  const [formOpen, setFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: incomesData, isLoading } = useQuery({
    queryKey: ["incomes", page, limit],
    queryFn: () => fetchIncomes(page, limit),
  });

  const { data: summaryData } = useQuery({
    queryKey: ["incomes-summary"],
    queryFn: fetchSummary,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["incomes-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "recent-transactions"],
      });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
      toast({ title: "Ingreso eliminado" });
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
    setEditingIncome(null);
    queryClient.invalidateQueries({ queryKey: ["incomes"] });
    queryClient.invalidateQueries({ queryKey: ["incomes-summary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({
      queryKey: ["dashboard", "recent-transactions"],
    });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingIncome(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const incomes = incomesData?.data || [];
  const meta = incomesData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };
  const totalIncome = summaryData?.data?.totalAmount || 0;
  const totalCount = summaryData?.data?.count || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24" />
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ingresos
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Registra tus ingresos
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ingreso
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ingresos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome, baseCurrencyCode)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCount} registro(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos</CardTitle>
          <CardDescription>{meta.total} ingreso(s)</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {incomes.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Trabajo</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Cuenta
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Descripcion
                      </TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatDate(income.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {/* v1.4.0: Show "Ingreso Extra" for incomes without job */}
                          <span className="truncate max-w-[100px] sm:max-w-none block">
                            {income.job?.name ?? (
                              <span className="text-muted-foreground italic">
                                Ingreso Extra
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {income.account.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden lg:table-cell">
                          {income.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-500 whitespace-nowrap">
                          {formatCurrency(income.amount, income.currency.code)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(income)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteId(income.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
              No hay ingresos registrados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? "Editar Ingreso" : "Nuevo Ingreso"}
            </DialogTitle>
          </DialogHeader>
          <IncomeForm
            income={editingIncome}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Ingreso</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              este ingreso.
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
