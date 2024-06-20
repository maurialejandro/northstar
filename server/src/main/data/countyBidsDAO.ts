import 'reflect-metadata'
import { injectable } from "tsyringe";
import { SupabaseWrapper } from '../config/supabaseProvider';
import { CountyBid } from '../types/countyBidsTypes.ts';
import { County } from "../types/countyType.ts";

@injectable()
export default class CountyBidsDAO {

    constructor(private wrapper: SupabaseWrapper) {
        this.wrapper = wrapper;
    }

    async getAll(limit: number, offset: number, search = '', counties: string[]): Promise<CountyBid[]> {
        return await this.wrapper.query<CountyBid[]>(
            async (supabase) => {
                let query = supabase
                    .from('county_bids')
                    .select(`*, users!inner(id, email), counties!inner( id, name, state, population )`)
                    .is('deleted', null)
                    .order('created', { ascending: false })
                    .limit(50);
                if (search !== '') query = query.or(`name.ilike.%${search}%`, { foreignTable: 'counties' })
                if (counties.length) query = query.in('counties.name', [counties])
                return query.range(offset, offset + limit - 1);
            }
        );
    }

    async getAllBids(): Promise<CountyBid[]> {
        return await this.wrapper.query<CountyBid[]>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .select(`*, users!inner(id, email), counties!inner( id, name, state, population )`)
                    .is('deleted', null)
                    .order('created', { ascending: false })
            }
        );
    }

    async countCountyBids(search = '', counties: string[]): Promise<number> {
        return await this.wrapper.query<number>(
            async (supabase) => {
                let query = supabase
                    .from('county_bids')
                    .select(`*, users!inner(id, email), counties!inner(*)`, { count: 'exact' })
                    .is('deleted', null)
                    .order('created', { ascending: false })
                    .limit(50);
                if (search !== '') query = query.or(`name.ilike.%${search}%`, { foreignTable: 'counties' })
                if (counties.length) query = query.in('counties.name', [counties])
                return query;
            }, true
        )
    }

    async getByBuyer(user_id: string): Promise<CountyBid[]> {
        return await this.wrapper.query<CountyBid[]>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .select(`*, users!inner (id, email, current_balance), counties!inner( id, name, state, population )`)
                    .eq('users.id', user_id)
                    .is('deleted', null)
                    .order('created', { ascending: false })
                    .limit(50);
            }
        );
    }

    async getByCounty(county_id: string): Promise<Partial<CountyBid>[]> {
        return await this.wrapper.query<CountyBid[]>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .select(`*, users(*,buyer_leads(*), subscriptions(subscription_level_id(*))), counties!inner(*)`)
                    .eq('counties.id', county_id)
                    .is('deleted', null)
                    .order('created', { ascending: false })
                    .limit(50);
            }
        );
    }

    async create(userId: string, countyId: string, bidAmount: number): Promise<CountyBid> {
        return await this.wrapper.query<CountyBid>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .insert([
                        {
                            user_id: userId,
                            county_id: countyId,
                            bid_amount: bidAmount,
                        },
                    ])
                    .select('*')
                    .single();
            }
        );
    }

    async update(id: string, updatedData: Partial<CountyBid>): Promise<CountyBid> {
        return await this.wrapper.query<CountyBid>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .update({ ...updatedData, modified: new Date() })
                    .match({ id })
                    .select('*')
                    .single();
            }
        );
    }

    async bulkDelete(ids: string[]): Promise<CountyBid[]> {
        return await this.wrapper.query<CountyBid[]>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .update({ deleted: new Date() })
                    .in('id', ids)
                    .select('*')
            }
        );
    }

    async delete(id: string): Promise<CountyBid> {
        return await this.wrapper.query<CountyBid>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .update({ deleted: new Date() })
                    .eq('id', id)
                    .select('*')
                    .single();
            }
        );
    }

    async unDelete(id: string): Promise<CountyBid> {
        return await this.wrapper.query<CountyBid>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .update({ deleted: null })
                    .match({ id })
                    .select('*')
                    .single();
            }
        );
    }

    async getAllStates(): Promise<{ state: string }[]> {
        return await this.wrapper.query<{ state: string }[]>(
            async (supabase) => {
                return supabase
                    .from('distinct_states')
                    .select();
            }
        );
    }

    async getCountiesByState(state: string): Promise<County[]> {
        return await this.wrapper.query<County[]>(
            async (supabase) => {
                return supabase
                    .from('counties')
                    .select('*')
                    .is('deleted', null)
                    .eq('state', state)
                    .order('name', { ascending: true });
            }
        );
    }

    async getAllCounties(): Promise<County[]> {
        return await this.wrapper.query<County[]>(
            async (supabase) => {
            return supabase
                .from('counties')
                .select('*')
                .is('deleted', null)
                .order('name', { ascending: true });
            }
        );
    }

  //get county by id
  async getCountyById(id: string): Promise<CountyBid> {
    return await this.wrapper.query<CountyBid>(
      async (supabase) => {
          return supabase
            .from('county_bids')
            .select('*')
            .eq('id', id)
            .is('deleted', null)
            .single()
      }
    );
    }

    async countyBidsById(id: string): Promise<CountyBid> {
        return await this.wrapper.query<CountyBid>(
            async (supabase) => {
                return supabase
                    .from('county_bids')
                    .select('*')
                    .eq('county_id', id)
                    .is('deleted', null)
            }
        );
    }

}
