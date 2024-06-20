export type CountyBid = {
    id: string;
    bid_amount: number | null;
    user_id: string;
    users: User;
    county_id: string;
    counties?: CountyID; // TODO should this be an optional thing?
}

export type CountyID = {
    id: string;
    name: string;
    population: number;
    state: string;
}

export type User = {
    email: string;
    id: string;
    current_balance?: number;
    current_budget?: number;
}

export type ExtendedCountyBid = {
    id: string;
    user_id: string
    county_id: string
    counties?: CountyID
    bid_amount: null | number;
    users: User;
    lead_assigned?: string;
    dispute_rate?: number | null;
    win_rate?: number | null;
}