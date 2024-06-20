import { injectable } from "tsyringe";
import { SupabaseWrapper } from '../config/supabaseProvider';
import { AuthResponse, AuthTokenResponse } from "@supabase/supabase-js";
import { User } from "../types/userTypes.ts";
import { EnvConfig } from "../config/envConfig.ts";
import { clientRoutes } from "../config/clientRoutes.ts";

@injectable()
export default class UserDAO {

    constructor(private readonly wrapper: SupabaseWrapper, private config: EnvConfig) {
        this.wrapper = wrapper;
        this.config = config;
    }

    async getRole(supabaseToken:string): Promise<{ role: string }> {
        return await this.wrapper.query(
            async (supabase) => {
                const {data} = await supabase.auth.getUser(supabaseToken);
                // from the users table get the record that in the column auth matches the id of the user previously found
                return await supabase
                    .from('users')
                    .select('role')
                    .eq('auth', data.user!.id)
                    .single();
            });
    }

    async register(email: string, password: string): Promise<AuthResponse> {
        return await this.wrapper.authQuery<AuthResponse>(
            async (auth) => {
                return auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: this.config.clientUrl + clientRoutes.buyerDashboard
                    }
                });
            }
        );
    }

    async authenticate(email: string, password: string): Promise<AuthTokenResponse> {
        return await this.wrapper.authQuery<AuthTokenResponse>(
            async (auth) => {
                return auth.signInWithPassword({ email, password });
            }
        );
    }

    // get user by id
    async getUserById(userId: string): Promise<User> {
        return await this.wrapper.query(
            async (supabase) => {
                return supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single(); // TODO the only way to know if the id is valid is to query the db. ticket #32
            })
    }

    async updateUserById(user_id: string, newUserData: Partial<User>): Promise<User> {
        return await this.wrapper.query(
            async (supabase) => {
                return supabase
                    .from('users')
                    .update(newUserData)
                    .eq('id', user_id)
                    .select('*')
                    .single();
            })
    }

    // get stripe customer
    async getUserByEmail(
        email: string,
    ): Promise<User> {
        return await this.wrapper.query<User>(
            async (supabase) => {
                return supabase
                    .from("users")
                    .select("*")
                    .eq("email", email)
                    .single();
            }
        )
    }

    // update payment method whit customer_id
    async updateBuyerByEmail(
        data:Partial<User>,
        email: string
    ): Promise<User>{
        return await this.wrapper.query<User>(
            async (supabase) => {
                return supabase
                    .from("users")
                    .update([data])
                    .match({ email })
                    .select("*")
                    .single()
            }
        )
    }

}
