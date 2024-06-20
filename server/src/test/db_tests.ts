// this has to go at the top of the test suite. since we're always importing TestDBSetup for db tests, this works here.
// test suites that need injection that don't involve the db will need their own import.
import "reflect-metadata";

import { Client, ClientConfig } from 'pg';
import { AuthResponse, createClient, SupabaseClient } from "@supabase/supabase-js";
import { resolve } from "path";
import { readFileSync } from "fs";
import { DBConfig, EnvConfig } from "../main/config/envConfig.ts";
import { DBContainer } from "../main/config/DBContainer.ts";

// database setup for tests
export class TestDBSetup {

    private config = new EnvConfig();
    private supabaseClient: SupabaseClient | null = null

    async pgclient(): Promise<Client> {
        const client = new Client(this.clientconfig(this.dbconfig()));
        // NOTE this is hacky - we're not cleaning up our local connections. may need to deal with it
        await client.connect();
        return client;
    }

    dbconfig(): DBConfig {
        return {
            dbDb: "postgres",
            dbHost: "localhost",
            dbPass: "postgres",
            dbPort: "54322",
            dbUser: "postgres"
        }

    }

    clientconfig(dbconfig: DBConfig): ClientConfig {
        return {
            host: dbconfig.dbHost,
            user: dbconfig.dbUser,
            port: Number(dbconfig.dbPort),
            password: dbconfig.dbPass,
            database: dbconfig.dbDb
        }
    }

    db(): DBContainer {
        // TODO make this return using doppler? or dump doppler to env
        return new DBContainer(
            new DBConfig("localhost", "postgres", "postgres", "54322", "postgres")
        )
    }

  supabase(): SupabaseClient {

    if (this.supabaseClient == null) {         
            this.supabaseClient = createClient("http://localhost:54321",
                this.config.supabaseKey,
                { auth: { persistSession: false } })
        }
        return this.supabaseClient;
    }

    envConfig(): EnvConfig {
        return this.config;
    }

    async authenticate(email: string, password: string): Promise<AuthResponse> {
        return await this.supabase().auth.signInWithPassword({ email, password })
    }

    /**
     * Runs everything in test.sql
     */
    async loadTestData() {
        const client = await this.pgclient();

        await client.query("TRUNCATE auth.users CASCADE");
        await client.query("TRUNCATE public.counties CASCADE");
        await client.query("TRUNCATE public.label_colors CASCADE");
        await client.query("TRUNCATE public.subscription_levels CASCADE");

        try {
            for (const file of ["seed.sql", "test.sql"]) {
                const filePath = resolve(__dirname, "../../../supabase/" + file);
                const sqlQuery = readFileSync(filePath, 'utf-8');
                await client.query(sqlQuery);
            }

            // XXX something is making two user rows - NS5.38 will deal with this
            await client.query("delete from users where email='test1@flavor8.com' and name is null;");
        } catch (err) {
            console.warn("Error loading seed or test data: " + err)
            throw err
        } finally {
            await client.end(); // Close the connection
        }
    }

    async userId(email: string): Promise<string | null> {
        const client = await this.pgclient();

        const query = `select id from users where email='${email}';`
        const resp = await client.query(query);
        await client.end();

        const firstRow = resp.rows[0];
        if (firstRow) {
            return firstRow.id;
        } else {
            throw Error("Can't find user with " + email)
        }
    }
}