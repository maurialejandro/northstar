import {ApiTests, Method, UserLevel} from "../resource_tests.ts";
import {Buyer} from "../../main/types/buyerTypes.ts";

const apiTests = new ApiTests();
const johnBuyerId ='123e4567-e89a-12d3-b456-226600000201'
const adminId ='b62b633b-bcaf-43a7-8907-3ea0999e78e5'
describe("GET /api/buyers/* is protected by auth", () => {
    beforeEach(async () => {
        await apiTests.loadTestData();
    })
    apiTests.testAuth("/api/buyers/admin", true, Method.GET);
    apiTests.testAuth("/api/buyers/admin/"+johnBuyerId, true, Method.GET);
});

describe("get buyers", () => {
    it("can get buyers", async () => {
        const response = await apiTests.callApi("/api/buyers/admin", Method.GET, UserLevel.ADMIN);
        // response includes a buyer with id === johnBuyerId
        const includesABuyer = response.body.some((buyer: Buyer) => buyer.id === johnBuyerId)
        expect(includesABuyer).toBe(true)
        // response does not include admins
        const includesAnAdmin = response.body.some((buyer: Buyer) => buyer.id === adminId)
        expect(includesAnAdmin).toBe(false)
    })
})

describe("get buyers by id", () => {

    it("can get any user by id", async () => {

        const response1 = await apiTests.callApi("/api/buyers/admin/"+johnBuyerId, Method.GET, UserLevel.ADMIN);
        // gets the correct buyer by id
        expect(response1.body.id).toBe(johnBuyerId)

        const response2 = await apiTests.callApi("/api/buyers/admin/"+adminId, Method.GET, UserLevel.ADMIN);
        // cannot get an admin through the buyer api!
        expect(response2.status).toBe(422)
    })
})

// TODO more api tests here