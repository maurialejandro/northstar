import { BuyerLead } from './buyerLeadTypes';

export type BuyersResponse = {
  data: Buyer[];
  message?: string;
  error?: string
}

export type Buyer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  buyer: string;
  bid: number;
  sendTiming: string;
  billing: string; // TODO billing?? card #17
  notes: string;
  admin: string;
  monthly_budget?: number;
  subscriptions?: Subscription[];
  subscription_levels?: SubscriptionLevel[]
  buyer_leads?: BuyerLead[];
  current_balance?: number;
};

export type UserData = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  current_balance: number;
  monthly_budget: number;
  stripe_customer_id: string | null;
  role: 'buyer' | 'admin';
  auth: string;
  stripe_payment_method_id: string | null;
  amount?: number; // TODO clean up!! card #17
};

export type Subscription = {
  start_date: string,
  subscription_level_id: {
    id: string;
    level: string;
    charge: number;
    credit: number;
    start_date: string;
  };
};

export type SubscriptionLevel = {
    id: string;
    level: string;
    charge: number;
    credit: number;
};
