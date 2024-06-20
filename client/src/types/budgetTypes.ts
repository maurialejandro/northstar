export type BudgetCardProps = {
    current_balance: number;
    monthly_budget: number;
    remainingAmount: number;
    budgetPercentUsed: number;
    pendingCharges: number;
    dateRange: string[];
}