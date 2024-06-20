import { Transaction } from '../../main/types/transactionType.ts';
import { ApiTests, Method, UserLevel } from "../resource_tests.ts";

const apiTests = new ApiTests();
const zequiBuyerID = "123e4567-e89a-12d3-b456-226600000201";

describe("/api/transactions is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })
    apiTests.testAuth(`/api/transactions/admin/buyer_transactions/${zequiBuyerID}`, true, Method.GET);
    apiTests.testAuth(`/api/transactions/admin/all`, true, Method.GET);
});

describe("can get buyer transactions by id", () => {
    it("can get transactions", async () => {
        const response = await apiTests.callApi(`/api/transactions/admin/buyer_transactions/${zequiBuyerID}`, Method.GET, UserLevel.ADMIN);
        expect(response.status).toBe(200);
        expect(response.body.data).not.toBeNull();
        const userOnlyTransactions = response.body.data.every((transaction:Transaction) => transaction.user_id === zequiBuyerID);
        expect(userOnlyTransactions).toBe(true);
        
    })

})