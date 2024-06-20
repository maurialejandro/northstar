import { ApiTests, Method, UserLevel } from "../resource_tests.ts";
import { LeadLabel } from "../../main/types/leadTypes.ts";

const apiTests = new ApiTests();
const label = { color: "123e4567-e89a-12d3-b456-226600001011", text: "test label" };
describe("/api/leads is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })
    apiTests.testAuth("/api/leads/labels", false, Method.GET);
});

describe("creating label is protected by auth", () => {
    beforeEach(async () => {
        await apiTests.loadTestData();
    })

    it("works only for users who own the lead Label", async () => {
        // admins can create labels
        const response1 = await apiTests.callApi("/api/leads/create/label", Method.POST, UserLevel.ADMIN, label);
        expect(response1.status).toBe(200);

        // buyers can create labels
        const response2 = await apiTests.callApi("/api/leads/create/label", Method.POST, UserLevel.USER, label);
        expect(response2.status).toBe(200);

        // anonymous cannot create labels
        const response4 = await apiTests.callApi("/api/leads/create/label", Method.POST, UserLevel.ANON, label);
        expect(response4.status).toBe(401);
    })

})

describe("lifecycle of labels", () => {
    beforeEach(async () => {
        await apiTests.loadTestData();
    })

    it("buyer can create, read, update & delete a label", async () => {
        // buyer can create a label
        const response1 = await apiTests.callApi("/api/leads/create/label", Method.POST, UserLevel.USER, label);
        expect(response1.status).toBe(200);
        const createdLabel: LeadLabel = response1.body;
        expect(createdLabel.id).not.toBeNull();
        // buyer can update a label
        const response2 = await apiTests.callApi("/api/leads/update/label", Method.PUT, UserLevel.USER, { id: createdLabel.id, text: "updated buyer label" });
        expect(response2.status).toBe(200);
        expect(response2.body.text).toBe("updated buyer label");
        // buyer can only read his labels
        const response4 = await apiTests.callApi("/api/leads/labels", Method.GET, UserLevel.USER);
        const labels: LeadLabel[] = response4.body;
        const userOnlyLabels = labels.every((label) => label.user_id === '123e4567-e89a-12d3-b456-226600000201');
        expect(userOnlyLabels).toBe(true);
        //  admin can only read his labels
        const response5 = await apiTests.callApi("/api/leads/labels", Method.GET, UserLevel.ADMIN);
        const adminLabels: LeadLabel[] = response5.body;
        const adminOnlyLabels = adminLabels.every((label) => label.user_id === '123e4567-e89a-12d3-b456-226600000200');
        expect(adminOnlyLabels).toBe(true);
        // buyer can delete a label
        const response3 = await apiTests.callApi("/api/leads/label/" + createdLabel.id, Method.DELETE, UserLevel.USER);
        expect(response3.status).toBe(200);
        expect(response3.body.deleted).not.toBeNull()
    })

    it("admin can create, read, update & delete a label", async () => {
        // admin can create a label
        const response1 = await apiTests.callApi("/api/leads/create/label", Method.POST, UserLevel.ADMIN, label);
        expect(response1.status).toBe(200);
        const createdLabel: LeadLabel = response1.body;
        expect(createdLabel.id).not.toBeNull();
        // admin can update a label
        const response2 = await apiTests.callApi("/api/leads/update/label", Method.PUT, UserLevel.ADMIN, { id: createdLabel.id, text: "updated admin label" });
        expect(response2.status).toBe(200);
        expect(response2.body.text).toBe("updated admin label");
        // user attempts to update not owned label
        const response3 = await apiTests.callApi("/api/leads/update/label", Method.PUT, UserLevel.USER, { id: createdLabel.id, text: "updated admin label as user" });
        expect(response3.status).toBe(403);
        // buyer can only read his labels
        const response4 = await apiTests.callApi("/api/leads/labels", Method.GET, UserLevel.USER);
        const labels: LeadLabel[] = response4.body;
        const userOnlyLabels = labels.every((label) => label.user_id === '123e4567-e89a-12d3-b456-226600000201');
        expect(userOnlyLabels).toBe(true);
        //  admin can only read his labels
        const response5 = await apiTests.callApi("/api/leads/labels", Method.GET, UserLevel.ADMIN);
        const adminLabels: LeadLabel[] = response5.body;
        const adminOnlyLabels = adminLabels.every((label) => label.user_id === '123e4567-e89a-12d3-b456-226600000200');
        expect(adminOnlyLabels).toBe(true);
        // other user attempts to delete not owned label
        const response6 = await apiTests.callApi("/api/leads/label/" + createdLabel.id, Method.DELETE, UserLevel.USER);
        expect(response6.status).toBe(403);
        // admin can delete a label
        const response7 = await apiTests.callApi("/api/leads/label/" + createdLabel.id, Method.DELETE, UserLevel.ADMIN);
        expect(response7.status).toBe(200);
        expect(response7.body.deleted).not.toBeNull()
    })

    it('admin can assign an remove labels', async () => {
      // create a label
        const response1 = await apiTests.callApi("/api/leads/create/label", Method.POST, UserLevel.ADMIN, {...label, text: "admin label"});
        expect(response1.status).toBe(200);
        //get a lead from seeder
        const leadIdFromSeeder = "123e4567-e89a-12d3-b456-226600000306";
        const leadFromSeeder = await apiTests.callApi("/api/leads/admin/"+leadIdFromSeeder, Method.GET, UserLevel.ADMIN);
        expect(leadFromSeeder.status).toBe(200);
        expect(leadFromSeeder.body.lead_label_id).toBeNull();
        // assign label to lead
        const response2 = await apiTests.callApi("/api/leads/label/assign", Method.PUT, UserLevel.ADMIN, {lead_id: leadIdFromSeeder, label_id: response1.body.id});
        expect(response2.status).toBe(200);
        // check if label is assigned
        const leadWithLabel = await apiTests.callApi("/api/leads/admin/"+leadIdFromSeeder, Method.GET, UserLevel.ADMIN);
        expect(leadWithLabel.status).toBe(200);
        expect(leadWithLabel.body.lead_label_id).toBe(response1.body.id);
        // remove label from lead
        const response3 = await apiTests.callApi("/api/leads/label/remove", Method.PUT, UserLevel.ADMIN, {lead_id: leadIdFromSeeder});
        expect(response3.status).toBe(200);
        // check if label is removed
        const leadWithoutLabel = await apiTests.callApi("/api/leads/admin/"+leadIdFromSeeder, Method.GET, UserLevel.ADMIN);
        expect(leadWithoutLabel.status).toBe(200);
        expect(leadWithoutLabel.body.lead_label_id).toBeNull();
    })

});