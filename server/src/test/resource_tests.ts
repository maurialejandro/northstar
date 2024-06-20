import { TestDBSetup } from "./db_tests.ts";
import { NorthstarServer } from "../main/northstarServer.ts";
import { InstantiatedSupabaseProvider } from "../main/config/supabaseProvider.ts";
import request from "supertest";
import { AuthResponse } from "@supabase/supabase-js";
import { DBContainer } from "../main/config/DBContainer.ts";
import { Express } from "express";
import { instance, mock } from "ts-mockito";
import StripeIAO from "../main/data/stripeIAO.ts";

export enum UserLevel {
    ADMIN, USER, ANON
}

export enum Method {
    GET = "GET", PUT = "PUT", POST = "POST", DELETE = "DELETE"
}

export class ApiTests extends TestDBSetup {
    app: Express;
    constructor( private readonly stripeMock?: StripeIAO) {
        super();
        if (this.stripeMock) {
            this.app = new NorthstarServer(
                this.envConfig(),
                new InstantiatedSupabaseProvider(this.supabase()),
                this.stripeMock,
                new DBContainer(this.dbconfig())
            )
                .setup()
                .getApp();
        } else {
            const mockedStripe = mock(StripeIAO)
            const stripeDefaultMock = instance(mockedStripe)
            this.app = new NorthstarServer(
                this.envConfig(),
                new InstantiatedSupabaseProvider(this.supabase()),
                stripeDefaultMock,
                new DBContainer(this.dbconfig())
            )
                .setup()
                .getApp();
        }
    }

    /**
     * Test auth for get and post endpoints. Ensures proper auth.
     * @param path the path to test
     * @param adminOnly true if only admins should access, false if buyers can access too
     * @param method the http method of this api endpoint
     * @param postBody supply if post or put
     */
    async testAuth<T>(path: string, adminOnly: boolean, method: Method, postBody: T | null = null) {

        describe("authentication works properly for " + path, () => {

            it(method + path + " fails when no auth is supplied", async () => {
                const resp = await this.callApi(path, method, UserLevel.ANON, postBody);
                expect(resp.status).toBe(401);
            });

            if (adminOnly) {
                it(method + path + " returns forbidden when user attempts to use", async () => {
                    const resp = await this.callApi(path, method, UserLevel.USER, postBody);
                    expect(resp.status).toBe(403);
                });
            } else {
                it(method + path + " returns ok when user attempts to use", async () => {
                    const resp = await this.callApi(path, method, UserLevel.USER, postBody);
                    expect(resp.status).toBe(200);
                });
            }

            it(method + path + " returns ok when admin attempts to use", async () => {
                const resp = await this.callApi(path, method, UserLevel.ADMIN, postBody);
                expect(resp.status).toBe(200);
            });
        })
    }

    /**
     * Call an api endpoint
     * @param path
     * @param method the http method (we support get, post and put)
     * @param level the level of user to call this as (ANON for no auth)
     * @param postBody null for get, object for post
     */
    async callApi<T>(path: string, method: Method, level: UserLevel, postBody: T | null = null): Promise<request.Response> {
        const req = request(this.app);
        const meth = this.createRequest(req, path, method, postBody);

        if (level === UserLevel.ADMIN || level === UserLevel.USER) {
            const email: string = level === UserLevel.ADMIN ? 'zequi4real@gmail.com' : 'test1@flavor8.com';
            const tokenResponse: AuthResponse = await this.authenticate(email, 'foobah1234');
            const jwtToken: string = tokenResponse.data.session!.access_token;
            meth.set('Authorization', 'Bearer ' + jwtToken);
        }
        return meth;
    }

    private createRequest<T>(
        req: request.SuperTest<request.Test>,
        path: string,
        method: Method,
        postBody: T | null
    ): request.Test {
        let baseRequest;

        switch (method) {
            case Method.GET:
                baseRequest = req.get(path);
                break;
            case Method.POST:
                baseRequest = req.post(path);
                break;
            case Method.PUT:
                baseRequest = req.put(path);
                break;
            case Method.DELETE:
                baseRequest = req.delete(path);
                break;
            default:
                throw new Error(`Unhandled method: ${method}`);
        }

        if (postBody !== null) {
            baseRequest
                .send(JSON.stringify(postBody))
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');
        }

        return baseRequest;
    }
}