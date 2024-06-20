import { User } from "./userTypes";
import { ExtendedCounty } from "./countyType";
import { BuyerLead } from "./buyerLeadsTypes.ts";

export type Lead = {
  address: string;
  buyer_note: null;
  city: string;
  county: string;
  county_id: string;
  created: Date;
  deleted: null;
  email: string;
  id: string;
  lead_type: null;
  modified: Date;
  name: string;
  phone: string;
  state: string;
  uploaded_by_user_id: null;
  zip_code: string;
  sendTiming: string;
  index?: number;
  buyer?: string;
  lead_label_id: string | null;
  leadAssigned?: string,
  lead_label?: LeadLabel | null;
  private_note?: string | null;// this is only used for the lead import and is not a part of the lead model
}

export type ExtendedLead = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  county: string;
  uploaded_by_user: User | null;
  lead_type: string | null;
  buyer_note: string | null;
  created: Date;
  modified: Date;
  deleted: Date | null;
  buyer: string | null;
  counties: ExtendedCounty | null;
  buyer_leads: BuyerLead[] | null;
  status: 'new' | 'viewed' | 'archived';
  lead_labels: LeadLabel | null;
  lead_label_id: string | null;
}

export type LeadLabel = {
  id: string;
  text: string;
  color: string;
  user_id: string;
  label_color:{ id: string; color: string;}
  created: Date;
  modified: Date;
  deleted: Date | null;
}

export type LeadImport = {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state: string;
    zip_code?: string;
    county: string;
    leadAssigned?: string,
}
