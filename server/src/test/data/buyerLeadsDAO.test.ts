import { TestDBSetup } from "../db_tests.ts";
import BuyerLeadsDAO from "../../main/data/buyerLeadsDAO.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";

describe('BuyerLeadsDAO', () => {
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());
    let myUserId: string | null;
    const limit = 50
    const offset = 0
    const search = ''
    const counties: string[] = []
    const dateRange = { fromDate: '', toDate: '' }

    const dao = new BuyerLeadsDAO(supabase);

    beforeAll(async () => {
        await setup.loadTestData();
        myUserId = await setup.userId("test1@flavor8.com");
        expect(myUserId).not.toBeNull();
    });

    describe('getAllByBuyerId', () => {
        it('should fetch user BuyerLeads', async () => {
            const resp = await dao.getAllByBuyerId(myUserId!, true, limit, offset, search, counties, dateRange);
            expect(resp).not.toBeNull();
        });

        it('should fetch BuyerLeads limited by offset and limit', async () => {
            const resp = await dao.getAllByBuyerId(myUserId!, true, 2, offset, search, counties, dateRange);
            const resp2 = await dao.getAllByBuyerId(myUserId!, true, 2, 3, search, counties, dateRange);
            expect(resp.length).toBe(2);
            expect(resp2.length).toBe(2);
        });

        it('should fetch BuyerLeads with and without disputes', async () => {
            const resp = await dao.getAllByBuyerId(myUserId!, true, limit, offset, search, counties, dateRange);

            // Check if the response contains at least one buyerLead with non-null disputes
            expect(resp).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    disputes: expect.anything() // 'anything' matcher will match anything except null or undefined
                })
            ]));

            // Check if the response also contains at least one buyerLead with null disputes
            expect(resp).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    disputes: null
                })
            ]));
        });

        it('should fetch BuyerLeads filtering by search (lead name, county, email or address)', async () => {
            const resp = await dao.getAllByBuyerId(myUserId!, true, limit, offset, 'EL', counties, dateRange);
            expect(resp).not.toBeNull();

            const containsSearch = resp.some(buyerLead => {
                if (!buyerLead) return false;
                const { name, county, email, address } = buyerLead.leads
                return [name, county, email, address].some(leadField => leadField!.toLocaleLowerCase().includes('el'));
            });
            expect(containsSearch).toBe(true);
        });
    });

    describe('countUserLeads', () => {
        it('should not be null', async () => {
            const resp = await dao.countAllByBuyerId(myUserId!, true, search, counties, dateRange);
            expect(resp).not.toBeNull();
        });

        it('should count all BuyerLeads', async () => {
            const resp = await dao.countAllByBuyerId(myUserId!, true, search, counties, dateRange);
            const count = resp >= 4;
            expect(count).toBe(true);
        });

        it('should count all BuyerLeads with filtering by search', async () => {
            const resp = await dao.countAllByBuyerId(myUserId!, true, 'Sample Lead06', counties, dateRange);
            expect(resp).toBe(1);
        });
    });

    describe('createBuyerLead', () => {
        it('should check if the new BuyerLead is created in the DB', async () => {
            const buyerLeadData = {
                user_id: myUserId!,
                lead_id: '123e4567-e89a-12d3-b456-226600000314',
                status: 'new',
                price: 100
            };

            const newBuyerLead = await dao.create(buyerLeadData);
            expect(newBuyerLead).not.toBeNull();
            const data = await dao.getAllByBuyerId(myUserId!, true, limit, offset, search, counties, dateRange);
            const buyerLead = data.find(buyerLead => buyerLead!.leads.id === '123e4567-e89a-12d3-b456-226600000314');
            expect(buyerLead).not.toBeNull();
        });

        it('can fetch buyerLead using the id', async () => {
            const data = await dao.getOneByID('123e4567-e89a-12d3-b456-226600000402');
            expect(data).not.toBeNull();
        });

    });

    describe('countAllByBuyerId', () => {
        it('should not be null', async () => {
            const resp = await dao.countAllByBuyerId(myUserId!, true, search, counties, dateRange);
            expect(resp).not.toBeNull();
        });

        it('should count all BuyerLeads', async () => {
            const resp = await dao.countAllByBuyerId(myUserId!, true, search, counties, dateRange);
            const count = resp >= 5;
            expect(count).toBe(true);
        });
    });

    // describe can delete a buyerLead
    describe('deleteBuyerLead', () => {
        it('should delete a buyerLead', async () => {
            // find it first
            const data= await dao.getAllByBuyerId(myUserId!, true, limit, offset, search, counties, dateRange);
            const buyerLead = data.find(buyerLead => buyerLead!.leads.id === '123e4567-e89a-12d3-b456-226600000402');
            expect(buyerLead).not.toBeNull();
            await dao.delete('123e4567-e89a-12d3-b456-226600000402');

            // Check for absence of the buyerLead after deletion
            const data2 = await dao.getAllByBuyerId(myUserId!, true, limit, offset, search, counties, dateRange);
            const buyerLead2 = data2.find(buyerLead => buyerLead!.leads.id === '123e4567-e89a-12d3-b456-226600000402');
            expect(buyerLead2).toBeUndefined();
        });

    });

});
