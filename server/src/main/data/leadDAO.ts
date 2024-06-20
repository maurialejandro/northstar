import { injectable } from "tsyringe";
import { SupabaseWrapper } from '../config/supabaseProvider';
import { Lead, ExtendedLead, LeadLabel } from '../types/leadTypes';
import { LabelColor } from "../types/labelTypes";
import { County } from "../types/countyType.ts";

@injectable()
export default class LeadDAO {
    constructor(private wrapper: SupabaseWrapper) {
        this.wrapper = wrapper;
    }

    async getLeadById(leadId: string): Promise<Lead> {
      return await this.wrapper.query<Lead>(
        async(supabase) => {

          return supabase
              .from('leads')
              .select(`*, counties(*, county_bids(*, users(*))),buyer_leads(*, disputes(*), users(*))`)
              .eq('id', leadId)
              .is('deleted', null)
              .single();
        }
    );
  }

  async getAllLeads(limit: number, offset: number): Promise<ExtendedLead[]> {
    return await this.wrapper.query<ExtendedLead[]>(
      async (supabase) => {
          return await supabase
              .from('leads')
              .select(`*, activities(*), counties(*, county_bids(*, users(*,buyer_leads(*), subscriptions(subscription_level_id(*))))), buyer_leads(*)`)
              .is('deleted', null)
              .order('created', { ascending: true })
              .range(offset, offset + limit - 1);
        }
    );
  }

    async countAllLeads(): Promise<number>{
      return await this.wrapper.query<number>(
          async (supabase) => {
              return supabase
                  .from('leads')
                  .select('*', { count: 'exact' })
                  .is('deleted', null);
          }, true)
    }

  async create(body: Partial<Lead>): Promise<Lead> {
    return await this.wrapper.query<Lead>(
        async (supabase) => {
          return supabase
              .from('leads')
              .insert(body)
              .select('*, counties(*, county_bids(*, users(*))),buyer_leads(*)')
              .single();
        }
    );
  }

  async updateLead(leadId: string, body: Partial<Lead>): Promise<Lead> {
    return await this.wrapper.query<Lead>(
        async (supabase) => {
          return supabase
              .from('leads')
              .update(body)
              .eq('id', leadId)
              .select('* ,counties(*, county_bids(*, users(*))),buyer_leads(*)')
              .single();
        }
    );
  }

  async deleteLead(leadId: string): Promise<Lead> {
    return await this.wrapper.query<Lead>(
        async (supabase) => {
          return supabase
              .from('leads')
              .update({ deleted: new Date() })
              .eq('id', leadId)
              .select('*')
              .single();
        }
    );
  }

  async undeleteLead(leadId: string): Promise<Lead> {
    return await this.wrapper.query<Lead>(
        async (supabase) => {
          return supabase
              .from('leads')
              .update({ deleted: null })
              .eq('id', leadId)
              .select('*')
              .single();
        }
    )
  }

    async insertManyLeads(leads: Partial<Lead>[]): Promise<Lead[]> {
      return await this.wrapper.query<Lead[]>(
          async (supabase) => {
              return supabase
                  .from('leads')
                  .insert(leads)
                  .select('*');
          }
      )
    }

    async insertLead(lead: Partial<Lead>): Promise<Lead> {
      return await this.wrapper.query<Lead>(
          async (supabase) => {
              return supabase
                  .from('leads')
                  .insert(lead)
                  .select('*')
                  .single();
          }
      )
    }

    async getAllCounties(): Promise<County[]> {
        return await this.wrapper.query<County[]>(
            async (supabase) => {
                return supabase
                    .from('counties')
                    .select('*')
                    .is('deleted', null);
            }
        )
    }

    async getLeadLabels(user_id: string): Promise<LeadLabel[]> {
      return await this.wrapper.query<LeadLabel[]>(
          async (supabase) => {
            return supabase
                .from('lead_labels')
                .select('*, label_colors(*)')
                .is('deleted', null)
                .eq('user_id', user_id)
          })
    }

    async createLeadLabel(user_id: string, color:string, text:string): Promise<LeadLabel> {
      return await this.wrapper.query<LeadLabel>(
          async (supabase) => {
            return supabase
                .from('lead_labels')
                .insert({
                  user_id,
                  color,
                  text
                })
                .select()
                .single()
          })
    }

    async updateLeadLabel( id: string, data:Partial<LeadLabel>): Promise<LeadLabel> {
        return await this.wrapper.query<LeadLabel>(
            async (supabase) => {
               return supabase
                    .from('lead_labels')
                    .update(data)
                    .match({id})
                    .select()
                    .single()
            })
    }

    async deleteLeadLabel(id: string): Promise<LeadLabel> {
        return await this.wrapper.query<LeadLabel>(
            async (supabase) => {
                return supabase
                    .from('lead_labels')
                    .update({deleted: new Date()})
                    .match({id})
                    .select()
                    .single()
            })
    }

    // a label is assigned to a lead
    async assignLabelToLead( label_id: string, lead_id: string ): Promise<Lead> {
        return await this.wrapper.query<Lead>(
            async (supabase) => {
                return supabase
                    .from('leads')
                    .update({lead_label_id: label_id})
                    .match({id: lead_id})
                    .is('deleted', null)
                    .select()
                    .single()
            })
    }

    async removeLabelFromLead( lead_id: string): Promise<Lead> {
        return await this.wrapper.query<Lead>(
            async (supabase) => {
                return supabase
                    .from('leads')
                    .update({lead_label_id: null})
                    .match({id: lead_id})
                    .is('deleted', null)
                    .select()
                    .single()
            })
    }
    
    async getAllLabelColors(): Promise<LabelColor> {
        return await this.wrapper.query<LabelColor>(
            async (supabase) => {
                return await supabase
                    .from('label_colors')
                    .select('*')
            }
        );
    }

}
