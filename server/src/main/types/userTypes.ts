import { Transaction } from './transactionType';
import { Subscription } from './subscriptionTypes';
import { BuyerLead } from "./buyerLeadsTypes.ts";

export type User = {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: 'buyer' | 'admin';
    auth: string;
    stripe_payment_method_id: string | null;
    stripe_customer_id: string | null;
    new_user_data_token: string | null;
    current_balance: number;
    monthly_budget: number;
};

export type ExtendedUser = User & {
    transactions: Transaction[];
    subscriptions: Subscription[];
    buyer_leads: BuyerLead[];
}
