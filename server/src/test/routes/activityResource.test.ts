import { Activity } from "../../main/types/activityTypes.ts";
import { ApiTests, Method, UserLevel } from "../resource_tests.ts";

const apiTests = new ApiTests();
const leadId = "123e4567-e89a-12d3-b456-226600000301";
const activity = { leadId, visibility: 'private', note: 'Test note' };

describe("/api/activities/admin/by_lead/:leadId is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    });
    
    apiTests.testAuth(`/api/activity/admin/by_lead/${leadId}`, true, Method.GET);
    apiTests.testAuth(`/api/activity/admin/create`, true, Method.POST, activity);
});

describe("can get/create/update/delete activity", () => {

    it("should get", async () => {
        const response = await apiTests.callApi(`/api/activity/admin/by_lead/${leadId}`, Method.GET, UserLevel.ADMIN);
        expect(response.status).toBe(200);
        const includesLead = response.body.every((lead: Activity) => lead.lead_id === leadId)
        expect(includesLead).toBe(true)
    });

    it("should create/update/delete", async () => {
        const response = await apiTests.callApi("/api/activity/admin/create", Method.POST, UserLevel.ADMIN, activity);
        expect(response.status).toBe(200);
        expect(response.body.id).not.toBeNull();
        expect(response.body.visibility).toBe("private")

        //can update
        const updateResponse = await apiTests.callApi(`/api/activity/admin/update/${response.body.id}`, Method.PUT, UserLevel.ADMIN, { note: "updated note" });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.note).toBe("updated note")
        
        //can delete
        const deleteResponse = await apiTests.callApi(`/api/activity/admin/delete/${response.body.id}`, Method.DELETE, UserLevel.ADMIN);
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.id).toBe(response.body.id)
        expect(deleteResponse.body.deleted).not.toBeNull()
    })
})
