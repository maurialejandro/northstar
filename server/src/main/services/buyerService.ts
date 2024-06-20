import BuyerDAO from '../data/buyerDAO';
import { Buyer } from '../types/buyerTypes.ts';
import { injectable } from "tsyringe";
import { BudgetCardProps } from "../types/buyerBudgetCardTypes.ts";
import TransactionsDAO from "../data/transactionsDAO.ts";
import { Transaction } from "../types/transactionType.ts";
import { DateUtils } from "../middleware/dateUtils.ts";

@injectable()
export default class BuyerService {

    constructor( private readonly buyer: BuyerDAO, private readonly transactions: TransactionsDAO, private readonly dateUtils: DateUtils ) {}

    async getBuyers(): Promise<Buyer[]> {
        return await this.buyer.getBuyers();
    }

    async getBuyerById(buyerId: string): Promise<Buyer | null> {
        return await this.buyer.getBuyerById(buyerId);
    }

    async getBudget(user_id: string): Promise<BudgetCardProps> {
        const result: BudgetCardProps = {
            budgetPercentUsed: 0,
            current_balance: 0,
            dateRange: this.dateUtils.currentMonthForBudgetCard(),
            monthly_budget: 0,
            pendingCharges: 0,
            remainingAmount: 0,
        };

        const user = await this.buyer.getBuyerById(user_id);
        if (!user) return result;

        const dateRange = this.dateUtils.currentMonth();
        const dateRangeExtended = this.dateUtils.extendedCurrentMonth();

        const buyerTransactions = await this.transactions.getAllByBuyerId(user_id, 50, 0, dateRangeExtended);

        if (!buyerTransactions.length) return result;

        // charge_date = 2023-12-06T16:41:06.823364
        const currentMonthTransactions = buyerTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.charge_date);
            return transactionDate >= new Date(dateRange.fromDate) && transactionDate <= new Date(dateRange.toDate);
        });

        result.monthly_budget = user.monthly_budget;

        const totalCreditCardTransactions = this.calculateTotalCreditCardTransactions(currentMonthTransactions);
        result.remainingAmount = (result.monthly_budget + totalCreditCardTransactions) > 0
            ? (result.monthly_budget + totalCreditCardTransactions)
            : 0;

        result.budgetPercentUsed = result.remainingAmount <= 0
            ? 100
            : Math.round((totalCreditCardTransactions / result.monthly_budget) * -100);

        result.current_balance = user.current_balance;
        result.pendingCharges = this.calculatePendingCharges(buyerTransactions);

        return result;
    }

    async getUnchargedAssignedLeads(user_id: string) {
        return await this.buyer.getUnchargedAssignedLeads(user_id)
    }

    async getRemainingBudgetTakingIntoAccountAssignedLeads(user_id: string): Promise<number> {
        const budgetWithoutAssigned = await this.getBudget(user_id);
        const unchargedAssignedLeads = await this.getUnchargedAssignedLeads(user_id);
        const sumOfAssignedLeads = unchargedAssignedLeads.reduce((acc, lead) => {
            acc += Number(lead.price);
            return acc;
        }, 0)
        return budgetWithoutAssigned.remainingAmount - sumOfAssignedLeads;
    }

    private calculateTotalCreditCardTransactions(currentMonthTransactions: Transaction[]) {
        return currentMonthTransactions.reduce((acc, transaction) => {
            if (transaction.stripe_transaction_id) {
                acc += transaction.amount; // ensure the amount is negative
            }
            return acc;
        }, 0);
    }

    private calculatePendingCharges(transactions: Transaction[]) {
        return transactions.reduce((acc, transaction) => {

            if (transaction.credit_card_charged === 'pending' || transaction.credit_card_charged === 'failed') {
                if (transaction.buyer_leads) {
                    if (!transaction.buyer_leads.disputes || transaction.buyer_leads.disputes.status === "Rejected") {
                        // Ensure the amount is negative
                        acc -= transaction.amount;
                    }
                } else {
                    // Ensure the amount is negative
                    acc -= transaction.amount;
                }
            }

            // Disputes with 'Pending' or 'Approved' status are not counted, as well as types not listed
            return acc;
        }, 0);
    }
}