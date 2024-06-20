import { injectable } from "tsyringe";
import { SupabaseWrapper } from '../config/supabaseProvider.ts';
import { Activity } from '../types/activityTypes.ts';

@injectable()
export default class ActivityDAO {

    constructor(private readonly wrapper: SupabaseWrapper) {}

    async getByLeadId(id: string): Promise<Activity[]> {
            return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('activities')
                    .select('* ,users( name, email )')
                    .eq('lead_id', id)
                    .is('deleted', null)
                    .order('created', { ascending: false });
            }
        );
    }

    async create(leadId: string, userId: string, visibility: string, note: string): Promise<Activity> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('activities')
                    .insert([
                        {
                            lead_id: leadId,
                            user_id: userId,
                            visibility,
                            note
                        }
                    ])
                    .select('*')
                    .single();
            }
        );
    }

    async update(id: string, update: Partial<Activity>): Promise<Activity> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('activities')
                    .update({ ...update, modified: new Date()})
                    .match({ id })
                    .select('*')
                    .single();
            }
        );
    }

    async delete(id: string): Promise<Activity> {
        return await this.wrapper.query(
            async (supabase) => {
                return await supabase
                    .from('activities')
                    .update({ deleted: new Date() })
                    .match({ id })
                    .select('*')
                    .single();
            }
        );
    }

}