"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingDown,
  RefreshCw,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { useFormatters } from "@/contexts/user-config-context";
import { RateDetailsPopover } from "@/components/rate-details-popover";
import { ExpenseForm } from "./_components/expense-form";

interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  isRecurring: boolean;
  periodicity: "weekly" | "monthly" | "yearly" | null;
  nextDueDate: string | null;
  officialRate: number | null;
  customRate: number | null;
  category: { id: string; name: string };
  account: { id: string; name: string; currency?: { code: string } };
  currency: { id: string; code: string; symbol: string };
}

interface PaginatedResponse {
  success: boolean;
  data: Expense[];
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

async function fetchExpenses(
  page: number,
  limit: number,
): Promise<PaginatedResponse> {
  const res = await fetch(
    `/api/expenses?paginated=true&page=${page}&limit=${limit}`,
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

async function fetchSummary(): Promise<SummaryResponse> {
  const res = await fetch("/api/expenses?summary=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

async function fetchRecurringExpenses(): Promise<Expense[]> {
  const res = await fetch("/api/expenses?recurring=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function processExpense(id: string): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}/process`, { method: "POST" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

const periodicityLabels: Record<string, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

export default function ExpensesPage() {
  const { formatDate, formatCurrency } = useFormatters();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState<"all" | "recurring">("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", page, limit],
    queryFn: () => fetchExpenses(page, limit),
  });

  const { data: summaryData } = useQuery({
    queryKey: ["expenses-summary"],
    queryFn: fetchSummary,
  });

  const { data: recurringExpenses, isLoading: isLoadingRecurring } = useQuery({
    queryKey: ["expenses", "recurring"],
    queryFn: fetchRecurringExpenses,
    enabled: activeTab === "recurring",
  });

  const processMutation = useMutation({
    mutationFn: processExpense,
    onSuccess: () => {
      toast({ title: "Gasto procesado correctamente" });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al procesar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast({ title: "Gasto eliminado" });
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
    setEditingExpense(null);
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingExpense(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const expenses = expensesData?.data || [];
  const meta = expensesData?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };
  const totalExpense = summaryData?.data?.totalAmount || 0;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">Registra tus gastos</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Gasto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpense, "USD")}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCount} registro(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
        >
          Todos los Gastos
        </Button>
        <Button
          variant={activeTab === "recurring" ? "default" : "outline"}
          onClick={() => setActiveTab("recurring")}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Recurrentes
          {recurringExpenses && recurringExpenses.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {recurringExpenses.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Recurring Expenses Section */}
      {activeTab === "recurring" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Gastos Recurrentes
            </CardTitle>
            <CardDescription>
              Gastos que se repiten periodicamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecurring ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recurringExpenses && recurringExpenses.length > 0 ? (
              <div className="space-y-3">
                {recurringExpenses.map((expense) => {
                  const isDue =
                    expense.nextDueDate &&
                    new Date(expense.nextDueDate) <= new Date();
                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${isDue ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : "bg-card"}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {expense.description || expense.category.name}
                          </span>
                          <Badge variant="outline">
                            {periodicityLabels[expense.periodicity || ""] ||
                              expense.periodicity}
                          </Badge>
                          {isDue && (
                            <Badge variant="destructive">Pendiente</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {expense.account.name}
                          {expense.nextDueDate && (
                            <span>
                              {" "}
                              - Proximo: {formatDate(expense.nextDueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-red-500">
                          {formatCurrency(
                            expense.amount,
                            expense.currency.code,
                          )}
                        </span>
                        {isDue && (
                          <Button
                            size="sm"
                            onClick={() => processMutation.mutate(expense.id)}
                            disabled={processMutation.isPending}
                          >
                            {processMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span className="ml-1">Pagar</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No hay gastos recurrentes configurados
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Expenses Section */}
      {activeTab === "all" && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Gastos</CardTitle>
            <CardDescription>{meta.total} gasto(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Descripcion</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-center">Tasa</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(expense.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {expense.category.name}
                            {expense.isRecurring && (
                              <Badge variant="outline" className="text-xs">
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Recurrente
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{expense.account.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {expense.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-500">
                          {formatCurrency(
                            expense.amount,
                            expense.currency.code,
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <RateDetailsPopover
                            officialRate={expense.officialRate}
                            customRate={expense.customRate}
                            fromCurrency={expense.currency.code}
                            toCurrency={expense.account.currency?.code}
                            amount={expense.amount}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(expense.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                No hay gastos registrados
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Gasto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              este gasto.
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
