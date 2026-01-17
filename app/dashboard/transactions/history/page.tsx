"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  PiggyBank,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrency, formatDate } from "@/lib/formatters";

// Transaction types
type TransactionType =
  | "income"
  | "expense"
  | "transfer"
  | "contribution"
  | "withdrawal";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  createdAt: string;
  account?: { id: string; name: string };
  fromAccount?: { id: string; name: string };
  toAccount?: { id: string; name: string };
  category?: { id: string; name: string };
  currency: { id: string; code: string; symbol: string };
  budget?: { id: string; name: string };
  displayName: string;
}

interface HistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  parent?: { id: string; name: string } | null;
}

// Helper to get category display name with parent
function getCategoryDisplayName(category: Category): string {
  if (category.parent) {
    return `${category.name} (${category.parent.name})`;
  }
  return category.name;
}

interface Currency {
  id: string;
  code: string;
}

// Type config for display
const typeConfig: Record<
  TransactionType,
  {
    label: string;
    icon: typeof ArrowUpRight;
    colorClass: string;
    badgeVariant: "default" | "destructive" | "outline" | "secondary";
  }
> = {
  income: {
    label: "Ingreso",
    icon: ArrowUpRight,
    colorClass: "text-green-500",
    badgeVariant: "default",
  },
  expense: {
    label: "Gasto",
    icon: ArrowDownRight,
    colorClass: "text-red-500",
    badgeVariant: "destructive",
  },
  transfer: {
    label: "Transferencia",
    icon: ArrowLeftRight,
    colorClass: "text-blue-500",
    badgeVariant: "outline",
  },
  contribution: {
    label: "Contribucion",
    icon: PiggyBank,
    colorClass: "text-purple-500",
    badgeVariant: "secondary",
  },
  withdrawal: {
    label: "Retiro",
    icon: Wallet,
    colorClass: "text-orange-500",
    badgeVariant: "secondary",
  },
};

async function fetchHistory(params: URLSearchParams): Promise<HistoryResponse> {
  const res = await fetch(`/api/transactions/history?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchAccounts(): Promise<Account[]> {
  const res = await fetch("/api/accounts");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch("/api/currencies");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export default function TransactionHistoryPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [type, setType] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [currencyId, setCurrencyId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Build query params
  const buildParams = () => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (accountId) params.set("accountId", accountId);
    if (categoryId) params.set("categoryId", categoryId);
    if (currencyId) params.set("currencyId", currencyId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    return params;
  };

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: [
      "transaction-history",
      type,
      accountId,
      categoryId,
      currencyId,
      startDate,
      endDate,
      page,
    ],
    queryFn: () => fetchHistory(buildParams()),
  });

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const clearFilters = () => {
    setType("");
    setAccountId("");
    setCategoryId("");
    setCurrencyId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters =
    type || accountId || categoryId || currencyId || startDate || endDate;

  if (loadingHistory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Historial de Transacciones
        </h1>
        <p className="text-muted-foreground">
          Todas las transacciones en un solo lugar
        </p>
      </div>

      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Card>
          <CardHeader className="py-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 hover:bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      Activos
                    </Badge>
                  )}
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-90" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Ingresos</SelectItem>
                      <SelectItem value="expense">Gastos</SelectItem>
                      <SelectItem value="transfer">Transferencias</SelectItem>
                      <SelectItem value="contribution">
                        Contribuciones
                      </SelectItem>
                      <SelectItem value="withdrawal">Retiros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cuenta</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {accounts?.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {getCategoryDisplayName(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={currencyId} onValueChange={setCurrencyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {currencies?.map((curr) => (
                        <SelectItem key={curr.id} value={curr.id}>
                          {curr.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Desde</Label>
                  <DatePicker
                    value={
                      startDate ? new Date(startDate + "T12:00:00") : undefined
                    }
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        setStartDate(`${year}-${month}-${day}`);
                      } else {
                        setStartDate("");
                      }
                    }}
                    placeholder="Fecha inicio"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hasta</Label>
                  <DatePicker
                    value={
                      endDate ? new Date(endDate + "T12:00:00") : undefined
                    }
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        setEndDate(`${year}-${month}-${day}`);
                      } else {
                        setEndDate("");
                      }
                    }}
                    placeholder="Fecha fin"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transacciones
          </CardTitle>
          <CardDescription>
            {history?.total || 0} transaccion(es) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.transactions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.transactions.map((tx) => {
                    const config = typeConfig[tx.type];
                    const Icon = config.icon;
                    const accountName =
                      tx.type === "transfer"
                        ? `${tx.fromAccount?.name} -> ${tx.toAccount?.name}`
                        : tx.account?.name || "-";

                    return (
                      <TableRow key={`${tx.type}-${tx.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${config.colorClass}`} />
                            <Badge variant={config.badgeVariant}>
                              {config.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.displayName}</p>
                            {tx.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {accountName}
                        </TableCell>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={config.colorClass}>
                            {tx.type === "expense" || tx.type === "withdrawal"
                              ? "-"
                              : tx.type === "income"
                                ? "+"
                                : ""}
                            {formatCurrency(tx.amount, tx.currency.code)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {history.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Pagina {history.page} de {history.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(history.totalPages, p + 1))
                      }
                      disabled={page === history.totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron transacciones
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
