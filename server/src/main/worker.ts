import 'reflect-metadata'
import { container } from 'tsyringe';
import { EnvConfig } from "./config/envConfig.ts";
import { EnvironmentalSupabaseProvider, SupabaseProvider, SupabaseWrapper } from "./config/supabaseProvider.ts";
import { DBContainer } from "./config/DBContainer.ts";
import SubscriptionMaintenanceJob from "./workerJobs/subscriptionMaintenanceJob.ts";
import { SupabaseClient } from "@supabase/supabase-js";
import AverageWorker from './workerJobs/AverageDisputeJob.ts'
import StripeIAO from "./data/stripeIAO.ts";
import { EnvironmentalStripeProvider } from "./config/stripeProvider.ts";

class Scheduler {
    constructor(private readonly config: EnvConfig,
                private supabaseProvider: SupabaseProvider,
                private stripeIAO: StripeIAO,
                private databaseProvider: DBContainer) { this.config = config; }

    setup(){
        const supabaseClient = this.supabaseProvider.supabase(this.config);
        container.registerInstance(DBContainer, this.databaseProvider);
        container.registerInstance(SupabaseClient, supabaseClient);
        container.registerInstance(StripeIAO, this.stripeIAO);
        container.registerInstance(SupabaseWrapper, new SupabaseWrapper(supabaseClient));
        container.registerInstance(EnvConfig, this.config);
    }

    runJobs() {
    this.setup()
        const subscriptionMaintenanceJob = container.resolve(
            SubscriptionMaintenanceJob
        )
        subscriptionMaintenanceJob.run().then((res) => {
            return res
        })

        const averageDisputeJob = container.resolve(AverageWorker)
        averageDisputeJob.run()
    }
}

const config = new EnvConfig();
const myScript = new Scheduler(
    config,
    new EnvironmentalSupabaseProvider(),
    new StripeIAO(new EnvironmentalStripeProvider().stripe(config), config),
    new DBContainer(config.dbConfig)
);
myScript.runJobs();