import { Buyer } from '../types/buyerTypes.ts';
import { injectable } from "tsyringe";
import { DBContainer } from "../config/DBContainer.ts";
import { IDatabase } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";
import { BuyerLead } from "../types/buyerLeadsTypes.ts";

@injectable()
export default class BuyerDAO {

    database: IDatabase<IClient>;

    constructor(wrapper: DBContainer) {
        this.database = wrapper.database();
    }

    async getBuyers(): Promise<Buyer[]> {
        return await this.database.many<Buyer>(
            "SELECT * FROM users WHERE role='buyer' ORDER BY id");
    }

    async getBuyerById(buyerId: string): Promise<Buyer | null> {
        return await this.database.oneOrNone<Buyer>(
            `
            SELECT users.*, 
                   json_agg(subscriptions.*) AS subscriptions,
                   json_agg(subscription_levels.*) AS subscription_levels
            FROM users
            LEFT JOIN subscriptions ON users.id = subscriptions.user_id
            LEFT JOIN subscription_levels ON subscriptions.subscription_level_id = subscription_levels.id
            WHERE users.id=$1 AND users.role='buyer'
            GROUP BY users.id;
        `, buyerId);
    }

    async getBuyersById(buyerIds: string[]): Promise<Buyer[]> {
        return await this.database.many<Buyer>(
            "SELECT * FROM users WHERE id IN ($1:csv) AND role='buyer' ORDER BY id", [buyerIds]);
    }

    async getUnchargedAssignedLeads(buyerId: string): Promise<BuyerLead[]> {
        return await this.database.manyOrNone<BuyerLead>(
            `
            SELECT *
            FROM buyer_leads BL
            LEFT JOIN transactions T ON BL.id = T.buyer_leads_id
            WHERE BL.user_id = $1
            AND T.id IS NULL;`, buyerId);
    }
}
