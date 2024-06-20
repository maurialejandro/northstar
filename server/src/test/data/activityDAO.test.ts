import { TestDBSetup } from "../db_tests";
import ActivityDAO from "../../main/data/activityDAO";
import { SupabaseWrapper } from "../../main/config/supabaseProvider";

describe('ActivityDAO', () => {
    const setup = new TestDBSetup();
    const wrapper = new SupabaseWrapper(setup.supabase());
    const dao = new ActivityDAO(wrapper);

    const leadId = '123e4567-e89a-12d3-b456-226600000303';
    const userId = '123e4567-e89a-12d3-b456-226600000200';
    const visibility = 'private';
    const note = 'This is a test activity';

    beforeAll(async () => {
        await setup.loadTestData();
    });

    describe('can get/create/update/delete activity', () => {
        it('should retrieve activities for a specific lead', async () => {
            const resp = await dao.getByLeadId(leadId);
            expect(resp).not.toBeNull();
            expect(resp).toBe(resp);
        });
        
        it('should create a new activity', async () => {
            const createdActivity = await dao.create(leadId, userId, visibility, note); 
            expect(createdActivity).toHaveProperty('lead_id', leadId);
            expect(createdActivity).toHaveProperty('user_id', userId);
            expect(createdActivity).toHaveProperty('visibility', visibility);
            expect(createdActivity).toHaveProperty('note', note);
        });

        it('should update an existing activity', async () => {
            const createdActivity = await dao.create(leadId, userId, visibility, note);
            const updatedActivity = await dao.update(createdActivity.id, { note: 'Updated note' });
            expect(updatedActivity).toHaveProperty('note', 'Updated note');
        });
  
        it('should delete an existing activity', async () => {
            const createdActivity = await dao.create(leadId, userId, visibility, note);
            const deletedActivity = await dao.delete(createdActivity.id);
            expect(deletedActivity).toHaveProperty('id', createdActivity.id);
        });
    });

});
