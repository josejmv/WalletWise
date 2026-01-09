import { NextResponse } from "next/server";
import {
  getMonthlyReport,
  getCategoryReport,
  getAccountReport,
  getBudgetReport,
  getFinancialSummary,
  exportTransactions,
} from "./service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const format = searchParams.get("format") as "json" | "csv" | null;

    const filters = {
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    switch (type) {
      case "monthly":
        const reportYear = year ? parseInt(year) : new Date().getFullYear();
        const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const monthlyReport = await getMonthlyReport(reportYear, reportMonth);
        return NextResponse.json({ success: true, data: monthlyReport });

      case "category":
        const categoryReport = await getCategoryReport(
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: categoryReport });

      case "account":
        const accountReport = await getAccountReport(
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: accountReport });

      case "budget":
        const budgetReport = await getBudgetReport();
        return NextResponse.json({ success: true, data: budgetReport });

      case "export":
        const exportFormat = format || "json";
        const exportData = await exportTransactions(
          exportFormat,
          Object.keys(filters).length > 0 ? filters : undefined,
        );

        if (exportFormat === "csv") {
          return new NextResponse(exportData, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
            },
          });
        }

        return new NextResponse(exportData, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.json"`,
          },
        });

      default:
        const summary = await getFinancialSummary(
          Object.keys(filters).length > 0 ? filters : undefined,
        );
        return NextResponse.json({ success: true, data: summary });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al generar reporte";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
