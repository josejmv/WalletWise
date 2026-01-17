export interface DashboardKPIs {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  activeAccounts: number;
  activeJobs: number;
  activeBudgets: number;
}

export interface BalanceByAccount {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  currencyCode: string;
  // Balance converted to USD for comparison
  balanceInUSD: number;
}

export interface BalanceByCurrency {
  currencyId: string;
  currencyCode: string;
  totalBalance: number;
  convertedBalance?: number; // Amount converted to user's base currency
}

export interface ExpensesByCategory {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
}

export interface BudgetProgress {
  budgetId: string;
  budgetName: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  status: string;
}

export interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  currencyId?: string;
}

export interface DashboardSummary {
  kpis: DashboardKPIs;
  balanceByAccount: BalanceByAccount[];
  balanceByCurrency: BalanceByCurrency[];
  expensesByCategory: ExpensesByCategory[];
  monthlyTrend: MonthlyTrend[];
  budgetProgress: BudgetProgress[];
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: string;
  type: "income" | "expense" | "transfer" | "contribution" | "withdrawal";
  amount: number;
  currencyCode: string;
  description: string | null;
  date: Date;
  category?: string;
  account: string;
  budgetName?: string; // For contributions and withdrawals
}

export interface SavingsBreakdown {
  savings: number;
  count: number;
}

export interface SavingsData {
  totalSavings: number;
  transactionCount: number;
  breakdown: {
    incomes: SavingsBreakdown;
    expenses: SavingsBreakdown;
    transfers: SavingsBreakdown;
  };
  currencyCode: string;
}
