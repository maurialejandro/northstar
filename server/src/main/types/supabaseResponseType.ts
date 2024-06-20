import { PostgrestError } from "@supabase/supabase-js";

export type SupabaseResponse<T> = {
    message?: 'Supabase error' | 'Internal server error' | 'Success'
    error?: string | PostgrestError | null;
    data: T | null;
    count?: number;
}