import { injectable } from "tsyringe";
import { Subscription, SubscriptionLevel } from "../types/subscriptionTypes";
import { SupabaseWrapper } from "../config/supabaseProvider";

@injectable()
export default class SubscriptionsDAO {

    constructor(private wrapper: SupabaseWrapper) {
        this.wrapper = wrapper;
    }

    async getAll(fromDate='', toDate=''): Promise<Subscription[]> {

        return await this.wrapper.query<Subscription[]>(
            async (supabase) => {
                let query = supabase
                    .from('subscriptions')
                    .select(`*, subscription_levels(*), user_id(*)`) // TODO select only the fields we need
                    .order('created', { ascending: false })
                    .eq('can_renew', true)
                    .is('deleted', null)
                if (fromDate !== '') query = query.gte('end_date', fromDate)
                if (toDate !== '') query = query.lte('end_date', toDate)
                return query;
            }
        );
    }

    async getSubscriptionsByBuyerId(user_id: string): Promise<Subscription[]> {
        return await this.wrapper.query<Subscription[]>(
            async (supabase) => {
                return supabase
                    .from('subscriptions')
                    .select('*, subscription_levels(*), users(*)')
                    .eq('user_id', user_id)
                    .is('deleted', null)
            })
    }

    async getAllSubscriptionsByBuyerId(user_id: string, excludeCantRenew = false): Promise<Subscription[]> {
        return await this.wrapper.query<Subscription[]>(
            async (supabase) => {
                let query = supabase
                    .from('subscriptions')
                    .select('*, subscription_levels(*), users(*)')
                    .eq('user_id', user_id)
                    // end_date > today
                    .gte('end_date', new Date().toISOString())
                    .is('deleted', null)
                    if (excludeCantRenew) query = query.eq('can_renew', true)
                    return query
            })
    }

    // to update a subscription, the id of the user has to be sent
    async updateSubscription(data:Partial<Subscription>): Promise<Subscription> {
        return await this.wrapper.query<Subscription>(
            async (supabase) => {
                return supabase
                    .from('subscriptions')
                    .update(data)
                    .eq('id', data.id)
                    .eq('user_id', data.user_id)
                    .select('*, subscription_levels(*), users(*)')
                    .single();
            }
        );
    }

    async postSubscription(data:Partial<Subscription>): Promise<Subscription> {
        return await this.wrapper.query<Subscription>(
            async (supabase) => {
                return supabase
                    .from('subscriptions')
                    .insert(data)
                    .select('*, subscription_levels(*), users(*)')
                    .single();
            }
        );
    }

    // subscription levels stuff

    async getSubscriptionsLevels(): Promise<SubscriptionLevel[]> {
        return await this.wrapper.query<SubscriptionLevel[]>(
            async (supabase) => {
                return supabase
                    .from('subscription_levels')
                    .select('*')
                    .order('charge', { ascending: false })
                    .is('deleted', null);
            }
        );
    }

    async getSubscriptionsLevelById(id:string): Promise<SubscriptionLevel> {
        return await this.wrapper.query<SubscriptionLevel>(
            async (supabase) => {
                return supabase
                    .from('subscription_levels')
                    .select('*')
                    .match({ id })
                    .is('deleted', null)
                    .single();
            }
        );
    }

}
