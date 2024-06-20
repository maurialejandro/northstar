import { ApiTests, Method, UserLevel } from "../resource_tests.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import SubscriptionsDAO from "../../main/data/subscriptionsDAO.ts";
import { TestDBSetup } from "../db_tests.ts";

const apiTests = new ApiTests();

describe("/api/subscription is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })

    // buyers cannot access admin disputes
    apiTests.testAuth("/api/subscription/levels", false, Method.GET);
});

describe("lifecycle of subscriptions", () => {

    beforeEach(async () => {
        await apiTests.loadTestData();
    })

    it("a buyer can get his sub", async () => {
        const response = await apiTests.callApi(`/api/subscription`, Method.GET, UserLevel.USER);
        // buyers can get their sub
        expect(response.status).toBe(200);
        expect(response.body.user_id).toBe('123e4567-e89a-12d3-b456-226600000201'); // test1@flavor8 id

        // a subscription is not found because in this case the admin does not possess one
        const adminResponse = await apiTests.callApi(`/api/subscription`, Method.GET, UserLevel.ADMIN);
        expect(adminResponse.status).toBe(420);
        expect(adminResponse.body).toMatchObject({})
    })

    it("a buyer can get subscription levels", async () => {
        const response = await apiTests.callApi(`/api/subscription/levels`, Method.GET, UserLevel.USER);
        // buyers can get subscription levels
        expect(response.status).toBe(200);
    })

    it("complete workflow", async () => {
        const setup = new TestDBSetup();
        const supabase = new SupabaseWrapper(setup.supabase());
        const dao = new SubscriptionsDAO(supabase);
        await setup.loadTestData();
        const myUserId = await setup.userId("test1@flavor8.com") as string
        expect(myUserId).not.toBeNull();
        const response = await apiTests.callApi(`/api/subscription/levels`, Method.GET, UserLevel.USER);
        const bronze_level_id = response.body[2].id;
        expect(response.status).toBe(200);
        expect(response.body[2].level).toBe('bronze');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const flavorCurrentSubId = '123e4567-e89a-12d3-b456-226600000702'

        // buyers can get only their current sub
        const response1 = await apiTests.callApi(`/api/subscription`, Method.GET, UserLevel.USER);
        expect(response1.body.id).toBe(flavorCurrentSubId);
        expect(response1.status).toBe(200);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        //update subscription end date to yesterday
        const response2 = await dao.updateSubscription({ id:flavorCurrentSubId, end_date: yesterday, user_id: myUserId });
        expect(response2).not.toBeNull();
        expect(new Date(response2.end_date) < new Date()).toBe(true);

        // buyer cant get his current sub because end_date was yesterday
        const response3 = await apiTests.callApi(`/api/subscription`, Method.GET, UserLevel.USER);
        expect(response3.status).toBe(420);

        // update subscription end date to tomorrow
        const response4 = await dao.updateSubscription({ id:flavorCurrentSubId, end_date: tomorrow, user_id: myUserId });
        expect(response4).not.toBeNull();
        expect(new Date(response4.end_date) > new Date()).toBe(true);

        // buyer gets his current sub because end_date was tomorrow
        const response5 = await apiTests.callApi(`/api/subscription`, Method.GET, UserLevel.USER);
        expect(response5.status).toBe(200);
        expect(response5.body.id).toBe(flavorCurrentSubId);
        expect(response5.body.can_renew).toBe(true);

        // buyers can pause their sub
        const response6 = await apiTests.callApi(`/api/subscription/pause`, Method.PUT, UserLevel.USER, { subscription_id: flavorCurrentSubId });
        expect(response6.status).toBe(200);
        expect(response6.body.can_renew).toBe(false);

        // by default gets also paused subs
        const response7 = await apiTests.callApi(`/api/subscription`, Method.GET, UserLevel.USER);
        expect(response7.body.id).toBe(flavorCurrentSubId);
        expect(response7.body.can_renew).toBe(false);
        expect(response7.body.user_id).toBe(myUserId);

        // can exclude paused subs
        const response8 = await apiTests.callApi(`/api/subscription?exclude_cant_renew=true`, Method.GET, UserLevel.USER);
        expect(response8.status).toBe(420);

        // buyers can create a sub // dao is needed because we cant use payment
        const response9 = await dao.postSubscription({ user_id: myUserId, subscription_level_id: bronze_level_id, start_date: new Date(), end_date: tomorrow });
        expect(response9).not.toBeNull();
        expect(response9.subscription_level_id).toBe(bronze_level_id);

        // gets only the newest sub by start_date
        const response10 = await apiTests.callApi(`/api/subscription`, Method.GET, UserLevel.USER);
        expect(response10.status).toBe(200);
        expect(response10.body.id).toBe(response9.id);

        // can get only active subs
        const response11 = await apiTests.callApi(`/api/subscription?exclude_cant_renew=true`, Method.GET, UserLevel.USER);
        expect(response11.status).toBe(200);
        expect(response11.body.id).toBe(response9.id);

        // update new created sub to yesterday so it expires
        const expiredDate = new Date(tomorrow.setDate(tomorrow.getDate() - 4));
        const response12 = await dao.updateSubscription({ id:response9.id, end_date: expiredDate, user_id: myUserId, can_renew:false });
        expect(response12).not.toBeNull();

        // can resume subs
        const response15 = await apiTests.callApi(`/api/subscription/resume`, Method.PUT, UserLevel.USER, { subscription_id: flavorCurrentSubId });
        expect(response15.status).toBe(200);
        expect(response15.body.can_renew).toBe(true);

        // get only flavor original sub
        const response16 = await apiTests.callApi(`/api/subscription?exclude_cant_renew=true`, Method.GET, UserLevel.USER);
        expect(response16.body.id).toBe(flavorCurrentSubId);
        expect(response16.body.can_renew).toBe(true);

    })

});