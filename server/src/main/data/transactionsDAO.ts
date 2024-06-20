import { injectable } from "tsyringe";
import { SupabaseWrapper } from '../config/supabaseProvider';
import {
    Transaction,
    ExtendedTransaction,
} from '../types/transactionType.ts';

@injectable()
export default class TransactionsDAO {
    constructor(private readonly wrapper: SupabaseWrapper) {}

    async getAll(limit: number | null = null, offset: number | null = null): Promise<ExtendedTransaction[]> {
        return await this.wrapper.query<ExtendedTransaction[]>(
            async (supabase) => {
                let query = supabase
                    .from('transactions')
                    .select(`*, refers_to_transaction(*, subscription_level(*)), buyer_leads(id, lead_id(name, county))`)
                    .order('created', { ascending: false })
                    .is('deleted', null);

                if (limit != null && offset != null) query = query.range(offset, offset + limit - 1);
                return query;
            }
        );
    }

    async countAll(): Promise<number> {
        return await this.wrapper.query<number>(
            async (supabase) => {
                return await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .order('created', { ascending: false })
                    .is('deleted', null)
            }, true
        );
    }

    async getAllByBuyerId(user_id: string, limit: number, offset: number, dateRange: { fromDate: string, toDate: string }): Promise<ExtendedTransaction[]> {
        return await this.wrapper.query(
            async (supabase) => {
                let query = supabase
                    .from('transactions')
                    .select('*, transactions(*), refers_to_transaction(subscription_level(level)), buyer_leads(id, lead_id(name, county), price, disputes(*)), users(*)')
                    .eq('user_id', user_id)
                    .is('deleted', null)
                    .order('created', { ascending: false })
                    .range(offset, offset + limit - 1)

                if (dateRange.fromDate !== '') query = query.gte('created', dateRange.fromDate);
                if (dateRange.toDate !== '') query = query.lte('created', dateRange.toDate);

                return await query;
            });
    }

    async countAllByBuyerId(user_id: string, dateRange: { fromDate: string, toDate: string }): Promise<number> {
        return await this.wrapper.query<number>(
            async (supabase) => {
                let query = supabase
                    .from('transactions')
                    .select('*',{ count: 'exact', head: true })
                    .eq('user_id', user_id)
                    .is('deleted', null)

                if (dateRange.fromDate !== '') query = query.gte('created', dateRange.fromDate);
                if (dateRange.toDate !== '') query = query.lte('created', dateRange.toDate);

                return await query;
            }, true);
    }

    async returnCredits(
        user_id: string,
        buyer_leads_id: string,
        amount: number,
        dispute_id: string,
        refers_to_transaction_id: string
    ): Promise<Transaction | null> {
        return await this.wrapper.query<Transaction | null>(
            async (supabase) => {
                return await supabase
                    .from('transactions')
                    .insert([{ id: user_id + buyer_leads_id + 'return', user_id, buyer_leads_id, amount: amount * -1, type: 'return', dispute_id, refers_to_transaction_id }])
                    .select('*')
                    .single();
            }
        );
    }

    async getTransactionsByBuyerLeadId(
        id: string
    ): Promise<Transaction[] | null> {
        return await this.wrapper.query<Transaction[] | null>(
            async (supabase) => {
                return await supabase
                    .from('transactions')
                    .select('*')
                    .eq('buyer_leads_id', id)
                    .is('deleted', null)
                    .order('created', { ascending: false })
            }
        );
    }

    async postTransaction(
        data:Partial<Transaction>
    ): Promise<Transaction> {
        return await this.wrapper.query<Transaction>(
            async (supabase) => {
                return supabase
                .from("transactions")
                .insert([data])
                .select('*')
                .single();
            });
    }
}
