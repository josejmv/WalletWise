export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  currencyId?: string;
  accountId?: string;
  categoryId?: string;
}

export interface MonthlyReport {
  month: string;
  year: number;
  income: {
    total: number;
    count: number;
    byJob: { jobName: string; total: number }[];
  };
  expenses: {
    total: number;
    count: number;
    byCategory: { categoryName: string; total: number; percentage: number }[];
  };
  transfers: {
    total: number;
    count: number;
  };
  netFlow: number;
  savingsRate: number;
}

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  totalExpenses: number;
  transactionCount: number;
  averageTransaction: number;
  percentage: number;
  trend: { month: string; total: number }[];
}

export interface AccountReport {
  accountId: string;
  accountName: string;
  accountType: string;
  currencyCode: string;
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransfersIn: number;
  totalTransfersOut: number;
  netFlow: number;
}

export interface BudgetReport {
  budgetId: string;
  budgetName: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  status: string;
  contributions: {
    date: Date;
    amount: number;
    description: string | null;
  }[];
  projectedCompletion: Date | null;
}

export interface FinancialSummary {
  period: { startDate: Date; endDate: Date };
  overview: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
  topExpenseCategories: { name: string; total: number; percentage: number }[];
  topIncomeJobs: { name: string; total: number; percentage: number }[];
  accountBalances: { name: string; balance: number; currency: string }[];
  budgetStatus: { name: string; progress: number; status: string }[];
}

export interface ExportData {
  format: "json" | "csv";
  type: "transactions" | "summary" | "full";
  filters?: ReportFilters;
}
