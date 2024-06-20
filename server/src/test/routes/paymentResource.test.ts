import { ApiTests, Method, UserLevel } from "../resource_tests.ts";
import MockDataGenerator from "../mockDataGenerator.ts";

describe("Payment Resource", () => {
    const johnBuyerID = "123e4567-e89a-12d3-b456-226600000201"
    const mockDataGenerator = new MockDataGenerator()
    beforeAll(async () => {
        const apiTests = new ApiTests();
        await apiTests.loadTestData();
    })

    it("payment methods workflow", async () => {
        const apiTests = mockDataGenerator.mockedApiTestWithStripeIAOMockedPaymentMethods()
        const response = await apiTests.callApi(`/api/payment/payment-methods`, Method.GET, UserLevel.USER);
        // buyers can get their sub
        expect(response.body.length).toBe(3)
        expect(response.status).toBe(200)
        expect(response.body[0].id).toBe("pm_1")

        // expect to get 403 because admin does not have stripe_customer_id
        const response2 = await apiTests.callApi(`/api/payment/payment-methods`, Method.GET, UserLevel.ADMIN);
        expect(response2.status).toBe(403)
    })

    it("update Payment method", async () => {
        const apiTests = mockDataGenerator.mockedApiTestWithStripeIAOMockedPaymentMethods();
        // expected to fail when user id does not match the authed user id
        const response = await apiTests.callApi(`/api/payment/update/payment-method`, Method.PUT, UserLevel.USER, { payment_method_id: "pm_1", user_id: "some-user-ID" });
        expect(response.status).toBe(401)

        // expected to succeed when user id matches authed user id
        const response2 = await apiTests.callApi(`/api/payment/update/payment-method`, Method.PUT, UserLevel.USER, { payment_method_id: "pm_1", user_id: johnBuyerID });
        expect(response2.status).toBe(200)

        const response3 = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.USER);
        expect(response3.body.stripe_payment_method_id).toBe("pm_1")
    })

    it("detach Payment method", async () => {
        const apiTests = mockDataGenerator.mockedApiTestWithStripeIAOMockedPaymentMethods()
        //fails when user id does not match the authed user id
        const response = await apiTests.callApi(`/api/payment/detach/payment-method`, Method.POST, UserLevel.USER, { payment_method_id: "pm_1", user_id: "some-user-ID" });
        expect(response.status).toBe(401)

        // update default pm to pm_1
        const response1 = await apiTests.callApi(`/api/payment/update/payment-method`, Method.PUT, UserLevel.USER, { payment_method_id: "pm_1", user_id: johnBuyerID });
        expect(response1.status).toBe(200)

        // succeeds when user id matches authed user id
        const response2 = await apiTests.callApi(`/api/payment/detach/payment-method`, Method.POST, UserLevel.USER, { payment_method_id: "pm_1", user_id: johnBuyerID });
        expect(response2.status).toBe(200)
        expect(response2.body.id).toBe("pm_1")

        // expect pm to be null because we detached our default pm
        const response3 = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.USER);
        expect(response3.body.stripe_payment_method_id).toBe(null)

    })

    it('setup intent should return an url', async () => {
        const apiTests = mockDataGenerator.mockedApiTestWithStripeIAOMockedSetUpIntent({ possibleCustomerIdCreation: '', urlReturned: "https://some-mock-url.com" })
        const userData = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.USER);
        // user has a customer_id that comes from our testing data
        expect(userData.body.stripe_customer_id).toBe('cus_OpyG9tsN8TLqY2')
        // if user has a customer id, setup should return an url without changing the customer id
        const response = await apiTests.callApi(`/api/payment/setup`, Method.POST, UserLevel.USER);
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('url', "https://some-mock-url.com")

        const response2 = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.USER);
        // customer id did not change
        expect(response2.body.stripe_customer_id).toBe(userData.body.stripe_customer_id)
    })

    it('setup intent should create a cusId if user does not have one', async () => {
        const apiTests = mockDataGenerator.mockedApiTestWithStripeIAOMockedSetUpIntent({ possibleCustomerIdCreation: 'cus_test_mock_id', urlReturned: "https://some-mock-url.com" })
        const userData = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.ADMIN);
        // our admin does not have a customer id
        expect(userData.body.stripe_customer_id).toBeNull()

        const response = await apiTests.callApi(`/api/payment/setup`, Method.POST, UserLevel.ADMIN);
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('url', "https://some-mock-url.com")

        const response2 = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.ADMIN);
        // a customer id was set by our setUp intent and will be used again every time we use stripe
        expect(response2.body.stripe_customer_id).toBe("cus_test_mock_id")

    })

});