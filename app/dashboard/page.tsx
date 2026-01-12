import { Suspense } from "react";
import { KPICards } from "./_components/kpi-cards";
import { ExpensesByCategory } from "./_components/expenses-by-category";
import { MonthlyTrend } from "./_components/monthly-trend";
import { BudgetProgress } from "./_components/budget-progress";
import { RecentTransactions } from "./_components/recent-transactions";
import { BalanceByAccount } from "./_components/balance-by-account";
import { PendingExpenses } from "./_components/pending-expenses";
import { QuickActions } from "./_components/quick-actions";
import { ExchangeRateWidget } from "./_components/exchange-rate-widget";
import { SavingsWidget } from "./_components/savings-widget";
import { RateHistoryChart } from "./_components/rate-history-chart";
import { RateComparisonChart } from "./_components/rate-comparison-chart";
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

function WidgetSkeleton() {
  return <Skeleton className="h-48" />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Resumen de tus finanzas personales
        </p>
      </div>

      {/* Quick Actions */}
      <Suspense fallback={<WidgetSkeleton />}>
        <QuickActions />
      </Suspense>

      {/* KPI Cards */}
      <Suspense fallback={<KPISkeleton />}>
        <KPICards />
      </Suspense>

      {/* Exchange Rates & Savings Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<WidgetSkeleton />}>
          <ExchangeRateWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <SavingsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <RateComparisonChart />
        </Suspense>
      </div>

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

      {/* Rate History Chart */}
      <Suspense fallback={<ChartSkeleton />}>
        <RateHistoryChart />
      </Suspense>

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
