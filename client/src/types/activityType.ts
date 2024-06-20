import { User } from "./userTypes";

export type Activity = {
    id: string;
    lead_id: string;
    user_id: string;
    visibility: 'private' | 'admin' | 'user';
    note: string;
    created: Date;
    modified: Date | null;
    users?: Pick<User, 'name' | 'email'>;
    deleted?: string | null;
}
