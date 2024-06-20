import { User } from "./userTypes";
import { County, ExtendedCounty } from "./countyType";
import { BuyerLead } from "./buyerLeadTypes";

export type Lead = {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    county: string;
    zip_code: string | null;
    county_id: County;
    uploaded_by_user_id: string | null;
    lead_type: string | null;
    buyer_note: string | null;
    buyer: string | null;
    buyer_leads: BuyerLead[] | null;
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
    county_id: County;
    county: string;
    uploaded_by_user: User | null;
    lead_type: string | null;
    buyer_note: string | null;
    buyer: string | null;
    counties: ExtendedCounty | null;
    buyer_leads: BuyerLead[] | null;
    status: 'new' | 'viewed' | 'archived';
    created?: Date | null;
}
