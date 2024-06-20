import {ApiTests, Method, UserLevel} from "../resource_tests.ts";

const apiTests = new ApiTests();
describe("GET /api/users is protected by auth", () => {
    beforeAll(async () => {
        await apiTests.loadTestData();
    })
    apiTests.testAuth("/api/users/role", false, Method.GET);

    it("can get role", async () => {
        const response = await apiTests.callApi("/api/users/role", Method.GET, UserLevel.ADMIN);
        // gets admin Role successfully
        expect(response.body.role).toBe('admin')
        // gets buyer Role successfully
        const response2 = await apiTests.callApi("/api/users/role", Method.GET, UserLevel.USER);
        expect(response2.body.role).toBe('buyer')
    })

    it("can authenticate", async () => {
        // authenticates a user as anonymous
        const response = await apiTests.callApi("/api/authenticate", Method.POST, UserLevel.ANON,{email:'test1@flavor8.com', password:'foobah1234'});
        expect(typeof response.body.data.session.access_token).toBe('string');

        // authenticates an admin as anonymous
        const response2 = await apiTests.callApi("/api/authenticate", Method.POST, UserLevel.ANON,{email:'zequi4real@gmail.com', password:'foobah1234'});
        expect(typeof response2.body.data.session.access_token).toBe('string');
    })

    it("can register", async () => {
        // registers a user as anonymous
        const response = await apiTests.callApi("/api/authenticate/register", Method.POST, UserLevel.ANON, {email: 'test2@flavor8.com', password: 'foobah1234'});
        expect(typeof response.body.data.session.access_token).toBe('string');
    })

    it("can get admin user's info", async () => {
        const response = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.ADMIN);
        expect(response.body.role).toBe('admin');
        expect(response.body.name).toBe('Zequi Admin');
    })

    it("can get buyer user's info", async () => {
        const response = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.USER);
        expect(response.body.role).toBe('buyer');
        expect(response.body.name).toBe('John Buyer');
    })

// TODO can update user by id
    it("can update user name", async () => {
        const response = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.ADMIN);
        expect(response.body.role).toBe('admin');
        expect(response.body.name).toBe('Zequi Admin');

        const response2 = await apiTests.callApi("/api/users/info", Method.PUT, UserLevel.ADMIN, {name:'Zequi Admin Updated'});
        expect(response2.body.role).toBe('admin');
        expect(response2.body.name).toBe('Zequi Admin Updated');
    })

    // now do the same but as user
    it("can update user name as user", async () => {
        const response = await apiTests.callApi("/api/users/info", Method.GET, UserLevel.USER);
        expect(response.body.role).toBe('buyer');
        expect(response.body.name).toBe('John Buyer');

        const response2 = await apiTests.callApi("/api/users/info", Method.PUT, UserLevel.USER, {name:'John Buyer Updated'});
        expect(response2.body.role).toBe('buyer');
        expect(response2.body.name).toBe('John Buyer Updated');
    })

})

// TODO more api tests here