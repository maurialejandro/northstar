export type Buyer = {
  id: string;
  // XXX this means nothing; remove
  user_id: string;
  auth?: string;
  county_id: string;
  bid_amount: number;
  name: string;
  email: string;
  created?: string;
  modified?: string;
  deleted?: null | string;
  leadAssigned?: string, // TODO leadAssigned?? card #17
  dispute_rate?: number;
  current_balance: number;
  monthly_budget: number;
};
