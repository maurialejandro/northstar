export type ExtendedDispute = {
    admin_message: string
    dispute_date: Date | string
    dispute_message: string
    dispute_reason: string
    id: string
    status: 'Pending' | 'Approved' | 'Rejected';
    buyer_lead_id: string
    buyer_leads: {
        id: string
        lead_id: string
        leads: {
            address: string
            buyer: null | string
            buyer_note: null | string
            city: string
            county: string
            county_id: null | string
            email: string
            id: string
            lead_type: null
            name: string
            phone: string
            state: string
            uploaded_by_user_id: null
            zip_code: string
        }
        sent: true
        sent_date: string
        status: string
        price: number
        user_id: string
        users: { name: string, email: string, id: string }// this could be extended if needed
    }
};

export type Dispute = {
    admin_message: string
    dispute_date: Date
    dispute_message: string
    dispute_reason: string
    id: string
    status: 'Pending' | 'Approved' | 'Rejected';
    buyer_lead_id: string
    created?: string
};

export type DisputeRate = {
    dispute_rate: number
};

export type AverageDisputeRate = {
    average_dispute: number,
    dispute_count: number,
    lead_count: number
};
