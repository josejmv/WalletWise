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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFormatters } from "@/contexts/user-config-context";

interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  currencyCode: string;
  // Balance converted to USD for comparison
  balanceInUSD: number;
}

async function fetchBalanceByAccount(): Promise<AccountBalance[]> {
  const res = await fetch("/api/dashboard?section=balance-by-account");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export function BalanceByAccount() {
  const { formatNumber } = useFormatters();

  // Compact formatter for chart axis
  const formatCompact = (value: number) =>
    formatNumber(value, { notation: "compact", compactDisplay: "short" });
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "balance-by-account"],
    queryFn: fetchBalanceByAccount,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance por Cuenta</CardTitle>
          <CardDescription>Distribucion de fondos</CardDescription>
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
          <CardTitle>Balance por Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Error al cargar datos
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance por Cuenta</CardTitle>
          <CardDescription>Distribucion de fondos</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No hay cuentas registradas
        </CardContent>
      </Card>
    );
  }

  // Use USD balance for chart comparison, keep original for tooltip
  const chartData = data.slice(0, 6).map((account) => ({
    name: account.accountName,
    balanceUSD: account.balanceInUSD,
    originalBalance: account.balance,
    currencyCode: account.currencyCode,
    type: account.accountType,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance por Cuenta</CardTitle>
        {/* v1.6.0: Updated description to indicate USD conversion */}
        <CardDescription>Distribucion de fondos (convertido a USD)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompact}
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            {/* v1.6.0: Custom tooltip showing USD and original currency */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div
                    className="rounded-lg border bg-card p-3 shadow-md"
                    style={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    <p className="font-medium text-sm mb-1">{data.name}</p>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">USD: </span>
                      {formatNumber(data.balanceUSD)}
                    </p>
                    {data.currencyCode !== "USD" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Original: {formatNumber(data.originalBalance)} {data.currencyCode}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="balanceUSD"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
