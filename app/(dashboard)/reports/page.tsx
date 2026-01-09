"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialSummary {
  period: { startDate: string; endDate: string };
  overview: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
  topExpenseCategories: { name: string; total: number; percentage: number }[];
  topIncomeJobs: { name: string; total: number; percentage: number }[];
}

async function fetchSummary(): Promise<FinancialSummary> {
  const res = await fetch("/api/reports");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatCurrency(value: number): string {
  return `$${new Intl.NumberFormat("es-CO").format(value)}`;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("summary");

  const { data: summary, isLoading } = useQuery({
    queryKey: ["reports", "summary"],
    queryFn: fetchSummary,
  });

  const handleExport = async (format: "csv" | "json") => {
    window.open(`/api/reports?type=export&format=${format}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Analiza tus finanzas en detalle
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("json")}>
            <Download className="mr-2 h-4 w-4" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {summary && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(summary.overview.totalIncome)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Gastos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(summary.overview.totalExpenses)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ahorro Neto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${summary.overview.netSavings >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {formatCurrency(summary.overview.netSavings)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tasa de Ahorro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.overview.savingsRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Categorias de Gasto</CardTitle>
                <CardDescription>
                  Tus principales gastos del periodo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.topExpenseCategories.length > 0 ? (
                  <div className="space-y-4">
                    {summary.topExpenseCategories.map((category, i) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(category.total)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {category.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos de gastos
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Fuentes de Ingreso</CardTitle>
                <CardDescription>
                  Tus principales ingresos del periodo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.topIncomeJobs.length > 0 ? (
                  <div className="space-y-4">
                    {summary.topIncomeJobs.map((job, i) => (
                      <div
                        key={job.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {i + 1}.
                          </span>
                          <span className="font-medium">{job.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(job.total)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {job.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos de ingresos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
