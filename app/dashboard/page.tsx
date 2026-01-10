import { Suspense } from "react";
import { KPICards } from "./_components/kpi-cards";
import { ExpensesByCategory } from "./_components/expenses-by-category";
import { MonthlyTrend } from "./_components/monthly-trend";
import { BudgetProgress } from "./_components/budget-progress";
import { RecentTransactions } from "./_components/recent-transactions";
import { BalanceByAccount } from "./_components/balance-by-account";
import { PendingExpenses } from "./_components/pending-expenses";
import { Skeleton } from "@/components/ui/skeleton";

function KPISkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-80" />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tus finanzas personales
        </p>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<KPISkeleton />}>
        <KPICards />
      </Suspense>

      {/* Pending Expenses */}
      <Suspense fallback={<ChartSkeleton />}>
        <PendingExpenses />
      </Suspense>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <ExpensesByCategory />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <MonthlyTrend />
        </Suspense>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <BalanceByAccount />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <BudgetProgress />
        </Suspense>
      </div>

      {/* Recent Transactions */}
      <Suspense fallback={<ChartSkeleton />}>
        <RecentTransactions />
      </Suspense>
    </div>
  );
}
