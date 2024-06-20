import { User } from "./userTypes.ts";
import { SubscriptionLevel } from "./subscriptionTypes.ts";

export type Transaction = {
    created: Date;
    id: string;
    user_id: string;
    amount: number;
    balance: number;
    charge_date: string | Date,
    users: User
    } & (
    {
        buyer_leads_id: null;
        type: 'add-credits';
        stripe_transaction_id: string;
        dispute_id: null;
        refers_to_transaction: null;
        refers_to_transaction_id: null;
        credit_card_charged: 'pending' | 'success' | 'failed';
    } | {
        buyer_leads_id: string;
        type: 'lead-assign';
        stripe_transaction_id: null;
        dispute_id: null;
        refers_to_transaction: null | Partial<Transaction> | string;
        refers_to_transaction_id: null | string;
        credit_card_charged: null;
    } | {
        buyer_leads_id: string;
        type: 'return';
        stripe_transaction_id: null;
        dispute_id: string;
        refers_to_transaction: Partial<Transaction> | string;
        refers_to_transaction_id: string;
        credit_card_charged: null;
    } | {
        buyer_leads_id: null;
        type: 'bronze' | 'silver' | 'gold';
        stripe_transaction_id: string;
        dispute_id: null;
        refers_to_transaction: null;
        refers_to_transaction_id: null;
        credit_card_charged: 'pending' | 'success' | 'failed';
        subscription_level: SubscriptionLevel;
    } | {
        buyer_leads_id: null;
        type: 'subscription-credits';
        stripe_transaction_id: null;
        dispute_id: null;
        refers_to_transaction: Partial<Transaction> | string;
        refers_to_transaction_id: string;
        credit_card_charged: null;
    } | {
        buyer_leads_id: string;
        type: 'lead-charge';
        stripe_transaction_id: string | null;
        dispute_id: null;
        refers_to_transaction: null;
        refers_to_transaction_id: null;
        credit_card_charged: 'pending' | 'success' | 'failed';
    } | {
        buyer_leads_id: null;
        type: 'promotion';
        stripe_transaction_id: string | null;
        dispute_id: null;
        refers_to_transaction: null;
        refers_to_transaction_id: null;
        credit_card_charged: null;
    } | {
        buyer_leads_id: null;
        type: 'admin';
        stripe_transaction_id: string | null;
        dispute_id: null;
        refers_to_transaction: null;
        refers_to_transaction_id: null;
        credit_card_charged: null;
    }
);
