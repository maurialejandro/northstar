import { TestDBSetup } from "../db_tests.ts";
import DisputesDAO from "../../main/data/disputesDAO.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";

describe('DisputesDAO all tests', () => {
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());
    let myUserId: string | null;

    const limit = 4
    const offset = 0
    const search = ''
    const status: string[] = []
    const dateRange = { fromDate: '', toDate: '' }
    const message = 'test message'
    const reason = 'test reason'

    const dao = new DisputesDAO(supabase, setup.db());

    beforeAll(async () => {

        await setup.loadTestData();
        myUserId = await setup.userId("test1@flavor8.com");
        expect(myUserId).not.toBeNull();
    });

    describe('getAll', () => {

        it('should not be null', async () => {
            const resp = await dao.getAll(limit, offset, search, status, dateRange);
            expect(resp).not.toBeNull();
        });

        it('should fetch disputes limited by offset and limit', async () => {
            const resp = await dao.getAll(2, offset, search, status, dateRange);
            const resp2 = await dao.getAll(2, 4, search, status, dateRange);
            expect(resp.length).toBe(2);
            expect(resp2.length).toBe(2);
        });

        it('should fetch disputes with filtering by search (lead name)', async () => {
            const resp = await dao.getAll(limit, offset, 'Sample Lead05', status, dateRange);
            const containsName = resp[0].buyer_leads.leads.name.includes('Sample Lead05');
            expect(containsName).toBe(true);
        });

        it('should filter by a status or multiple statuses', async () => {
            const resp = await dao.getAll(limit, offset, search, ['Approved'], dateRange);
            const multipleStatusResp = await dao.getAll(limit, offset, search, ['Approved', 'Rejected'], dateRange);
            const allApproved = resp.every(dispute => dispute.status === 'Approved');
            const multipleStatuses = multipleStatusResp.every(dispute => dispute.status === 'Approved' || dispute.status === 'Rejected');
            expect(allApproved).toBe(true);
            expect(multipleStatuses).toBe(true);
        });

        it('should fetch disputes filtered by date', async () => {
            const customDateRange = { fromDate: '2023-03-01', toDate: '2023-04-01' }
            const resp = await dao.getAll(limit, offset, search, status, customDateRange);
            const fromDate = new Date(customDateRange.fromDate);
            const toDate = new Date(customDateRange.toDate);
            const areAllWithinRange = resp.every((item) => {
                const disputeDate = new Date(item.dispute_date);
                return fromDate <= disputeDate && disputeDate <= toDate;
            });
            expect(areAllWithinRange).toBe(true);
        });

        it('should fetch disputes with dates higher than fromDate', async () => {
            const customDateRange = { fromDate: '2023-03-01', toDate: '' }
            const resp = await dao.getAll(limit, offset, search, status, customDateRange);
            const fromDate = new Date(customDateRange.fromDate);
            const areAllWithinRange = resp.every((item) => {
                const disputeDate = new Date(item.dispute_date);
                return fromDate <= disputeDate;
            });
            expect(areAllWithinRange).toBe(true);
        });

        it('should fetch disputes with dates lower than toDate', async () => {
            const customDateRange = { fromDate: '', toDate: '2023-04-01' }
            const resp = await dao.getAll(limit, offset, search, status, customDateRange);
            const toDate = new Date(customDateRange.toDate);
            const areAllWithinRange = resp.every((item) => {
                const disputeDate = new Date(item.dispute_date);
                return disputeDate <= toDate;
            });
            expect(areAllWithinRange).toBe(true);
        });

        it('should fetch disputes with multiple mixed filters', async () => {
            const customDateRange = { fromDate: '2023-03-01', toDate: '' }
            const resp = await dao.getAll(limit, offset, 'ba', ['Pending'], customDateRange);
            const fromDate = new Date(customDateRange.fromDate);
            const areAllWithinRange = resp.every((item) => {
                const disputeDate = new Date(item.dispute_date);
                return disputeDate >= fromDate;
            });
            const containsName = resp.every(e => e.buyer_leads.leads.name.includes('ba'));
            const hasStatus = resp.every(e => e.status === 'Pending');
            expect(areAllWithinRange).toBe(true);
            expect(containsName).toBe(true);
            expect(hasStatus).toBe(true);
        });

    });

    describe('countDisputes', () => {

        it('should not be null', async () => {
            const resp = await dao.countDisputes(search, status, dateRange);
            expect(resp).not.toBeNull();
        });

        it('should count all disputes', async () => {
            const resp = await dao.countDisputes(search, status, dateRange);
            expect(resp).toBeGreaterThanOrEqual(6);
        });

        it('should count all disputes with filtering by search (lead name)', async () => {
            const resp = await dao.countDisputes('Sample Lead05', status, dateRange);
            expect(resp).toBe(1);
        });

    });

    describe('delete', () => {

        it('should delete a dispute, and it should not be gettable by getAll', async () => {
            const deleteResp = await dao.delete('123e4567-e89a-12d3-b456-226600000601');
            expect(deleteResp).not.toBeNull();
            const getResp = await dao.getAll(50, offset, search, status, dateRange);
            const deletedDispute = getResp.find(e => e.id === '123e4567-e89a-12d3-b456-226600000601');
            expect(deletedDispute).toBeUndefined();
        });

    });

    describe('checkStatusById', () => {

        it('should return a dispute', async () => {
            const resp = await dao.getDisputeById('123e4567-e89a-12d3-b456-226600000601');
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

    describe('can query dispute rate', () => {

        it('will find dispute rate for buyer with disputes', async() => {
            const rate = await dao.getDisputeRate(myUserId!);
            expect(rate).toEqual({"dispute_rate": 0.3})
        });

        it('will find 0 for buyer with no disputes', async() => {
            const disputes = await dao.getAll(100, 0, search, status, dateRange);
            const filtered = disputes.filter((it) => {
              return it.buyer_leads.user_id === myUserId!;
            });

            expect(filtered.length).toBe(4);

            for (const dispute of filtered) {
                await dao.delete(dispute.id);
            }

            const rate = await dao.getDisputeRate(myUserId!);
            expect(rate.dispute_rate).toBe(0)
        });
    })
  
  describe('average dispute rate', () => {
        it('first average dispute rate', async() => {
            const disputes = await dao.getCalculatedAverageDisputeRate();

            expect(disputes)
            .toEqual({
            "average_dispute": 0.167,
            "dispute_count" : "4",
            "lead_count" : "24"
            });
            
        });

        it('create new dispute and calculate avarege', async() => {
            await dao.create("123e4567-e89a-12d3-b456-226600000403", message , reason);
            const disputes = await dao.getCalculatedAverageDisputeRate();
            
            expect(disputes)
            .toEqual({
                "average_dispute": 0.208,
                "dispute_count" : "5",
                "lead_count" : "24"
            });
            
        });
    })

    async function errorTest(): Promise<null> {
        const wrapper = new SupabaseWrapper(setup.supabase());
        return await wrapper.query<null>(
            async (supabase) =>
                supabase.from('disputes')
                    .select('*')
                    .eq('nonExistentField', 'error'));
    }
});
