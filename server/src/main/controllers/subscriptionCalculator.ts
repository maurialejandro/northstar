import { injectable } from "tsyringe";
import { SubscriptionLevel } from "../types/subscriptionTypes.ts";

@injectable()
export default class SubscriptionsCalculator {

    calculateUpgradeChargeAndCredits(
        currentSub: Partial<SubscriptionLevel> & { charge:number, credit:number },
        newSub: Partial<SubscriptionLevel> & { charge:number, credit:number },
        subscriptionPeriod:{ period: number; daysLeft: number; daysPassed: number }
    ) {
        // calculate the amount of charge
        const prevSubChargeDayWorth = currentSub.charge / subscriptionPeriod.period;
        const chargeRefundAmount = prevSubChargeDayWorth * subscriptionPeriod.daysLeft;
        const newSubChargeDayWorth = newSub.charge / subscriptionPeriod.period;
        const chargeAmount = newSubChargeDayWorth * subscriptionPeriod.daysLeft;
        const upgradeCharge = chargeAmount - chargeRefundAmount;
        // calculate the amount of credits
        const prevSubCreditDayWorth = currentSub.credit / subscriptionPeriod.period;
        const creditRefundAmount = prevSubCreditDayWorth * subscriptionPeriod.daysLeft;
        const newSubCreditDayWorth = newSub.credit / subscriptionPeriod.period;
        const creditAmount = newSubCreditDayWorth * subscriptionPeriod.daysLeft;
        const upgradeCredit = creditAmount - creditRefundAmount;

        // charge will be rounded in stripeIAO, and has to be manually rounded before being sent to our DB, credit is rounded here.
        return { charge: upgradeCharge, credit: Math.ceil(upgradeCredit) };
    }

    // calculates the subscription period in days, and the days left and passed
    calculateSubscriptionPeriod(endDate: Date): { period: number; daysLeft: number; daysPassed: number } {
        const oneDay: number = 24 * 60 * 60 * 1000; // One day in milliseconds

        const today: Date = new Date(); // Get the current date
        const startDate: Date = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 1); // Subtract one month

        const diffDays: number = Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
        const daysPassed: number = Math.floor((today.getTime() - startDate.getTime()) / oneDay);
        const daysLeft: number = Math.ceil((endDate.getTime() - today.getTime()) / oneDay);

        return {
            // period is the number of days in the current subscription period (15/6/2021 - 15/7/2021)
            period: diffDays,
            // daysLeft is the number of days left in the current subscription period (today - 15/7/2021)
            daysLeft,
            // daysPassed is the number of days passed in the current subscription period (15/6/2021 - today)
            daysPassed,
        };
    }

}