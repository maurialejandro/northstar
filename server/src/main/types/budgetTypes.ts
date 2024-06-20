export type BudgetCardProps = {
    currentBalance: number;
    monthlyBudget: number;
    remainingAmount: number;
    budgetPercentUsed: number;
    pendingCharges: number;
    dateRange: string[];
}