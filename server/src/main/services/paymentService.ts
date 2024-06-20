import Stripe from 'stripe';
import UserDAO from "../data/userDAO.ts";
import { injectable } from "tsyringe";
import StripeIAO from '../data/stripeIAO.ts';
import { User } from "../types/userTypes.ts";
import PaymentDAO from "../data/paymentDAO.ts";

@injectable()
export default class PaymentService {

    constructor(
        private readonly userDAO: UserDAO,
        private readonly stripeIAO: StripeIAO,
        private readonly paymentDAO: PaymentDAO
    ) {}

    async createStripeCustomer(email: string, id: string) {
        const stripeCustomer = await this.stripeIAO.createCustomer(email)
        return this.paymentDAO.setCustomerIDInDB(stripeCustomer.id, id)
    }

    async createCheckoutPaymentSession(
        email: string,
        stripe_customer_id: string,
        amount: number
    ): Promise<{ url: string | null }> {
        return this.stripeIAO.createStripeCheckoutPaymentSession(
            email,
            stripe_customer_id,
            amount * 100
        );
    }

    async createCheckoutSubscriptionSession(
        stripe_customer_id: string,
    ): Promise<{ url: string | null }> {
        return this.stripeIAO.createStripeCheckoutSubscriptionSession(
            stripe_customer_id,
        );
    }

    async createCheckoutSetUpIntentSession(
        email: string,
        stripe_customer_id: string | null,
    ): Promise<{ url: string | null }> {
        return this.stripeIAO.createStripeCheckoutSetUpIntentSession(
            email,
            stripe_customer_id,
        );
    }

    //Todo remove this one and switch to use transaction service Will have to change webhook using it
    async postTransaction(
        id: string,
        customer_id: string,
        amount: number,
        status: string,
    ) {
        return await this.paymentDAO.postTransactionIntoDB(
            id,
            customer_id,
            amount,
            status,
        );
    }

    async updateUserIfNecessary(
        customer_id: string,
    ): Promise<User> {
        const customerEmailAndString = await this.stripeIAO.getStripeCustomerCardAndEmail(customer_id)
        const userData = await this.userDAO.getUserByEmail(customerEmailAndString.email);
        const card = customerEmailAndString.card;
        if (userData.stripe_customer_id !== customer_id || userData.stripe_payment_method_id !== customerEmailAndString.card){
            return await this.userDAO.updateBuyerByEmail({ stripe_customer_id: customer_id, stripe_payment_method_id: card }, customerEmailAndString.email)
        } else {
            return userData
        }
    }

    async chargeCustomer(
        stripe_customer_id: string,
        payment_method_id: string,
        charge_amount: number
    ) {
        return this.stripeIAO.chargeCustomerByIdAndPaymentMethod(
            stripe_customer_id,
            payment_method_id,
            charge_amount
        );
    }

    async subscript(
        email: string,
        stripe_customer_id: string,
        plan: 'bronze' | 'silver' | 'gold',
        card: Stripe.PaymentMethodCreateParams,
        trial_period_days = 30
    ) {
        let id = stripe_customer_id
        // If User does not have Customer ID it creates it and save it in DB
        if (!stripe_customer_id) {
            const customer = await this.stripeIAO.createCustomer(
                email
            );
            // Posts Customer ID in DB
            this.userDAO.updateBuyerByEmail({ stripe_customer_id: customer.id }, customer.email as string)
            id = customer.id
        }
        const paymentMethod = await this.stripeIAO.createPaymentMethod(card)
        // Posts Payment Method in DB
        this.userDAO.updateBuyerByEmail({ stripe_payment_method_id: paymentMethod.id}, email)
        await this.stripeIAO.AttachPaymentMethod(id, paymentMethod.id)
        //Create $1 hold 
        const hold = await this.createHold(id, paymentMethod.id)
        //if hold created it creates a subscription
        if (hold) {
            const subscription = await this.stripeIAO.createSubscription(id, plan, trial_period_days)
            return subscription
        } else {
            return { message: 'failed to capture hold', hold }
        }
    }

    async createHold(
        stripe_customer_id: string,
        payment_method: string,
        amount = 100
    ): Promise<string> {
        const hold = await this.stripeIAO.createHold(stripe_customer_id, payment_method, amount)
        return hold.id
    }

    // returns an array of PM id, CUS id and last4 numbers of card
    async getPaymentMethods(
        stripe_customer_id: string,
    ): Promise<{ id: string, customer: string | Stripe.Customer | null, brand: string, default: boolean, last4: string }[] | null> {
        if (!stripe_customer_id) {
            return null
        }
        const paymentMethods = await this.stripeIAO.getPaymentMethodsByCustomerId(stripe_customer_id)
        return paymentMethods.map((paymentMethod) => {
            const { id, customer, card } = paymentMethod;
            // TODO i am almost sure we always get last4, but we should check
            const { last4, brand } = card!;
            return { id, customer, last4, brand, default: false };
        });
    }

    // this method is used to get the default payment method (credit card) of a customer. it is retrieved from stripe using our DB stripe_PM_id.
    async getDefaultPaymentMethod(stripe_payment_method_id: string){
        return this.stripeIAO.getPaymentMethodByPaymentMethodId(stripe_payment_method_id)
    }

    // this method is used to detach/remove/delete a payment method (credit card) from a customer. it is deleted from stripe.
    async detachPaymentMethod(payment_method_id: string, idFromAuth:string, currentPaymentMethod: string | null, user_id_from_body: string) {
        if (idFromAuth !== user_id_from_body) return null
        const detachedPaymentMethod = await this.stripeIAO.detachPaymentMethod(payment_method_id)
        if (currentPaymentMethod === detachedPaymentMethod.id) {
            this.updateDefaultPaymentMethod(null, idFromAuth, user_id_from_body)
        }
        return detachedPaymentMethod
    }

    // this method is used to update the default payment method (credit card) of a customer. it is updated in our DB.
    async updateDefaultPaymentMethod(payment_method_id: string | null, idFromAuth: string, user_id_from_body: string) {
        if (idFromAuth !== user_id_from_body) return null
        return this.paymentDAO.setDefaultPaymentMethodInDB(payment_method_id, idFromAuth)
    }

}