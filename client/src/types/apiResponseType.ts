import { PostgrestError } from "@supabase/supabase-js";

export type ApiResponse<T> = {
    message: 'Success' | 'Supabase error' | 'Internal server error';
    data: T | null;
    count?: number;
    error?: string | PostgrestError;
}
