import { injectable } from "tsyringe";
import { Stripe } from "stripe";
import { EnvConfig } from "../config/envConfig.ts";
import { clientRoutes } from "../config/clientRoutes.ts";

export function centsToDollars(cents:number) {
    if (cents/100 !== Math.floor(cents/100)) throw Error("we should only be dealing with whole cents!")
    return Math.floor(cents / 100);
}

export function dollarsToCents(dollars:number) {
    return Math.floor(dollars) * 100;
}

@injectable()
export default class StripeIAO {
    // TODO these should be properties
    private readonly bronzePlan = 'price_1NO2n8HEBdwrnrVKEBmcjh2R'
    private readonly silverPlan = 'price_1NO2noHEBdwrnrVK8CxXdcjE'
    private readonly goldPlan = 'price_1NNjhOHEBdwrnrVKAcfVOnf9'

    constructor(private readonly stripe: Stripe, private readonly config: EnvConfig) {
        this.config = config;
    }

    async createStripeCheckoutPaymentSession(
        email: string,
        stripe_customer_id: string,
        amount: number
    ): Promise<{ url: string | null }> {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'product',
                        },
                        unit_amount: dollarsToCents(amount),
                    },
                    quantity: 1,
                },
            ],
            ...(stripe_customer_id
                ? { customer: stripe_customer_id }
                : {
                    customer_creation: 'always',
                    customer_email: email,
                }),
            payment_method_options: {
                card: {
                    setup_future_usage: 'off_session',
                    installments: { enabled: false },
                },
            },
            success_url: `${this.config.clientUrl + clientRoutes.buyerDashboard}`,
            cancel_url: `${this.config.clientUrl + clientRoutes.buyerDashboard}`,
        });

        return { url: session.url };
    }

    // used for saving credit card on a stripe customer
    async createStripeCheckoutSetUpIntentSession(
        email: string,
        stripe_customer_id: string | null,
    ): Promise<{ url: string | null }> {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'setup',
            ...(stripe_customer_id
                ? { customer: stripe_customer_id }
                : {
                    customer_creation: 'always',
                    customer_email: email,
                }),
            success_url: `${this.config.clientUrl + clientRoutes.settings}`,
            cancel_url: `${this.config.clientUrl + clientRoutes.settings}`,
        });

        return { url: session.url };
    }

    async createStripeCheckoutSubscriptionSession(
        stripe_customer_id: string,
    ): Promise<{ url: string | null }> {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: 'price_1NNjhOHEBdwrnrVKAcfVOnf9',
                    quantity: 1,
                },
            ],
            customer: stripe_customer_id,
            success_url: `${this.config.clientUrl + clientRoutes.buyerDashboard}`,
            cancel_url: `${this.config.clientUrl + clientRoutes.buyerDashboard}`,
        });

        return { url: session.url };
    }

    async getStripeCustomerCardAndEmail(
        customer_id: string,
    ): Promise<{ card: string; email: string; }> {
        const customer: Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer> = await this.stripe.customers.retrieve(customer_id);
        if (customer.deleted) {
            // XXX handle
            throw Error("customer was deleted!")
        }

        const paymentMethods = await this.stripe.customers.listPaymentMethods(
            customer_id,
            { type: "card" }
        );
        const card = paymentMethods.data[0].id;
        const email = customer.email;
        if (!email) { throw Error("no email found!") }
        return { card, email }

    }

    // this should be outdated delete and check what breaks
    async getPaymentMethodsByCustomerId(
        customer_id: string,
    ): Promise<Stripe.PaymentMethod[]> {
        const pmArray = await this.stripe.customers.listPaymentMethods(
            customer_id,
            { type: "card" }
        );
        return pmArray.data
    }

    async chargeCustomerByIdAndPaymentMethod(
        customer_id: string,
        payment_method: string,
        amount: number
    ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        return await this.stripe.paymentIntents.create({
            amount: dollarsToCents(amount),
            currency: "usd",
            confirm: true,
            customer: customer_id,
            payment_method,
        });
    }

    // API STRIPE
    async createCustomer(
        email: string
    ): Promise<Stripe.Response<Stripe.Customer>> {
        return await this.stripe.customers.create({
            email,
            name: email
        });
    }

    async createPaymentMethod(
        card: Stripe.PaymentMethodCreateParams
    ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
        return await this.stripe.paymentMethods.create(card);
    }

    async AttachPaymentMethod(
        customer_id: string,
        payment_method_id: string
    ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
        const attachedPaymentMethod = await this.stripe.paymentMethods.attach(
            payment_method_id,
            { customer: customer_id }
        )
        await this.stripe.customers.update(customer_id, {
            invoice_settings: {
                default_payment_method: payment_method_id,
            },
        });
        return attachedPaymentMethod;
    }

    async detachPaymentMethod(
        payment_method_id: string
    ) {
        const pm = await this.stripe.paymentMethods.detach(
            payment_method_id
        )
        return { id:pm.id, card:pm.card }
    }

    async createSubscription(
        customer_id: string,
        plan: 'bronze' | 'silver' | 'gold',
        trial_period_days: number
    ): Promise<Stripe.Response<Stripe.Subscription>> {
        return await this.stripe.subscriptions.create({
            customer: customer_id,
            items: [
                { price: plan === 'bronze' ? this.bronzePlan : plan === 'silver' ? this.silverPlan : this.goldPlan },
            ],
            trial_period_days
        });
    }

    async createHold(
        customer_id: string,
        payment_method: string,
        amount: number,
    ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        try {
            return await this.stripe.paymentIntents.create({
                amount: dollarsToCents(amount),
                currency: 'usd',
                customer: customer_id,
                payment_method, // Specify the payment method ID here
                capture_method: 'manual',
            });
        } catch (error) {
            console.error('Error creating hold:', error);
            throw error;
        }
    }

    async getCustomerById(
        customer_id: string,
    ): Promise<Stripe.Response<Stripe.Customer>> {
        const customer = await this.stripe.customers.retrieve(customer_id);
        if (customer.deleted) {
            // XXX handle
            throw Error("Fail!")
        }
        return customer
    }

    async getPaymentMethodByPaymentMethodId (stripe_payment_method_id: string): Promise<Stripe.Response<Stripe.PaymentMethod>> {
        return await this.stripe.paymentMethods.retrieve(
            stripe_payment_method_id
        );
    }

}