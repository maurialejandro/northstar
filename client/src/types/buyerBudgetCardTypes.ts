export type budgetCardProps = {
    current_balance: number;
    monthly_budget: number;
    remainingAmount: number;
    budgetPercentUsed: number;
    pendingCharges: number;
    dateRange: { fromDate: string, toDate: string };
};
