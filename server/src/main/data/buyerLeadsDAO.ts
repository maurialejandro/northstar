import { injectable } from "tsyringe";
import { SupabaseWrapper } from '../config/supabaseProvider';
import { BuyerLead } from '../types/buyerLeadsTypes.ts';

@injectable()
export default class BuyerLeadsDAO {
    constructor(private readonly wrapper: SupabaseWrapper) {
        this.wrapper = wrapper;
    }

    async getAll(limit: number, offset: number): Promise<BuyerLead[]> {
        return await this.wrapper.query<BuyerLead[]>(
            async (supabase) => {
                return await supabase.from('buyer_leads')
                    .select('*')
                    .order('created', { ascending: false })
                    .range(offset, offset + limit - 1);
            }
        );
    }

    async countAll(limit: number, offset: number): Promise<number> {
        return await this.wrapper.query<number>(
            async (supabase) => {
                return await supabase.from('buyer_leads')
                    .select('*', { count: 'exact', head: true })
                    .order('created', { ascending: false })
                    .range(offset, offset + limit - 1);

            }, true
        );
    }

    async getOneByID(id: string): Promise<BuyerLead> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('buyer_leads')
                    .select('*, users!inner(*)')
                    .eq('id', id)
                    .single();
            }
        );
    }

    async getAllByBuyerId(user_id: string, getArchived: boolean, limit: number, offset: number, search = '', counties: string[] , dateRange: { fromDate: string, toDate: string }, visibility? : string): Promise<Partial<BuyerLead[]>> {
        return await this.wrapper.query(
            async (supabase) => {
                let query = supabase
                    .from('buyer_leads')
                    .select('*, user_id, users!inner(*), lead_id, leads!inner(name, phone, email, address, city, state, zip_code, county, counties!inner(*), activities(*)), disputes(*), transactions(*)')
                    .eq('user_id', user_id)
                    .neq('status', getArchived ? null : 'archived')
                    .neq('buyer_confirmed', false)
                    .order('status', { ascending: true })
                    .order('created', { ascending: false })
                    .range(offset, offset + limit - 1);

                if (search !== '') {
                    query = query.or(`name.ilike.%${search}%, county.ilike.%${search}%`, { foreignTable: 'leads' })
                }

                if (visibility) {
                    query = query.eq('leads.activities.visibility', visibility);
                }

                if (counties.length) query = query.in('leads.counties.id', [counties])
                if (dateRange.fromDate !== '') query = query.gte('sent_date', dateRange.fromDate)
                if (dateRange.toDate !== '') query = query.lte('sent_date', dateRange.toDate)
                return await query.range(offset, offset + limit - 1);
            }
        );
    }

    async countAllByBuyerId(user_id: string, getArchived: boolean, search = '', counties: string[],
                            dateRange: { fromDate: string, toDate: string }): Promise<number> {
        return await this.wrapper.query<number>(
            async (supabase) => {
                let query = supabase
                    .from('buyer_leads')
                    .select('*, lead_id, leads!inner(*, counties!inner(*)), user_id, users!inner(id, email), disputes(*)',
                        { count: 'exact' })
                    .eq('user_id', user_id)
                    .neq('buyer_confirmed', false)
                    .neq('status', getArchived ? null : 'archived');

                if (search !== '') {
                    query = query.or(`name.ilike.%${search}%, county.ilike.%${search}%`, { foreignTable: 'leads' })
                }
                if (counties.length) query = query.in('leads.counties.id', [counties])
                if (dateRange.fromDate !== '') query = query.gte('sent_date', dateRange.fromDate)
                if (dateRange.toDate !== '') query = query.lte('sent_date', dateRange.toDate)
                return await query;
            }, true);
    }

    async update(id: string, updatedData: Partial<BuyerLead>): Promise<BuyerLead> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('buyer_leads')
                    .update(updatedData)
                    .match({ id })
                    .select('*')
                    .single();
            }
        );
    }

    async delete(id: string): Promise<BuyerLead> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('buyer_leads')
                    .update({ deleted: new Date() })
                    .match({ id })
                    .select('*')
                    .single();
            }
        );
    }

    async create(newBuyerLead: { user_id: string; lead_id: string; status: string; price: number; }): Promise<BuyerLead> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('buyer_leads')
                    .insert(newBuyerLead)
                    .select('*')
                    .single();
            }
        );
    }
}
