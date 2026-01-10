import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface FinancialReportData {
  title: string;
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

function formatCurrency(value: number): string {
  return `$${new Intl.NumberFormat("es-CO").format(value)}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateFinancialPDF(data: FinancialReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(data.title, pageWidth / 2, 20, { align: "center" });

  // Period
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Periodo: ${formatDate(data.period.startDate)} - ${formatDate(data.period.endDate)}`,
    pageWidth / 2,
    30,
    { align: "center" },
  );

  // Overview Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen Financiero", 14, 45);

  const overviewData = [
    ["Ingresos Totales", formatCurrency(data.overview.totalIncome)],
    ["Gastos Totales", formatCurrency(data.overview.totalExpenses)],
    ["Ahorro Neto", formatCurrency(data.overview.netSavings)],
    ["Tasa de Ahorro", `${data.overview.savingsRate.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: 50,
    head: [["Concepto", "Valor"]],
    body: overviewData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 },
  });

  // Top Expense Categories
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top Categorias de Gasto", 14, finalY);

  if (data.topExpenseCategories.length > 0) {
    const expenseData = data.topExpenseCategories.map((cat, i) => [
      `${i + 1}`,
      cat.name,
      formatCurrency(cat.total),
      `${cat.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [["#", "Categoria", "Total", "Porcentaje"]],
      body: expenseData,
      theme: "striped",
      headStyles: { fillColor: [231, 76, 60] },
      margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    finalY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("No hay datos de gastos", 14, finalY);
    finalY += 15;
  }

  // Top Income Sources
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top Fuentes de Ingreso", 14, finalY);

  if (data.topIncomeJobs.length > 0) {
    const incomeData = data.topIncomeJobs.map((job, i) => [
      `${i + 1}`,
      job.name,
      formatCurrency(job.total),
      `${job.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [["#", "Fuente", "Total", "Porcentaje"]],
      body: incomeData,
      theme: "striped",
      headStyles: { fillColor: [46, 204, 113] },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("No hay datos de ingresos", 14, finalY + 10);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generado el ${new Date().toLocaleDateString("es-CO")} - WalletWise`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  // Save
  doc.save(`reporte-financiero-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generateTransactionsPDF(
  title: string,
  transactions: Array<{
    date: string;
    description: string;
    category?: string;
    account: string;
    amount: number;
    currency: string;
  }>,
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 20, { align: "center" });

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO")}`,
    pageWidth / 2,
    28,
    { align: "center" },
  );

  // Table
  const tableData = transactions.map((t) => [
    formatDate(t.date),
    t.description || "-",
    t.category || "-",
    t.account,
    `${t.currency} ${formatCurrency(t.amount)}`,
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Fecha", "Descripcion", "Categoria", "Cuenta", "Monto"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });

  doc.save(
    `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
): string {
  const headers = columns.map((col) => col.header).join(",");
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value ?? "");
        if (strValue.includes(",") || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(","),
  );

  return [headers, ...rows].join("\n");
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
