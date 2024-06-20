import {Subscription} from "./subscriptionTypes.ts";
import {BuyerLead} from "./buyerLeadTypes.ts";
import {Transaction} from "./transactionType.ts";

export type FullUser = {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    current_balance: number | null;
    stripe_customer_id: string | null;
    role: 'admin' | 'user' | 'buyer' | null;
    auth: string | null;
    created: Date | null;
    modified: Date | null;
    deleted: Date | null;
    stripe_payment_method_id: string | null;
    monthly_budget: number;
    transactions: Transaction[];
    subscriptions: Subscription[];
    buyer_leads: BuyerLead[];
};

export type budgetCardProps = {
    current_balance: number;
    monthly_budget: number;
    remainingAmount: number;
    budgetPercentUsed: number;
    pendingCharges: number;
    dateRange: { fromDate: string, toDate: string };
};
