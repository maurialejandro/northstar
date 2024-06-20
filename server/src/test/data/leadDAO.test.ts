import { TestDBSetup } from "../db_tests";
import LeadsDAO from "../../main/data/leadDAO";
import { SupabaseWrapper } from "../../main/config/supabaseProvider";

describe('LeadsDAO', () => {
    const setup = new TestDBSetup();
    const wrapper = new SupabaseWrapper(setup.supabase());

    const limit = 50
    const offset = 0
    const dao = new LeadsDAO(wrapper);

    const newLead = {
        name: 'John Smith',
        email: 'john@1234.com',
        phone: '1234567890',
        address: '1234 Main St',
        city: 'El Paso',
        state: 'TX',
        zip_code: '79936',
        county: 'EL PASO',
        created: new Date(),
        modified: new Date(),
    };

    const johnUserId = '123e4567-e89a-12d3-b456-226600000201'

    describe('Leads DAO Workflow', () => {

        beforeAll(async () => {
            await setup.loadTestData();
        });

        it('shoud count leads', async () => {

            const countLeads = await dao.countAllLeads();
            // Total lead in seed = 21
            expect(countLeads).toBe(28);
            // the filter it in 50 to get all leads to check amount of leads
            const getAllLead = await dao.getAllLeads(50, offset);
            expect(getAllLead.length).toBe(countLeads);
        });

        it('should create/update/delete/undelete/read leads', async () => {

            const createLead = await dao.create(newLead);
            expect(createLead.phone).toEqual('1234567890');
            const allLeads = await dao.getAllLeads(limit, offset);
            // Total leads in test is 21, if 22 checked that created new lead
            expect(allLeads.length).toBe(29);
            // Check if all properties are present and correct
            const getLeadByIdToCheck = await dao.getLeadById(createLead.id);
            expect(getLeadByIdToCheck.id).toEqual(createLead.id);
            expect({...createLead}).toStrictEqual(getLeadByIdToCheck);

            const updateCreatedLead = await dao.updateLead(createLead.id, { phone: '1111111111' })
            expect(updateCreatedLead.phone).toBe('1111111111');
            const checkUpdatedLead = await dao.getLeadById(updateCreatedLead.id);
            expect(checkUpdatedLead.id).toEqual(createLead.id);
            expect({...updateCreatedLead}).toStrictEqual(checkUpdatedLead);

            const deleteLeadCreated = await dao.deleteLead(createLead.id);
            expect(deleteLeadCreated.name).toBe('John Smith');
            expect(deleteLeadCreated.id).toEqual(createLead.id);

            // Undelete deleted lead
            const undeleteLead = await dao.undeleteLead(deleteLeadCreated.id);
            expect(undeleteLead.deleted).toBeNull();
            expect(undeleteLead.id).toEqual(createLead.id);
            const getLeadById2 = await dao.getLeadById(undeleteLead.id);
            expect(getLeadById2.deleted).toBeNull();
            expect(getLeadById2.id).toEqual(createLead.id);
            const lead = await dao.getLeadById(undeleteLead.id);
            expect(lead.deleted).toBeNull();
        });

    });

    describe('Labels DAO Workflow', ()=>{

        it('should create read update & delete labels', async () => {
            // creates a label
            const createdLabel = await dao.createLeadLabel(johnUserId, '123e4567-e89a-12d3-b456-226600001004', 'test-label');
            expect(createdLabel.text).toBe('test-label');
            // gets all labels
            const fetchedLabels = await dao.getLeadLabels(johnUserId);
            expect(fetchedLabels).not.toBeNull();
            // created label is in the list
            const containsCreatedLabel = fetchedLabels?.some((label) => label.text === 'test-label');
            expect(containsCreatedLabel).toBe(true)
            // updates a label
            const updatedLabel = await dao.updateLeadLabel( createdLabel.id, {text:'updated-text'});
            expect(updatedLabel.text).toBe('updated-text');
            // deletes a label
            const deletedLabel = await dao.deleteLeadLabel(createdLabel.id);
            expect(deletedLabel.deleted).not.toBe(null);
            // gets all labels after delete and the deleted one is not in the list
            const fetchedLabelsAfterDelete = await dao.getLeadLabels(johnUserId);
            const containsDeletedLabel = fetchedLabelsAfterDelete?.some((label) => label.text === 'updated-text');
            expect(containsDeletedLabel).toBe(false);
        });

        // TODO 'should not allow users to delete labels that are in use'

        it('should assign & remove labels from a lead', async () => {
            // creates a label
            const createdLabel = await dao.createLeadLabel(johnUserId, '123e4567-e89a-12d3-b456-226600001004', 'test-label');
            expect(createdLabel.text).toBe('test-label');
            const leadIdFromSeeder = '123e4567-e89a-12d3-b456-226600000305'
            // assigns a label to a lead
            const assignedLabel = await dao.assignLabelToLead(createdLabel.id ,leadIdFromSeeder);
            expect(assignedLabel.lead_label_id).toBe(createdLabel.id);
            // removes a label from a lead
            const removedLabel = await dao.removeLabelFromLead(leadIdFromSeeder);
            expect(removedLabel.lead_label_id).toBe(null);
        })
    });

    describe('getAllLabelColors', () => {
        it('should fetch user BuyerLeads', async () => {
            const resp = await dao.getAllLabelColors();
            expect(resp).not.toBeNull();
        });
    });
});
