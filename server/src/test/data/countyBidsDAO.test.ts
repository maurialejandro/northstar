import { TestDBSetup } from "../db_tests.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import CountyBidsDAO from "../../main/data/countyBidsDAO.ts";

describe('CountyBids tests', () => {
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());

    const limit = 4 // limit in 50 for get all data tests
    const offset = 0
    const search = ''
    const counties: string[] = []
    const countyId = '123e4567-e89a-12d3-b456-226600001107';
    const countyBidId = 'bdf1b482-79aa-11ee-b962-0242ac120002';
    const userBuyerId = '123e4567-e89a-12d3-b456-226600000201';
    const userAdminId = '123e4567-e89a-12d3-b456-226600000200';
    const dao = new CountyBidsDAO(supabase);

    describe('county workflow', () => {

        beforeAll(async () => {
            await setup.loadTestData();
        });

        test('should create/update/delete/read/filter countyBids', async () => {

            const createCountyBids = await dao.create(userBuyerId, countyId, 5566);
            expect(createCountyBids.bid_amount).toBe(5566);
            const getAllCountyBids = await dao.getAll(20, offset, '', counties);
            // Contain created county bid
            expect(getAllCountyBids[0].bid_amount).toEqual(createCountyBids.bid_amount);
            
            // Check if admin can create county bids
            try {
              await dao.create(userAdminId, countyBidId, 6000); 
            } catch (error) {
              expect((error as Error).message).toEqual('Supabase error: insert or update on table "county_bids" violates foreign key constraint "county_bids_county_id_fkey"')
            }

            // Update with the same id countyBid created
            const updateCounty = await dao.update(createCountyBids.id, {bid_amount: 4000});
            // Checking if update incorrect UUID
            try {
                await dao.update(createCountyBids.id, { user_id: '123456789' });
            } catch (e) {
                expect((e as Error).message).toEqual('Supabase error: invalid input syntax for type uuid: "123456789"')
            }

            // Checking if a user who is not in the DB can update
            const uuid = 'a8994296-797b-11ee-b962-0242ac120002';
            try {
               await dao.update(createCountyBids.id, { user_id: uuid });
            } catch (e) {
                expect((e as Error).message).toBe('Supabase error: insert or update on table "county_bids" violates foreign key constraint "budgets_user_id_fkey"')
            }

            expect(updateCounty.bid_amount).toBe(4000);
            const getAllCountyBids2 = await dao.getAll(limit, offset, '', counties);
            // the first element of array should content update data
            expect(getAllCountyBids2[0].bid_amount).toEqual(4000);

            // Delete countyBid created
            const deleteCountyBid = await dao.delete(createCountyBids.id);
            expect(deleteCountyBid.id).toBe(createCountyBids.id); // TODO remove all try catch. Use expect().rejects.toThrow()
            try {
                await dao.getCountyById(deleteCountyBid.id);
            } catch (error) {
                expect((error as Error).message).toEqual('Supabase error: JSON object requested, multiple (or no) rows returned');
            }

            // TODO fetch all bids again and the deleted one should not be there

            // Get all county bids with search
            const getAllCountyBids4 = await dao.getAll(10, offset, 'El Paso', counties); // Limit in 10 to check get 2 data with 'El Paso'
            getAllCountyBids4.map((countyBids) => expect(countyBids.counties!.name).toBe('El Paso'));
            // Get all county with county  filter
            const getAllcountyBids6 = await dao.getAll(10, offset, '', ['El Paso']);// Limit in 10 to check get 2 data with 'El Paso'
            getAllcountyBids6.map((countyBid) => expect(countyBid.counties!.name).toBe('El Paso'))

            // Get all county with county & limit filter
            const getAllCountyBidsFilter = await dao.getAll(1, offset, '', ['El Paso']);
            expect(getAllCountyBidsFilter.length).toBe(1);
            expect(getAllCountyBidsFilter[0].counties!.name).toBe('El Paso')

            // Bulkdelete county bids
            const getAllCountyBids7 = await dao.getAll(50,offset,'', counties);
            expect(getAllCountyBids7.length).toBe(14);
            const bulkDeleteCountyBids = await dao.bulkDelete([getAllCountyBids7[0].id, getAllCountyBids7[1].id]);

            // Should create a catch error
            try {
                await dao.getCountyById(bulkDeleteCountyBids[0].id);
            } catch (error) {
                expect((error as Error).message).toEqual('Supabase error: JSON object requested, multiple (or no) rows returned');
            }
            try {
                await dao.getCountyById(bulkDeleteCountyBids[1].id);
            } catch (e) {
                expect((e as Error).message).toEqual('Supabase error: JSON object requested, multiple (or no) rows returned');
            }

            // Undelete county bids
            const undeleteCountyBids = await dao.unDelete(getAllCountyBids7[0].id);
            expect(undeleteCountyBids).not.toBeNull();
            const undeleteCountyBids2 = await dao.unDelete(getAllCountyBids7[1].id);
            expect(undeleteCountyBids2).not.toBeNull();
            const getCountyById = await dao.getCountyById(undeleteCountyBids.id);
            expect(getCountyById.id).toEqual(undeleteCountyBids.id);
        });
    });

    describe('getCounty', () => {
        it('should get county bids by county & buyer', async () => {
            // Get county bids by buyer
            const getCountyBidsByBuyer = await dao.getByBuyer(userBuyerId);
            expect(getCountyBidsByBuyer[0].user_id).toContain(userBuyerId);

            // Get county bids by county
            const getCountyByCounty = await dao.getByCounty(countyId);
            // Miami-Dade is the name of the county id
            expect(getCountyByCounty[0].counties!.name).toMatch('Miami-Dade');
        });
    });

    describe('getAllStates', () => {
        it('should get all state', async () => {

            // Get all state
            const getAllState = await dao.getAllStates();
            expect(getAllState).not.toBeNull();
            // Total data => 5
            expect(getAllState.length).toBe(5);
        });
    });

    describe('getCountyByState', () => {
        it('should get by states', async () => {

            // Get county by state
            const getCountyByState = await dao.getCountiesByState('FL');
            // There should be 2 with state "FL"
            expect(getCountyByState.length).toBe(3);
            expect(getCountyByState[0].state).toContain('FL');
        });
    });

    describe('getAllCounties', () => {
        it('should get all counties', async () => {

            const getAllCounties = await dao.getAllCounties();
            expect(getAllCounties).not.toBeNull();
            // Total data -> 7
            expect(getAllCounties.length).toBe(7);
        });
    });

    describe('getAll', () => {

        it('should not be null', async () => {
            const resp = await dao.getAll(limit, offset, search, counties);
            expect(resp).not.toBeNull();
        });

        it('should fetch county bids limited by offset and limit', async () => {
            const resp = await dao.getAll(2, offset, search, counties);
            const resp2 = await dao.getAll(2, 4, search, counties);
            expect(resp.length).toBe(2);
            expect(resp2.length).toBe(2);
        });

    });

    describe('countCountyBids', () => {

        it('should not be null', async () => {
            const resp = await dao.countCountyBids(search, counties);
            expect(resp).not.toBeNull();
        });

        it('should count all CountyBids', async () => {
            const resp = await dao.countCountyBids(search, counties);
            expect(resp).toBeGreaterThanOrEqual(6);
        });

        it('should count all CountyBids with filtering by search (county name)', async () => {
            const resp = await dao.countCountyBids('el paso', counties);
            expect(resp).toBe(6);
        });

    });

    describe('countyBidsById, get counties bids by county_id', () => {

        it('should not be null', async () => {
            const resp = await dao.countyBidsById(countyId);
            expect(resp).not.toBeNull();
        });

    });

    test('error test', async () => {

        const setup = new TestDBSetup();
        await setup.loadTestData();

        await expect(async () => {
            await errorTest();
        }).rejects.toThrow();
    });

    async function errorTest(): Promise<null> {
        const wrapper = new SupabaseWrapper(setup.supabase());
        return await wrapper.query<null>(
            async (supabase) =>
                supabase.from('disputes')
                    .select('*')
                    .eq('nonExistentField', 'error'));
    }
});