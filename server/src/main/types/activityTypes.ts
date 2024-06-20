export type Activity = {
    id: string;
    lead_id: string;
    user_id: string;
    visibility: 'private' | 'admin' | 'user';
    note: string;
}