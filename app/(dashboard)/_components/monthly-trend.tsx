"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
}

async function fetchMonthlyTrend(): Promise<MonthlyData[]> {
  const res = await fetch("/api/dashboard?section=monthly-trend&months=6");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${months[parseInt(m) - 1]} ${year.slice(2)}`;
}

export function MonthlyTrend() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "monthly-trend"],
    queryFn: fetchMonthlyTrend,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencia Mensual</CardTitle>
          <CardDescription>Ingresos vs Gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencia Mensual</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Error al cargar datos
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: formatMonth(item.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia Mensual</CardTitle>
        <CardDescription>Ultimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              name="Ingresos"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e" }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Gastos"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444" }}
            />
            <Line
              type="monotone"
              dataKey="net"
              name="Neto"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
