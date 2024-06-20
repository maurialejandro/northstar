import { Dispute } from "./disputesTypes";
import { Lead } from "./leadTypes";
import { User } from "./userTypes";
import { Transaction } from "./transactionType.ts";

export type BuyerLead = {
    id: string;
    lead_id: string;
    leads: Lead;
    user_id: string | null;
    users: User | null;
    price: number;
    status: 'new' | 'viewed' | 'archived' | 'pending' | 'buyer-confirmed';
    sent_date: Date | null;
    sent: boolean;
    disputes: Dispute
    transactions: Transaction[];
    deleted: Date | null;
    created: Date;
}