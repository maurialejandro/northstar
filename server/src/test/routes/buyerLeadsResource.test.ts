import { ApiTests, Method, UserLevel } from "../resource_tests.ts";
import { BuyerLead } from "../../main/types/buyerLeadsTypes.ts";

const apiTests = new ApiTests();

// TODO move this to test.sql
// data from seed.sql
const johnBuyerID = "123e4567-e89a-12d3-b456-226600000201";
const zequiBuyerID = "123e4567-e89a-12d3-b456-226600000203";
const lead1 = "123e4567-e89a-12d3-b456-226600000301";
const lead2 = '123e4567-e89a-12d3-b456-226600000302';

describe("get all buyerLeads protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    // buyers cannot get all buyerLeads
    apiTests.testAuth("/api/buyer_leads/admin", true, Method.GET);
});

describe("can supply params", () => {
    // TODO this test is insufficient. check the responses!
    const limit = 4
    const page = 1

    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    it("works when auth is supplied and without query params", async () => {
        const response = await apiTests.callApi("/api/buyer_leads/admin", Method.GET, UserLevel.ADMIN);
        expect(response.status).toBe(200);
    })

    it("works when params are supplied", async () => {
        const response = await apiTests.callApi(
            `/api/buyer_leads/admin?limit=${limit}&page=${page}`,
            Method.GET, UserLevel.ADMIN);
        expect(response.status).toBe(200);
    })
})

describe("buyer_lead create and assign", () => {

    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    it("can creates buyerLead then fetch it from DB", async () => {
        const buyerLead = { user_id: johnBuyerID, lead_id: lead1, status: "new", price: 100 }
        // create the buyerLead
        const response1 = await apiTests.callApi("/api/buyer_leads/admin/create", Method.POST, UserLevel.ADMIN, buyerLead);
        expect(response1.status).toBe(200);
        // check that the buyerLead was created with the correct data
        const createdBuyerLead = response1.body;
        expect(createdBuyerLead.user_id).toBe(buyerLead.user_id);
        expect(createdBuyerLead.lead_id).toBe(buyerLead.lead_id);

        // check that the buyerLead is in the DB
        const buyerLeadID = createdBuyerLead.id
        const response2 = await apiTests.callApi(`/api/buyer_leads/admin/get-by-id?buyer_lead_id=${buyerLeadID}`, Method.GET, UserLevel.ADMIN);
        expect(response2.status).toBe(200);

        // get all buyer leads, then filter them to find the one we just created
        const response3 = await apiTests.callApi("/api/buyer_leads/admin", Method.GET, UserLevel.ADMIN);
        const buyerLeadFromDb = response3.body.data.filter((buyerLead: BuyerLead) => buyerLead.id === createdBuyerLead.id);
        expect(buyerLeadFromDb.length).toBe(1);

    })

    it("can create buyerLead assigned to buyer b, then as buyer c can not find it", async () => {
        const buyerLead01 = { user_id: zequiBuyerID, lead_id: lead2, status: "new", price: 100 }
        // create the buyerLead
        const newBuyerLead01 = await apiTests.callApi("/api/buyer_leads/admin/create", Method.POST, UserLevel.ADMIN, buyerLead01);
        expect(newBuyerLead01.status).toBe(200);

        // TODO should this return a 404? so even if you have the buyerLeadID you can't find it?
        // check that the buyerLead is in the DB
        const createdBuyerLead01 = newBuyerLead01.body;
        // get the buyerLead by id as buyer c
        const newBuyerLead01FromDB = await apiTests.callApi(`/api/buyer_leads/${createdBuyerLead01.id}`, Method.GET, UserLevel.USER);
        expect(newBuyerLead01FromDB.status).toBe(200);

        const fiveMinutesAgo = new Date()
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

        // create a buyerLead for buyer c
        const buyerLead02 = { user_id: johnBuyerID, lead_id: lead2, status: "new", price: 100, sent_date: fiveMinutesAgo, buyer_confirmed: true }

        // create the buyerLead
        const newBuyerLead02 = await apiTests.callApi("/api/buyer_leads/admin/create", Method.POST, UserLevel.ADMIN, buyerLead02);
        expect(newBuyerLead02.status).toBe(200);

        // get the newBuyerLead02 by id as buyer c
        const createdBuyerLead02 = newBuyerLead02.body;
        const newBuyerLead02FromDB = await apiTests.callApi(`/api/buyer_leads/${createdBuyerLead02.id}`, Method.GET, UserLevel.USER);
        expect(newBuyerLead02FromDB.status).toBe(200);

        // get all buyerLeads as buyer c
        const allJohnsBuyerLeadsResponse = await apiTests.callApi("/api/buyer_leads/", Method.GET, UserLevel.USER);
        expect(allJohnsBuyerLeadsResponse.status).toBe(200);

        // filter the buyerLeads to find the one we just created for buyer c
        const allJohnsBuyerLeads = allJohnsBuyerLeadsResponse.body.data;
        const buyerLeadFromDb2 = allJohnsBuyerLeads.filter((buyerLead: BuyerLead) => buyerLead.id === createdBuyerLead02.id);
        expect(buyerLeadFromDb2.length).toBe(1);

    })

    // it can get all buyerleads for buyer b using the id
    it('can get all buyerleads for buyer b using the id', async () => {
        const response = await apiTests.callApi(`/api/buyer_leads/buyer/admin/${zequiBuyerID}`, Method.GET, UserLevel.ADMIN);
        expect(response.status).toBe(200);
    });

})