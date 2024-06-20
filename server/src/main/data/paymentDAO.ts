import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { injectable } from "tsyringe";
import { Transaction } from '../types/transactionType.ts';
import { SupabaseWrapper } from "../config/supabaseProvider.ts";
import { User } from "../types/userTypes.ts";
@injectable()
export default class PaymentDAO {

    constructor(private readonly supabaseClient: SupabaseClient , private readonly wrapper: SupabaseWrapper) {}

    async postTransactionIntoDB(
        id: string,
        customer_id: string,
        amount: number,
        status: string,
    ): Promise<{ data: Transaction | null, error?: PostgrestError }> {
        const { data, error } = await this.supabaseClient.from("transactions").insert([
            {
                id,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                customer_id,
                amount,
                status,
            },
        ]);
        if (error) {
            return { data, error };
        } else {
            return { data };
        }
    }

    // TODO check and delete if outdated
    async updateUserIfNecessaryInDB(
        customer_id: string,
        data: {
            email: string,
            card: string
        }
    ): Promise<boolean> {

        const email = data.email;
        const card = data.card;

        const { data: userData, error: userError } = await this.supabaseClient
            .from("users")
            .select("stripe_customer_id")
            .eq("email", email)
            .single();

        if (userError) {
            return false;
        } else {
            const stripeCustomerId = userData.stripe_customer_id;
            if (!stripeCustomerId) {
                await this.supabaseClient
                    .from("users")
                    .update({
                        stripe_customer_id: customer_id,
                        stripe_payment_method_id: card,
                    })
                    .eq("email", email);
                return true;
            } else {
                return false;
            }
        }
    }

    // DB Updates TODO check and delete if outdated
    async updateUserCustomerIdInDB(
        customer_id: string,
        email: string
    ): Promise<boolean> {

        const { data: userData, error: userError } = await this.supabaseClient
            .from("users")
            .select("stripe_customer_id")
            .eq("email", email)
            .single();

        if (userError) {
            return false;
        } else {
            const stripeCustomerId = userData.stripe_customer_id;
            if (!stripeCustomerId) {
                await this.supabaseClient
                    .from("users")
                    .update({
                        stripe_customer_id: customer_id,
                    })
                    .eq("email", email);
                return true;
            } else {
                return false;
            }
        }
    }

    // TODO remove if not used in the future
    async updateUserPaymentMethodInDB(
        stripe_payment_method_id: string,
        email: string
    ): Promise<boolean> {
        const { data: userData, error: userError } = await this.supabaseClient
            .from("users")
            .select("stripe_payment_method_id")
            .eq("email", email)
            .single();

        if (userError) {
            return false;
        } else {
            const stripePaymentMethod = userData.stripe_payment_method_id;
            if (!stripePaymentMethod) {
                await this.supabaseClient
                    .from("users")
                    .update({
                        stripe_payment_method_id
                    })
                    .eq("email", email);
                return true;
            } else {
                return false;
            }
        }
    }

    async setCustomerIDInDB(stripe_customer_id: string, id:string): Promise<User> {
        return await this.wrapper.query<User>(
            async (supabase) => {
                return supabase
            .from('users')
            .update({ stripe_customer_id })
            .eq('id', id)
            .select('*')
            .single()
            });
    }

    async setDefaultPaymentMethodInDB(stripe_payment_method_id: string | null, id:string): Promise<User> {
        return await this.wrapper.query<User>(
            async (supabase) => {
                return supabase
            .from('users')
            .update({ stripe_payment_method_id })
            .eq('id', id)
            .select('*')
            .single()
            });
    }

}