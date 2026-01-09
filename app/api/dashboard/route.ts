import { NextResponse } from "next/server";
import {
  getDashboardSummary,
  getKPIs,
  getBalanceByAccount,
  getBalanceByCurrency,
  getExpensesByCategory,
  getMonthlyTrend,
  getBudgetProgress,
  getRecentTransactions,
} from "./service";

export async function GET(request: Request) {
  try {
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
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: kpis });

      case "balance-by-account":
        const balanceByAccount = await getBalanceByAccount();
        return NextResponse.json({ success: true, data: balanceByAccount });

      case "balance-by-currency":
        const balanceByCurrency = await getBalanceByCurrency();
        return NextResponse.json({ success: true, data: balanceByCurrency });

      case "expenses-by-category":
        const expensesByCategory = await getExpensesByCategory(
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: expensesByCategory });

      case "monthly-trend":
        const monthlyTrend = await getMonthlyTrend(
          months ? parseInt(months) : 6,
        );
        return NextResponse.json({ success: true, data: monthlyTrend });

      case "budget-progress":
        const budgetProgress = await getBudgetProgress();
        return NextResponse.json({ success: true, data: budgetProgress });

      case "recent-transactions":
        const recentTransactions = await getRecentTransactions(
          limit ? parseInt(limit) : 10,
        );
        return NextResponse.json({ success: true, data: recentTransactions });

      default:
        const summary = await getDashboardSummary(
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
