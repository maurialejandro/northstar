import { ExtendedDispute } from "./disputesTypes.ts";
import { User } from "./userTypes.ts";
import { SubscriptionLevel } from "./subscriptionTypes.ts";
import {BuyerLead} from "./buyerLeadsTypes.ts";

// create enum for transaction type
export enum CreditCardTransactionTypes {
    ADD_CREDITS = 'add-credits',
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
    LEAD_CHARGE = 'lead-charge',
}

export type Transaction = {
    created: Date;
    id: string;
    user_id: string;
    amount: number;
    balance: number;
    charge_date: string | Date,
    users: User
    credit_card_charged: null | 'pending' | 'success' | 'failed' | 'not-applicable';
    buyer_leads: BuyerLead | null;
} & (
    {
        buyer_leads_id: null;
        type: 'add-credits';
        stripe_transaction_id: string;
        dispute_id: null;
        refers_to_transaction: null;
        refers_to_transaction_id: null;
    } | {
    buyer_leads_id: string;
    type: 'lead-assign';
    stripe_transaction_id: null;
    dispute_id: null;
    refers_to_transaction: null | Partial<Transaction> | string;
    refers_to_transaction_id: null | string;
} | {
    buyer_leads_id: string;
    type: 'return';
    stripe_transaction_id: null;
    dispute_id: string;
    refers_to_transaction: Partial<Transaction> | string;
    refers_to_transaction_id: string;
} | {
    buyer_leads_id: null;
    type: 'bronze' | 'silver' | 'gold';
    stripe_transaction_id: string;
    dispute_id: null;
    refers_to_transaction: null;
    refers_to_transaction_id: null;
    subscription_level: SubscriptionLevel;
} | {
    buyer_leads_id: null;
    type: 'subscription-credits';
    stripe_transaction_id: null;
    dispute_id: null;
    refers_to_transaction: Partial<Transaction> | string;
    refers_to_transaction_id: string;
} | {
    buyer_leads_id: string;
    type: 'lead-charge';
    stripe_transaction_id: string | null;
    dispute_id: null;
    refers_to_transaction: null;
    refers_to_transaction_id: null;
} | {
    buyer_leads_id: null;
    type: 'promotion';
    stripe_transaction_id: string | null;
    dispute_id: null;
    refers_to_transaction: null;
    refers_to_transaction_id: null;
} | {
    buyer_leads_id: null;
    type: 'admin';
    stripe_transaction_id: string | null;
    dispute_id: null;
    refers_to_transaction: null;
    refers_to_transaction_id: null;
}
    );

export type ExtendedTransaction = Transaction & {
    buyer_leads: {
        id: string
        lead: {
            name: string
            county: string
        }
        disputes: ExtendedDispute
    }
    users: User
}
