import { SupabaseClient } from "@supabase/supabase-js";
import "reflect-metadata";
import dotenv from 'dotenv';
import express, { Express } from "express";
import PaymentResource from "./resources/paymentResource";
import CountyBidsResource from "./resources/countyBidsResource";
import BuyerResource from "./resources/buyerResource";
import UserResource from "./resources/userResource";
import AuthenticateResource from "./resources/authenticateResource";
import LeadsResource from "./resources/leadResource";
import TransactionsResource from "./resources/transactionsResource";
import BuyerLeadsResource from "./resources/buyerLeadsResource";
import DisputesResource from "./resources/disputesResource";
import SubscriptionResource from "./resources/subscriptionResource.ts";
import { appConfig } from "./config";

import { Authenticator } from "./middleware/authenticator.ts";

import { container } from "tsyringe";
import { EnvConfig } from "./config/envConfig.ts";
import { SupabaseProvider, SupabaseWrapper } from "./config/supabaseProvider.ts";
import { DBContainer } from "./config/DBContainer.ts";
import ActivityResource from './resources/activityResource.ts';
import StripeIAO from "./data/stripeIAO.ts";
import WinRateResource from './resources/winRateResource.ts';

dotenv.config();

export class NorthstarServer {

    private readonly app: Express;

    constructor(private readonly config: EnvConfig,
        private readonly supabaseProvider: SupabaseProvider,
        private readonly stripeIAO: StripeIAO,
        private readonly databaseProvider: DBContainer) {

        this.config = config;
        this.app = express();
    }

    setup(): NorthstarServer {
        appConfig(this.app);
        // TODO there's a tsyringe way of doing providers which might clean this up a bit
        // TODO we'll get rid of the client once the DAOs are cut over...
        const supabaseClient = this.supabaseProvider.supabase(this.config);
        const authenticator = new Authenticator(supabaseClient);

        container.registerInstance(DBContainer, this.databaseProvider);
        container.registerInstance(SupabaseClient, supabaseClient);
        container.registerInstance(StripeIAO, this.stripeIAO);
        container.registerInstance(SupabaseWrapper, new SupabaseWrapper(supabaseClient));
        container.registerInstance(EnvConfig, this.config);
        // TODO does anything actually need this to be injected?
        container.registerInstance(Authenticator, authenticator);

        const authFunc = authenticator.authenticateFunc();

        this.app.use("/api/county_bids", authFunc, container.resolve(CountyBidsResource).routes());
        this.app.use("/api/transactions", authFunc, container.resolve(TransactionsResource).routes());
        this.app.use("/api/buyer_leads", authFunc, container.resolve(BuyerLeadsResource).routes());
        this.app.use("/api/disputes", authFunc, container.resolve(DisputesResource).routes());
        this.app.use("/api/leads", authFunc, container.resolve(LeadsResource).routes());
        this.app.use("/api/payment", authFunc, container.resolve(PaymentResource).routes());
        this.app.use("/api/buyers", authFunc, container.resolve(BuyerResource).routes());
        this.app.use("/api/users", authFunc, container.resolve(UserResource).routes());
        this.app.use("/api/authenticate", container.resolve(AuthenticateResource).routes());
        this.app.use("/api/activity", authFunc , container.resolve(ActivityResource).routes());
        this.app.use("/api/subscription", authFunc, container.resolve(SubscriptionResource).routes());
        this.app.use("/api/win_rate", authFunc, container.resolve(WinRateResource).routes());

        // TODO this was useless but maybe we need it?
        // this.app.use(new ErrorHandler().errorHandler);

        return this;
    }

    getApp() {
        return this.app;
    }
}
