import { TestDBSetup } from "../db_tests.ts";
import BuyerDAO from "../../main/data/buyerDAO.ts";
import { Buyer } from "../../main/types/buyerTypes.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import BuyerLeadsDAO from "../../main/data/buyerLeadsDAO.ts";

describe('test BuyerDAO', () => {
    const setup = new TestDBSetup();
    const dao = new BuyerDAO(setup.db());
    const buyerLeadsDao = new BuyerLeadsDAO(new SupabaseWrapper(setup.supabase()));

    beforeAll(async () => {
        await setup.loadTestData();
    });

    test('exactly one user with the specified id', async () => {
        const myUserId = await setup.userId("test1@flavor8.com");
        const buyer: Buyer = (await dao.getBuyerById(myUserId!))!;
        expect(buyer.auth).toBe("123e4567-e89a-12d3-b456-226600000101");
        expect(buyer.id).toBe("123e4567-e89a-12d3-b456-226600000201");
        expect(buyer.email).toBe("test1@flavor8.com");
        expect(buyer.name).toBe("John Buyer");
    });

    test('can get multiple users', async () => {
        const buyers: Buyer[] = await dao.getBuyersById([
            "123e4567-e89a-12d3-b456-226600000201",
            "123e4567-e89a-12d3-b456-226600000200",
            "123e4567-e89a-12d3-b456-226600000203"]);
        // does not get admins
        expect(buyers).toHaveLength(2);
        expect(buyers[0]).toHaveProperty("id","123e4567-e89a-12d3-b456-226600000201");
        expect(buyers[1]).toHaveProperty("id", "123e4567-e89a-12d3-b456-226600000203");
    });

    test('can get all buyers', async() => {
        const buyers: Buyer[] = await dao.getBuyers();
        // does not get admins
        expect(buyers).toHaveLength(5);
        expect(buyers[0]).toHaveProperty("id","123e4567-e89a-12d3-b456-226600000201");
        expect(buyers[1]).toHaveProperty("id", "123e4567-e89a-12d3-b456-226600000203");
    })

    test('can get uncharged leads', async () => {
        const myUserId = await setup.userId("test1@flavor8.com");
        const buyer: Buyer = (await dao.getBuyerById(myUserId!))!;
        const buyerId = buyer.id;
        const leads = await dao.getUnchargedAssignedLeads(buyerId);
        expect(leads[0]).toHaveProperty('user_id', buyerId);
        expect(leads[0]).toHaveProperty('id', '123e4567-e89a-12d3-b456-226600000427');
        expect(leads[1]).toHaveProperty('id', '123e4567-e89a-12d3-b456-226600000407');
        expect(leads[2]).toHaveProperty('id', '123e4567-e89a-12d3-b456-226600000406');
        expect(leads).toHaveLength(3);
        const limit = 50
        const offset = 0
        const search = ''
        const counties: string[] = []
        const dateRange = { fromDate: '', toDate: '' }

        const allOfThisUserBuyerLeads = await buyerLeadsDao.getAllByBuyerId(myUserId!, true, limit, offset, search, counties, dateRange);
        // expect allOfThisUserBuyerLeads to include the leads ids returned by getUnchargedAssignedLeads
        expect(allOfThisUserBuyerLeads).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: leads[0].id, user_id: buyerId }),
            expect.objectContaining({ id: leads[1].id, user_id: buyerId }),
            expect.objectContaining({ id: leads[2].id, user_id: buyerId })
        ]));
        expect(allOfThisUserBuyerLeads).toHaveLength(10);
        // expect all of allOfThisUserBuyerLeads leads to have user_id = buyerId
        allOfThisUserBuyerLeads.forEach((buyerLead) => {
            expect(buyerLead!.user_id).toBe(buyerId);
        })
    })

    test('can get uncharged leads 2', async () => {
        const otherBuyerId = '123e4567-e89a-12d3-b456-226600000203'
        const leads = await dao.getUnchargedAssignedLeads(otherBuyerId);
        expect(leads).toHaveLength(2);
        expect(leads[0]).toHaveProperty("user_id", otherBuyerId);
    })

    test('can get uncharged leads 3', async () => {
        const adminWithNoLeads = '123e4567-e89a-12d3-b456-226600000200'
        const leads = await dao.getUnchargedAssignedLeads(adminWithNoLeads);
        expect(leads).toHaveLength(0);
    })
    
})