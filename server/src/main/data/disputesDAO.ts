import { AverageContext, DisputesAverage, ExtendedDispute, GlobalAvaregeDispute } from '../types/disputesTypes.ts';
import { injectable } from "tsyringe";
import { SupabaseWrapper } from '../config/supabaseProvider';
import {DBContainer} from "../config/DBContainer.ts";
import {IClient} from "pg-promise/typescript/pg-subset";
import {IDatabase} from "pg-promise";

@injectable()
export default class DisputesDAO {

    private readonly db: IDatabase<IClient>;

    constructor(private readonly wrapper: SupabaseWrapper, db: DBContainer) {
        this.wrapper = wrapper;
        this.db = db.database();
    }

    async getAll(limit: number, offset: number, search = '', status: string[],
                 dateRange: { fromDate: string, toDate: string }): Promise<ExtendedDispute[]> {
        return await this.wrapper.query<ExtendedDispute[]>(
            async (supabase) => {
                let query = supabase
                    .from('disputes')
                    .select('*, buyer_leads!inner(*, users!inner(*), leads!inner(*))')
                    .order('status')
                    .is('deleted', null)
                if (search !== '') {
                    query = query.or(
                    `name.ilike.%${search}%`, { foreignTable: 'buyer_leads.leads' })
                  } // BY LEAD
                if (status.length) query = query.in('status', [status])
                if (dateRange.fromDate !== '') query = query.gte('dispute_date', dateRange.fromDate)
                if (dateRange.toDate !== '') query = query.lte('dispute_date', dateRange.toDate)
                return await query.range(offset, offset + limit - 1);
            })
    }

    async countDisputes(search = '', status: string[],
                        dateRange: { fromDate: string, toDate: string }): Promise<number> {
        return await this.wrapper.query<number>(
            async (supabase) => {
                let query = supabase
                    .from('disputes')
                    .select('*, buyer_leads!inner(*, users!inner(*), leads!inner(*))', { count: 'exact' })
                    .order('status')
                if (search !== '') {
                    query = query.or(
                    `name.ilike.%${search}%`, { foreignTable: 'buyer_leads.leads' })
                  } // BY LEAD
                if (status.length) query = query.in('status', [status])
                if (dateRange.fromDate !== '') query = query.gte('dispute_date', dateRange.fromDate)
                if (dateRange.toDate !== '') query = query.lte('dispute_date', dateRange.toDate)
                return await query;
            }, true
        )
    }

    async create(
        buyer_lead_id: string,
        dispute_reason: string,
        dispute_message: string
    ): Promise<ExtendedDispute> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('disputes')
                    .insert({
                        buyer_lead_id,
                        dispute_reason,
                        dispute_message,
                        dispute_date: new Date(),
                    })
                    .select('*')
                    .single();
            }
        )
    }

    async update(
        id: string,
        updatedData: Partial<ExtendedDispute>
    ): Promise<ExtendedDispute> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('disputes')
                    .update({ ...updatedData, modified: new Date() })
                    .match({ id })
                    .select('*')
                    .single();
            }
        )
    }

    async delete(id: string): Promise<ExtendedDispute> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('disputes')
                    .update({ deleted: new Date() })
                    .match({ id })
                    .select('*')
                    .single();
            }
        )
    }

    async getDisputeById(id: string): Promise<ExtendedDispute> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('disputes')
                    .select('*')
                    .match({ id })
                    .single();
            }
        )
    }

    async getDisputeRate(buyerId: string): Promise<{dispute_rate : number | null}> {
        const result = await this.db.oneOrNone<{ dispute_rate: string }>(`
            WITH leads_assigned AS (
                SELECT count(*) AS num_leads 
                FROM buyer_leads 
                WHERE user_id=$1 AND deleted IS NULL), 
            
            disputes_filed AS (
                SELECT count(*) AS num_disputes 
                FROM disputes INNER JOIN buyer_leads ON (buyer_lead_id=buyer_leads.id)
                WHERE user_id=$1 
                AND disputes.deleted IS NULL 
                AND buyer_leads.deleted IS NULL)
         
            SELECT 
                CASE 
                    WHEN num_leads = '0' THEN 0
                    ELSE ROUND(num_disputes::decimal / num_leads, 3)
                END AS dispute_rate
            FROM leads_assigned, disputes_filed`, buyerId);

        return {
            dispute_rate: result ? parseFloat(result.dispute_rate) : 0
        };
    }
  
    async getCalculatedAverageDisputeRate(): Promise<{ average_dispute: number, dispute_count: number, lead_count: number }> {
    const result = await this.db.one<{
        average_dispute: string,
        dispute_count: number,
        lead_count: number
    }>(`
        WITH leads_assigned AS (
            SELECT count(*) AS num_leads 
            FROM buyer_leads 
            WHERE deleted IS NULL
            AND created >= NOW() - INTERVAL '3 months'
        ),
        disputes_filed AS (
            SELECT count(*) AS num_disputes 
            FROM disputes 
            INNER JOIN buyer_leads ON (buyer_lead_id = buyer_leads.id)
            WHERE disputes.deleted IS NULL 
            AND buyer_leads.deleted IS NULL
            AND disputes.created >= NOW() - INTERVAL '3 months'
        )
        SELECT
            CASE
                WHEN num_leads > 0 THEN ROUND(num_disputes::decimal / num_leads, 3)
                ELSE 0  -- O cualquier otro valor predeterminado que desees en caso de división por cero
            END AS average_dispute,
            num_disputes AS dispute_count,
            num_leads AS lead_count
        FROM disputes_filed, leads_assigned
    `);
    const { average_dispute, dispute_count, lead_count } = result;
    return {
        average_dispute: parseFloat(average_dispute),
        dispute_count,
        lead_count
    };
}

    async getGlobalAverage(): Promise<DisputesAverage> {
      return this.wrapper.query(
        async (supabase) => {
          const data = supabase
            .from('average_dispute_rate')
            .select('*')
            .single();
          return data
        })
    }
    
    async updateAverageDispute(name : string, value: number, context: AverageContext): Promise<GlobalAvaregeDispute> {
        const result = await this.db.one<{
            name: string,
            value: number,
            context: AverageContext
        }>(`
            INSERT INTO global_stats (name, value, context)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO UPDATE
            SET value = EXCLUDED.value, context = EXCLUDED.context;
        `, [name, value, context]);
        
        return result
    }
}