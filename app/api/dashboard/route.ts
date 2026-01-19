import { NextResponse } from "next/server";
import { getUserIdForApi } from "@/lib/auth-helpers";
import {
  getDashboardSummary,
  getKPIs,
  getBalanceByAccount,
  getBalanceByCurrency,
  getExpensesByCategory,
  getMonthlyTrend,
  getBudgetProgress,
  getRecentTransactions,
  getSavingsData,
} from "./service";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdForApi();

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const months = searchParams.get("months");
    const limit = searchParams.get("limit");

    const filters = {
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    switch (section) {
      case "kpis":
        const kpis = await getKPIs(
          userId,
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: kpis });

      case "balance-by-account":
        const balanceByAccount = await getBalanceByAccount(userId);
        return NextResponse.json({ success: true, data: balanceByAccount });

      case "balance-by-currency":
        const balanceByCurrency = await getBalanceByCurrency(userId);
        return NextResponse.json({ success: true, data: balanceByCurrency });

      case "expenses-by-category":
        const expensesByCategory = await getExpensesByCategory(
          userId,
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: expensesByCategory });

      case "monthly-trend":
        const monthlyTrend = await getMonthlyTrend(
          userId,
          months ? parseInt(months) : 6,
        );
        return NextResponse.json({ success: true, data: monthlyTrend });

      case "budget-progress":
        const budgetProgress = await getBudgetProgress(userId);
        return NextResponse.json({ success: true, data: budgetProgress });

      case "recent-transactions":
        const recentTransactions = await getRecentTransactions(
          userId,
          limit ? parseInt(limit) : 10,
        );
        return NextResponse.json({ success: true, data: recentTransactions });

      case "savings":
        const savings = await getSavingsData(userId);
        return NextResponse.json({ success: true, data: savings });

      default:
        const summary = await getDashboardSummary(
          userId,
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: summary });
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener datos del dashboard";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
