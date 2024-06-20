import pgPromise, {IDatabase} from 'pg-promise';
import {DBConfig} from "./envConfig.ts";
import {IClient} from "pg-promise/typescript/pg-subset";

export class DBContainer {

    private readonly db: IDatabase<IClient>;

    constructor(config: DBConfig) {
        const connectionConfig = {
            host: config.dbHost,
            port: parseInt(config.dbPort),
            database: config.dbDb,
            user: config.dbUser,
            password: config.dbPass,
        };
        const pgp = pgPromise();
        this.db = pgp(connectionConfig);
    }

    database(): IDatabase<IClient> {
        return this.db;
    }
}
