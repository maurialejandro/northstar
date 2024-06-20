import { TestDBSetup } from "../db_tests.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import SubscriptionsDAO from "../../main/data/subscriptionsDAO.ts";
import { centsToDollars, dollarsToCents } from "../../main/data/stripeIAO.ts";
import SubscriptionsCalculator from "../../main/controllers/subscriptionCalculator.ts";

describe('SubscriptionsDAO tests', () => {
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());
    let myUserId: string;
    const dao = new SubscriptionsDAO(supabase);

    beforeAll(async () => {
        await setup.loadTestData();
        myUserId = await setup.userId("test1@flavor8.com") as string
        expect(myUserId).not.toBeNull();
    });

    describe('getAll', () => {

        it('should filter by date', async () => {
            const now = new Date();
            const next48Hours = new Date();
            next48Hours.setHours(now.getHours() + 744);
            const subEndingInTheFuture = '123e4567-e89a-12d3-b456-226600000702'
            const resp = await dao.getAll('', next48Hours.toISOString());
            expect(resp.map(e=>e.id)).not.toContain(subEndingInTheFuture);
            expect(resp.length).toBe(2);
        });

    });

    describe('subscription workflow', () => {

        it('should create subscriptions successfully', async () => {
            // gets sub levels
            const sub_levels = await dao.getSubscriptionsLevels();
            expect(sub_levels).not.toBeNull();
            expect(sub_levels.length).toBe(3);
            // first level is gold because it's ordered by charge => gold, silver, bronze
            expect(sub_levels[0].level).toBe('gold');
            expect(sub_levels[1].level).toBe('silver');
            // testing get by id
            const subscriptionLevelById = await dao.getSubscriptionsLevelById(sub_levels[0].id);
            expect(subscriptionLevelById.level).toBe('gold');
            const today = new Date();
            const resp = await dao.postSubscription({ user_id: myUserId, subscription_level_id: sub_levels[0].id, end_date: today });
            expect(resp).not.toBeNull();
            const resp1 = await dao.getAllSubscriptionsByBuyerId(myUserId, true);
            expect(resp1).not.toBeNull();
            expect(resp1[0].user_id).toBe(myUserId);
            expect(resp1[0].subscription_level_id).toBe(sub_levels[0].id);
        })

        it('should get by id and update subscriptions successfully', async () => {
            // gets sub levels
            const sub_levels = await dao.getSubscriptionsLevels();
            const resp = await dao.getAllSubscriptionsByBuyerId(myUserId);
            expect(resp).not.toBeNull();

            // endDate to tomorrows date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            // update end date
            const resp1 = await dao.updateSubscription({ id:resp[0].id, end_date: tomorrow, user_id: myUserId });
            expect(resp[0].end_date === resp1.end_date).toBe(false);
            const resp2 = await dao.getAllSubscriptionsByBuyerId(myUserId);
            expect(resp2[0].end_date).toBe(resp1.end_date);
            // update so it cant renew
            const resp3 = await dao.updateSubscription({ id:resp[0].id, can_renew: false, user_id: myUserId });
            expect(resp[0].can_renew).not.toBe(resp3.can_renew);
            // should not be gettable
            const resp4 = await dao.getAllSubscriptionsByBuyerId(myUserId, true);
            // this should be null because it is not renewable
            expect(resp4.length).toBe(0);
            // create another subscription
            const resp6 = await dao.postSubscription({ user_id: myUserId, subscription_level_id: sub_levels[0].id, end_date: tomorrow });
            expect(resp6).not.toBeNull();
            // get the one we just created that can renew
            const resp7 = await dao.getAllSubscriptionsByBuyerId(myUserId);
            expect(resp7).not.toBeNull();
            expect(resp7[1].id).toBe(resp6.id);
            // get ones that can renew and also the ones that cant. end_date has to be end_date > today
            const resp8 = await dao.getAllSubscriptionsByBuyerId(myUserId, false);
            expect(resp8.length).toBe(2)

            // endDate to tomorrows date
            const resp9 = await dao.updateSubscription({ id:resp7[0].id, end_date: tomorrow, user_id: myUserId });
            expect(resp9).not.toBeNull();

            // get only the ones that can renew and end_date > today
            const resp10 = await dao.getAllSubscriptionsByBuyerId(myUserId, true);
            expect(resp10.length).toBe(1)
            expect(resp10[0].can_renew).toBe(true)

        });
    });

    describe('subscription functions', () => {
        it('should calculate subscription period and get upgrade charge & credits', async () => {
            const calc = new SubscriptionsCalculator()
            // I want to test one date of each month
            const january = new Date("2023-01-14");
            const subscriptionDaysJanuary = calc.calculateSubscriptionPeriod(january);
            expect(subscriptionDaysJanuary.period).toBe(31)

            const february = new Date("2023-02-14");
            const subscriptionDaysFebruary = calc.calculateSubscriptionPeriod(february);
            expect(subscriptionDaysFebruary.period).toBe(31)

            const march = new Date("2023-03-14");
            const subscriptionDaysMarch = calc.calculateSubscriptionPeriod(march);
            expect(subscriptionDaysMarch.period).toBe(28)

            const april = new Date("2023-04-14");
            const subscriptionDaysApril = calc.calculateSubscriptionPeriod(april);
            expect(subscriptionDaysApril.period).toBe(31)

            const may = new Date("2023-05-14");
            const subscriptionDaysMay = calc.calculateSubscriptionPeriod(may);
            expect(subscriptionDaysMay.period).toBe(30)

            const june = new Date("2023-06-14");
            const subscriptionDaysJune = calc.calculateSubscriptionPeriod(june);
            expect(subscriptionDaysJune.period).toBe(31)

            const july = new Date("2023-07-14");
            const subscriptionDaysJuly = calc.calculateSubscriptionPeriod(july);
            expect(subscriptionDaysJuly.period).toBe(30)

            const august = new Date("2023-08-14");
            const subscriptionDaysAugust = calc.calculateSubscriptionPeriod(august);
            expect(subscriptionDaysAugust.period).toBe(31)

            const september = new Date("2023-09-14");
            const subscriptionDaysSeptember = calc.calculateSubscriptionPeriod(september);
            expect(subscriptionDaysSeptember.period).toBe(31)

            const october = new Date("2023-10-14");
            const subscriptionDaysOctober = calc.calculateSubscriptionPeriod(october);
            expect(subscriptionDaysOctober.period).toBe(30)

            const november = new Date("2023-11-14");
            const subscriptionDaysNovember = calc.calculateSubscriptionPeriod(november);
            expect(subscriptionDaysNovember.period).toBe(31)

            const december = new Date("2023-12-14");
            const subscriptionDaysDecember = calc.calculateSubscriptionPeriod(december);
            expect(subscriptionDaysDecember.period).toBe(30)

            const today = new Date();
            const subscriptionDays = calc.calculateSubscriptionPeriod(today);
            expect(subscriptionDays.period).toBeGreaterThanOrEqual(28)
            expect(subscriptionDays.period).toBeLessThanOrEqual(31)
            expect(subscriptionDays.daysLeft + subscriptionDays.daysPassed).toBe(subscriptionDays.period)
            expect(subscriptionDays.daysLeft).toBe(0)

            const sub_levels = await dao.getSubscriptionsLevels();
            const gold = sub_levels[0]
            const silver = sub_levels[1]
            const upgradeCharge = calc.calculateUpgradeChargeAndCredits(silver, gold, subscriptionDays)
            //credit should be rounded, charge should not be rounded (but could be if the math works out that way)
            expect(upgradeCharge.credit).toBe(Math.round(upgradeCharge.credit))
            expect(upgradeCharge.charge).toBe(0)

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const subscriptionDaysTomorrow = calc.calculateSubscriptionPeriod(tomorrow);
            expect(subscriptionDaysTomorrow.daysLeft).toBe(1)
            expect(subscriptionDaysTomorrow.daysPassed).toBe(subscriptionDaysTomorrow.period - 1)

            const upgradeChargeTomorrow = calc.calculateUpgradeChargeAndCredits(silver, gold, subscriptionDaysTomorrow)
            expect(upgradeChargeTomorrow.credit).toBeGreaterThanOrEqual(Math.ceil(silver.credit / subscriptionDaysTomorrow.period))
            expect(upgradeChargeTomorrow.credit).toBeLessThanOrEqual(Math.ceil(gold.credit / subscriptionDaysTomorrow.period))
            expect(upgradeChargeTomorrow.charge).toBeGreaterThanOrEqual(silver.charge / subscriptionDaysTomorrow.period)
            expect(upgradeChargeTomorrow.charge).toBeLessThanOrEqual(gold.charge / subscriptionDaysTomorrow.period)

            const aWeekFromToday = new Date();
            aWeekFromToday.setDate(aWeekFromToday.getDate() + 7);
            const subscriptionDaysAWeekFromToday = calc.calculateSubscriptionPeriod(aWeekFromToday);
            expect(subscriptionDaysAWeekFromToday.daysLeft).toBe(7)
            expect(subscriptionDaysAWeekFromToday.daysPassed).toBe(subscriptionDaysAWeekFromToday.period - 7)

            const upgradeChargeAWeekFromToday = calc.calculateUpgradeChargeAndCredits(silver, gold, subscriptionDaysAWeekFromToday)
            expect(upgradeChargeAWeekFromToday.credit).toBeGreaterThanOrEqual(Math.ceil(silver.credit / subscriptionDaysAWeekFromToday.period) * 7)
            expect(upgradeChargeAWeekFromToday.credit).toBeLessThanOrEqual(Math.ceil(gold.credit / subscriptionDaysAWeekFromToday.period) * 7)
            expect(upgradeChargeAWeekFromToday.charge).toBeGreaterThanOrEqual((silver.charge / subscriptionDaysAWeekFromToday.period) * 7)
            expect(upgradeChargeAWeekFromToday.charge).toBeLessThanOrEqual((gold.charge / subscriptionDaysAWeekFromToday.period) * 7)
            
            const threeWeeksFromToday = new Date();
            threeWeeksFromToday.setDate(threeWeeksFromToday.getDate() + 21);
            const subscriptionDaysThreeWeeksFromToday = calc.calculateSubscriptionPeriod(threeWeeksFromToday);
            expect(subscriptionDaysThreeWeeksFromToday.daysLeft).toBe(21)
            expect(subscriptionDaysThreeWeeksFromToday.daysPassed).toBe(subscriptionDaysThreeWeeksFromToday.period - 21)

            const upgradeChargeThreeWeeksFromToday = calc.calculateUpgradeChargeAndCredits(silver, gold, subscriptionDaysThreeWeeksFromToday)
            expect(upgradeChargeThreeWeeksFromToday.credit).toBeGreaterThanOrEqual(Math.ceil(silver.credit / subscriptionDaysThreeWeeksFromToday.period) * 21)
            expect(upgradeChargeThreeWeeksFromToday.credit).toBeLessThanOrEqual(Math.ceil(gold.credit / subscriptionDaysThreeWeeksFromToday.period) * 21)
            expect(upgradeChargeThreeWeeksFromToday.charge).toBeGreaterThanOrEqual((silver.charge / subscriptionDaysThreeWeeksFromToday.period) * 21)
            expect(upgradeChargeThreeWeeksFromToday.charge).toBeLessThanOrEqual((gold.charge / subscriptionDaysThreeWeeksFromToday.period) * 21)
        })

        it('should convert cents and dollars', async () => {
            const dollar1 = 48
            const cents1 = dollarsToCents(dollar1)
            expect(cents1).toBe(4800)
            expect(centsToDollars(cents1)).toBe(dollar1)
            expect(dollarsToCents(centsToDollars(cents1))).toBe(cents1)

            const dollar2 = 23.4531251354
            const cents2 = dollarsToCents(dollar2)
            expect(cents2).toBe(2300)
            expect(centsToDollars(cents2)).toBe(23)
            expect(dollarsToCents(centsToDollars(cents2))).toBe(cents2)

            expect(() => {
                centsToDollars(1234)
            }).toThrow()
        })
    })

});
