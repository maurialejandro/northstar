import { CountyBid } from '../../main/types/countyBidsTypes.ts';
import { ApiTests, Method, UserLevel } from "../resource_tests.ts";

const apiTests = new ApiTests();
const zequiBuyerID = "123e4567-e89a-12d3-b456-226600000201";

describe("/api/county_bids is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })
    apiTests.testAuth(`/api/county_bids/admin/${zequiBuyerID}`, true, Method.GET);
});

describe("can get buyer county bid by id", () => {
    it("can get county bids by admin", async () => {
        const response = await apiTests.callApi(`/api/county_bids/admin/${zequiBuyerID}`, Method.GET, UserLevel.ADMIN);
        console.log(response);
        
        expect(response.status).toBe(200);
        expect(response.body.data).not.toBeNull();
        const userOnlyCountyBids = response.body.every((countyBid: Partial<CountyBid>) => countyBid.user_id === zequiBuyerID);
        expect(userOnlyCountyBids).toBe(true);
    })

})