import { injectable } from "tsyringe";
import SubscriptionsService from "../services/subscriptionService.ts";
import SendGridIAO from "../data/sendGridIAO.ts";
import { emailGenerator } from "../middleware/emailGenerator.ts";
import PaymentService from "../services/paymentService.ts";
@injectable()
export default class SubscriptionMaintenanceJob {
    constructor(private subscriptionsService: SubscriptionsService, private sendGridIAO : SendGridIAO, private readonly paymentService: PaymentService) {}

    // gets all subscriptions that will expire in the next 48 hours or that already expired
    getSoonToExpireSubscriptions = async () => {
        const now = new Date();
        const next48Hours = new Date();
        next48Hours.setHours(now.getHours() + 48);
        return await this.subscriptionsService.getAll('', next48Hours.toISOString());
    }

    run = async () => {
        const soonToExpireSubs = await this.getSoonToExpireSubscriptions();
        if (!soonToExpireSubs){return}
        // using for of loop to avoid async issues
        for (const sub of soonToExpireSubs) {
            const charge = await this.subscriptionsService.chargeSubscription(sub.user_id, sub.users.stripe_customer_id!, sub.users.stripe_payment_method_id!, sub.subscription_levels.charge, sub.subscription_levels.credit, sub.subscription_levels.level, sub.users.current_balance);
            // if charge is successful, update subscription end date else send emails to both buyer and admin
            if (charge) {
                const originalDate = new Date(sub.end_date);
                const nextMonthDate = new Date(originalDate);
                // Add one month
                nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() + 1);
                // Check if the next month's day is less than the current day
                if (nextMonthDate.getUTCDate() < originalDate.getUTCDate()) {
                    // Roll back to the last day of the current month
                    nextMonthDate.setUTCDate(0);
                }
                // Handle December 31st
                if (originalDate.getUTCMonth() === 11 && nextMonthDate.getUTCMonth() === 0) {
                    // Adjust to January 31st
                    nextMonthDate.setUTCFullYear(nextMonthDate.getUTCFullYear() + 1);
                    nextMonthDate.setUTCDate(31);
                }
                // Update subscription end date
                await this.subscriptionsService.updateSubscription({ id: sub.id, end_date: nextMonthDate, user_id: sub.user_id });
            } else {
                // mail both buyer and admin with the card that failed
                // TODO Pause subscription?
                const defaultPaymentMethod = await this.paymentService.getDefaultPaymentMethod(sub.users.stripe_payment_method_id!)
                await this.sendGridIAO.sendEmail(emailGenerator.rejectedCardForBuyer(sub.users, defaultPaymentMethod.card!))
                await this.sendGridIAO.sendEmail(emailGenerator.rejectedCardForAdmin(sub.users, defaultPaymentMethod.card!))
            }
            console.log({ charge });
        }
    }
}