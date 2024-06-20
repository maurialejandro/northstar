import { ApiTests, Method, UserLevel } from "../resource_tests.ts";
import { Dispute } from "../../main/types/disputesTypes.ts";

const apiTests = new ApiTests();
const dispute = { buyer_lead_id: "123e4567-e89a-12d3-b456-226600000409" };

describe("/api/disputes/admin is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    // buyers cannot access admin disputes
    apiTests.testAuth("/api/disputes/admin", true, Method.GET);
});

describe("can supply params", () => {
    // TODO this test is insufficient. check the responses!
    const limit = 4
    const page = 1
    const search = ''
    const status: string[] = []
    const dateRange = ['', '']

    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    it("works when auth is supplied and without query params", async () => {
        const response = await apiTests.callApi("/api/disputes/admin", Method.GET, UserLevel.ADMIN);
        expect(response.status).toBe(200);
    })

    it("works when params are supplied", async () => {
        const response = await apiTests.callApi(
            `/api/disputes/admin?limit=${limit}&page=${page}&search=${search}&status=${status}&dateRange=${dateRange}`,
            Method.GET, UserLevel.ADMIN);
        expect(response.status).toBe(200);
    })
})

describe("creating dispute is protected by auth", () => {
    beforeEach(async () => {
        await apiTests.loadTestData();
    })

    it("works only for buyers who own lead", async () => {
        // admins cannot create disputes
        const response1 = await apiTests.callApi("/api/disputes/create", Method.POST, UserLevel.ADMIN, dispute);
        expect(response1.status).toBe(403)

        // buyers can create disputes
        const response2 = await apiTests.callApi("/api/disputes/create", Method.POST, UserLevel.USER, dispute);
        expect(response2.status).toBe(200);

        // buyers cannot create disputes for buyerLeads they do not own
        const otherBuyerDispute = { buyer_lead_id: "123e4567-e89a-12d3-b456-226600000403" }
        const response3 = await apiTests.callApi("/api/disputes/create", Method.POST, UserLevel.USER, otherBuyerDispute);
        expect(response3.status).toBe(403);

        // anonymous cannot create disputes
        const response4 = await apiTests.callApi("/api/disputes/create", Method.POST, UserLevel.ANON, dispute);
        expect(response4.status).toBe(401);

    })

})

describe("lifecycle of disputes", () => {
    beforeEach(async () => {
        await apiTests.loadTestData();
    })

    it("can create then deny a dispute", async () => {
        // create the dispute
        const response1 = await apiTests.callApi("/api/disputes/create", Method.POST, UserLevel.USER, dispute);

        expect(response1.status).toBe(200);
        const createdDispute: Dispute = response1.body;
        expect(createdDispute.id).not.toBeNull();
        expect(createdDispute.status).toBe("Pending");

        const response2 = await apiTests.callApi("/api/disputes/admin/deny", Method.PUT, UserLevel.ANON, { id: createdDispute.id });
        // unauthenticated cannot deny a dispute
        expect(response2.status).toBe(401);

        const response3 = await apiTests.callApi("/api/disputes/admin/deny", Method.PUT, UserLevel.USER, { id: createdDispute.id });
        // buyers cannot deny a dispute 
        expect(response3.status).toBe(403);

        const response4 = await apiTests.callApi("/api/disputes/admin/deny", Method.PUT, UserLevel.ADMIN, { id: createdDispute.id });
        // admins CAN deny a dispute
        expect(response4.status).toBe(200);

        const response5 = await apiTests.callApi("/api/disputes/admin/deny", Method.PUT, UserLevel.ADMIN, { id: createdDispute.id });
        // cannot deny an already denied dispute
        expect(response5.status).toBe(406);

        const response6 = await apiTests.callApi("/api/disputes/admin", Method.GET, UserLevel.ADMIN);
        const disputes: Dispute[] = response6.body.data;
        const theDispute: Dispute[] = disputes.filter((dispute) => dispute.id === createdDispute.id);
        expect(theDispute.length).toBe(1);
        expect(theDispute[0].status).toBe("Rejected");
    })

    it("can create then approve a dispute", async () => {
        // create the dispute
        const response1 = await apiTests.callApi("/api/disputes/create", Method.POST, UserLevel.USER, dispute);
        expect(response1.status).toBe(200);
        const createdDispute: Dispute = response1.body;
        expect(createdDispute.id).not.toBeNull();
        expect(createdDispute.status).toBe("Pending");

        const response2 = await apiTests.callApi("/api/disputes/admin/approve", Method.PUT, UserLevel.ANON, { id: createdDispute.id, buyer_lead_id: "6b89a235-24e1-4bfc-a995-7c8e4e8a1b02" });
        // unauthenticated cannot approve a dispute
        expect(response2.status).toBe(401);

        const response3 = await apiTests.callApi("/api/disputes/admin/approve", Method.PUT, UserLevel.USER, { id: createdDispute.id, buyer_lead_id: "6b89a235-24e1-4bfc-a995-7c8e4e8a1b02" });
        // buyers cannot approve a dispute 
        expect(response3.status).toBe(403);

        const response4 = await apiTests.callApi("/api/disputes/admin/approve", Method.PUT, UserLevel.ADMIN, { id: createdDispute.id, buyer_lead_id: "6b89a235-24e1-4bfc-a995-7c8e4e8a1b02" });
        // admins CAN approve a dispute
        expect(response4.status).toBe(200);

        const response5 = await apiTests.callApi("/api/disputes/admin/approve", Method.PUT, UserLevel.ADMIN, { id: createdDispute.id, buyer_lead_id: "6b89a235-24e1-4bfc-a995-7c8e4e8a1b02" });
        // cannot approve an already approved dispute
        expect(response5.status).toBe(406);

        const response6 = await apiTests.callApi("/api/disputes/admin", Method.GET, UserLevel.ADMIN);
        const disputes: Dispute[] = response6.body.data;
        const theDispute: Dispute[] = disputes.filter((dispute) => dispute.id === createdDispute.id);
        expect(theDispute.length).toBe(1);
        expect(theDispute[0].status).toBe("Approved");
    })

    it("can create and delete a dispute", async () => {
        // create the dispute
        const response1 = await apiTests.callApi("/api/disputes/create", Method.POST, UserLevel.USER, dispute);
        expect(response1.status).toBe(200);
        const createdDispute: Dispute = response1.body;
        expect(createdDispute.id).not.toBeNull();
        expect(createdDispute.status).toBe("Pending");

        const response2 = await apiTests.callApi(`/api/disputes/admin/delete/${createdDispute.id}`, Method.DELETE, UserLevel.ANON);
        // unauthenticated cannot delete a dispute
        expect(response2.status).toBe(401);

        const response3 = await apiTests.callApi(`/api/disputes/admin/delete/${createdDispute.id}`, Method.DELETE, UserLevel.USER);
        // buyers cannot delete a dispute
        expect(response3.status).toBe(403);

        const response4 = await apiTests.callApi(`/api/disputes/admin/delete/${createdDispute.id}`, Method.DELETE, UserLevel.ADMIN);
        // admins CAN delete a dispute
        expect(response4.status).toBe(200);

        const response5 = await apiTests.callApi(`/api/disputes/admin/delete/${createdDispute.id}`, Method.DELETE, UserLevel.ADMIN);
        // admins CANNOT delete an already deleted dispute
        expect(response5.status).toBe(406);

        const response6 = await apiTests.callApi("/api/disputes/admin", Method.GET, UserLevel.ADMIN);
        const disputes: Dispute[] = response6.body.data;
        const theDispute: Dispute[] = disputes.filter((dispute) => dispute.id === createdDispute.id);
        expect(theDispute.length).toBe(0);
    })
});
