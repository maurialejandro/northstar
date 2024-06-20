import SubscriptionsDAO from '../data/subscriptionsDAO';
import { injectable } from "tsyringe";
import { Subscription, SubscriptionLevel } from "../types/subscriptionTypes.ts";
import PaymentService from "./paymentService.ts";
import TransactionService from "./transactionsService.ts";
import { centsToDollars, dollarsToCents } from "../data/stripeIAO.ts";
import SubscriptionsCalculator from "../controllers/subscriptionCalculator.ts";

@injectable()
export default class SubscriptionsService {

    constructor(
        private readonly subscriptionsDAO: SubscriptionsDAO,
        private readonly paymentService: PaymentService,
        private readonly transactionService: TransactionService,
        private readonly subscriptionsCalculator: SubscriptionsCalculator
    ) {}

    // returns an array of Subscriptions
    async getAll(
        fromDate = '',
        toDate = ''
    ): Promise<Subscription[]> {
        return await this.subscriptionsDAO.getAll(fromDate, toDate);
    }

    async getSubscriptionsByBuyerId(user_id: string, excludeCantRenew: boolean) {
        return await this.subscriptionsDAO.getAllSubscriptionsByBuyerId(user_id, excludeCantRenew)
    }

    async getMostRecentSubscriptionsByBuyerId(authenticatedUserId: string, excludeCantRenew: boolean) {
        const subscriptions = await this.subscriptionsDAO.getAllSubscriptionsByBuyerId(authenticatedUserId, excludeCantRenew)
        const today = new Date();
        // Sort the subscriptions based on the absolute difference between start_date and today's date
        // The first element in the sorted array will have the closest start_date to today
        const sortedSubscriptions = subscriptions.sort((a, b) =>
            Math.abs(today.getTime() - new Date(a.start_date).getTime()) -
            Math.abs(today.getTime() - new Date(b.start_date).getTime())
        );
        return sortedSubscriptions[0] ?? null;
    }

    // needs data.user_id because its authenticated on DAO so it can only update subscriptions that belong to the user
    async updateSubscription(data:Partial<Subscription>): Promise<Subscription | null> {
        return await this.subscriptionsDAO.updateSubscription(data);
    }

    // posts a subscription by user_id and subscription_level_id data comes from req.user so a user can post only his subscription
    async postSubscription(data:Partial<Subscription>, stripe_customer_id:string, stripe_payment_method_id: string, balance:number): Promise<Subscription | null> {
        const subscriptionLevel = await this.getSubscriptionsLevelById(data.subscription_level_id as string)
        if (!subscriptionLevel) return null
        const charge = await this.chargeSubscription(
            data.user_id as string,
            stripe_customer_id,
            stripe_payment_method_id,
            subscriptionLevel.charge,
            subscriptionLevel.credit,
            subscriptionLevel.level,
            balance
        );
        if (!charge) return null
        const today = new Date();
        // Date with today's date + 1 month
        const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
        // data has user_id and subscription_level_id
        return await this.subscriptionsDAO.postSubscription({ ...data, start_date: new Date(), end_date: nextMonth });
    }

    // Will pause current subscription, set end_date to yesterday and create a new one
    // The new one will start today and end the same date the previous was going to end, charging the user a difference
    async upgradeSubscription(next_subscription_level_id : string, user_id: string, stripe_customer_id:string, stripe_payment_method_id: string, balance:number): Promise<Subscription | null> {
        const today = new Date();
        const yesterday = new Date(today.setDate(today.getDate() - 1));

        // get previous subscription end date
        const previousSub = await this.getMostRecentSubscriptionsByBuyerId(user_id, false)

        if (previousSub) {
            const end_date = new Date(previousSub.end_date)

            // calculate subscription period
            const subscriptionPeriod = this.subscriptionsCalculator.calculateSubscriptionPeriod(new Date(end_date))
            const currentSub = previousSub.subscription_levels
            const newSub = await this.getSubscriptionsLevelById(next_subscription_level_id)
            // remove this line and add logic if we want to allow downgrades
            if (newSub.charge < currentSub.charge) return null
            const upgradeChargeAndCredits = this.subscriptionsCalculator.calculateUpgradeChargeAndCredits(currentSub, newSub, subscriptionPeriod)
            const chargeUpgrade = await this.paymentService.chargeCustomer(stripe_customer_id ,stripe_payment_method_id, upgradeChargeAndCredits.charge)
            if (chargeUpgrade.status !== 'succeeded') return null
            const chargeTransaction = await this.transactionService.postTransaction({
                user_id,
                balance,
                type: newSub.level as 'bronze' | 'silver' | 'gold',
                stripe_transaction_id: chargeUpgrade.id,
                id:'charge'+chargeUpgrade.id,
                amount: centsToDollars(dollarsToCents(upgradeChargeAndCredits.charge)) * -1
            })
            const creditTransaction = await this.transactionService.postTransaction({
                user_id,
                balance: balance + upgradeChargeAndCredits.credit,
                type: 'subscription-credits',
                refers_to_transaction_id: 'charge'+chargeUpgrade.id,
                id:'credit'+chargeUpgrade.id,
                amount: upgradeChargeAndCredits.credit
            })
            if (!chargeTransaction || !creditTransaction) return null
            await this.updateSubscription({ id:previousSub.id, can_renew:false, user_id, end_date: yesterday });
            return await this.subscriptionsDAO.postSubscription({ subscription_level_id: next_subscription_level_id, user_id, start_date: new Date(), end_date })
        } else {
            return null
        }
    }

    // this belongs in PaymentService. Doing it here to avoid conflicts atm
    // think of better return types one for charge error, another for transaction error, another for success
    // returns true if charge and transaction are successful
    async chargeSubscription(user_id:string, stripe_customer_id:string, payment_method_id:string, charge_amount:number, credit:number, level:string, balance: number): Promise<boolean> {
        try {
            const charge = await this.paymentService.chargeCustomer(stripe_customer_id ,payment_method_id, charge_amount)
            if (charge.status === 'succeeded') {
                const transactionData = {
                    user_id,
                    type:level as 'bronze' | 'silver' | 'gold',
                    balance
                }
                const chargeTransaction = await this.transactionService.postTransaction(
                    { ...transactionData, stripe_transaction_id: charge.id, id:'charge'+charge.id, amount: charge_amount * -1 }
                )
                const creditTransaction = await this.transactionService.postTransaction(
                    { ...transactionData, balance: balance + credit, type: 'subscription-credits', refers_to_transaction_id: 'charge'+charge.id, id:'credit'+charge.id, amount: credit }
                )
                if (chargeTransaction && creditTransaction){
                    return true
                }
            }
            return false
        } catch {
            return false
        }
    }

    // subscription levels stuff

    async getSubscriptionsLevels(): Promise<SubscriptionLevel[]> {
        return await this.subscriptionsDAO.getSubscriptionsLevels();
    }

    // gets a subscription level by subscription level id
    async getSubscriptionsLevelById(id:string): Promise<SubscriptionLevel> {
        return await this.subscriptionsDAO.getSubscriptionsLevelById(id);
    }

    // gets upgrade price and credits, and subscription period
    async getUpgradePrice(user_id:string) {
        // get current subscription
        const currentSubscription = await this.getMostRecentSubscriptionsByBuyerId(user_id, false)
        const endDate = currentSubscription.end_date
        // calculate subscription period
        const subscriptionPeriod = this.subscriptionsCalculator.calculateSubscriptionPeriod(new Date(endDate))
        const currentSub = currentSubscription.subscription_levels
        // get all sub levels
        const subscriptionLevels = await this.getSubscriptionsLevels()
        // order levels by charge, bronze => silver => gold
        const sortedSubscriptions = subscriptionLevels.sort((a, b) => a.charge - b.charge);
        // Find the index of the current subscription
        const currentIndex = sortedSubscriptions.findIndex(sub => sub.level === currentSub.level);
        let nextSub : SubscriptionLevel
        // If the current subscription is Gold or not found, return it (as it's the highest)
        if (currentIndex === sortedSubscriptions.length - 1 || currentIndex === -1) {
            nextSub = sortedSubscriptions[sortedSubscriptions.length - 1];
        } else {
            // Return the next subscription based on the index
            nextSub = sortedSubscriptions[currentIndex + 1];
        }

        const upgradeChargeAndCredits = this.subscriptionsCalculator.calculateUpgradeChargeAndCredits(currentSub, nextSub, subscriptionPeriod)

        return {
            subscriptionPeriod,
            upgradeChargeAndCredits
        }

    }

}