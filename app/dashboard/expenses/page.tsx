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
import {
  useFormatters,
  useUserConfigContext,
} from "@/contexts/user-config-context";
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
  category: {
    id: string;
    name: string;
    parent: { id: string; name: string } | null;
  };
  account: { id: string; name: string; currency?: { code: string } };
  currency: { id: string; code: string; symbol: string };
}

// Helper to get category display name with parent
function getCategoryDisplayName(category: Expense["category"]): string {
  if (category.parent) {
    return `${category.name} (${category.parent.name})`;
  }
  return category.name;
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
  const { config } = useUserConfigContext();
  const baseCurrencyCode = config?.baseCurrency?.code ?? "USD";
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
      queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "recent-transactions"],
      });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
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
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({
      queryKey: ["dashboard", "recent-transactions"],
    });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-history"] });
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Gastos
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Registra tus gastos
          </p>
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
              {formatCurrency(totalExpense, baseCurrencyCode)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCount} registro(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className="whitespace-nowrap"
        >
          Todos los Gastos
        </Button>
        <Button
          variant={activeTab === "recurring" ? "default" : "outline"}
          onClick={() => setActiveTab("recurring")}
          className="whitespace-nowrap"
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
                            {expense.description ||
                              getCategoryDisplayName(expense.category)}
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
          <CardContent className="px-2 sm:px-6">
            {expenses.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Cuenta
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Descripcion
                        </TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center hidden sm:table-cell">
                          Tasa
                        </TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {formatDate(expense.date)}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[120px] sm:max-w-none">
                                {getCategoryDisplayName(expense.category)}
                              </span>
                              {expense.isRecurring && (
                                <Badge
                                  variant="outline"
                                  className="text-xs shrink-0 hidden sm:inline-flex"
                                >
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                  Recurrente
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {expense.account.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell">
                            {expense.description || "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-500 whitespace-nowrap">
                            {formatCurrency(
                              expense.amount,
                              expense.currency.code,
                            )}
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
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
                                className="h-8 w-8"
                                onClick={() => handleEdit(expense)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
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
