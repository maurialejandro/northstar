import { EnvConfig } from "./envConfig.ts";
import { createClient, PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseProvider {
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  supabase(config: EnvConfig) : SupabaseClient;
}

/**
 * Constructs supabase based on env vars
 */
export class EnvironmentalSupabaseProvider implements SupabaseProvider {

    supabase(config: EnvConfig): SupabaseClient {
        return createClient(config.supabaseUrl, config.supabaseKey, { auth: { persistSession: false } })
    }
}

/**
 * For tests
 */
export class InstantiatedSupabaseProvider implements SupabaseProvider {

    constructor(private readonly supabaseClient: SupabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    supabase(): SupabaseClient {
        return this.supabaseClient;
    }
}

export class SupabaseWrapper {

    constructor(private readonly supabase: SupabaseClient) {
        this.supabase = supabase;
  }
  
    /**
     * @param queryFunction example: ` (supabase) => { return supabase.select... } `
     * @param performCount true if this is a count query, leave out otherwise
     */
    async query<T>(
        queryFunction: (supabase: SupabaseClient) => Promise<PostgrestResponse<T>>,
        performCount = false
    ): Promise<T> {
        return await queryFunction(this.supabase)
            .then(({ data, error, count }) => {
                if (error) {
                    throw new Error('Supabase error: ' + error.message);
                } else {
                    if (performCount) {
                        return count as T
                    } else {
                        return data as T;
                    }
                }
            });
    }

    async authQuery<T>(
        operation: (auth: typeof this.supabase.auth) => Promise<T>
    ): Promise<T> {
        return operation(this.supabase.auth)
            .then(data => {
                if (!data) {
                    throw new Error('Supabase Auth error: No data returned');
                } else {
                    return data as T;
                }
            });
    }

}