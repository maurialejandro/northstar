import Stripe from "stripe";
import { EnvConfig } from "./envConfig.ts";
export interface StripeProvider {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    stripe(config: EnvConfig) : Stripe;
}

/**
 * Constructs stripe based on env vars
 */
export class EnvironmentalStripeProvider implements StripeProvider {
    stripe(config: EnvConfig): Stripe {
        return new Stripe(config.stripeKey, {} as Stripe.StripeConfig);
    }
}

/**
 * For tests will leave it commented for future usage
 */
// export class InstantiatedStripeProvider implements StripeProvider {
//
//     constructor(private readonly stripeClient: Stripe) {}
//
//     stripe(): Stripe {
//         return this.stripeClient;
//     }
// }