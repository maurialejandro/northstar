import { TestDBSetup } from "../db_tests.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import SubscriptionsDAO from "../../main/data/subscriptionsDAO.ts";
import { instance, mock } from "ts-mockito";
import StripeIAO from "../../main/data/stripeIAO.ts";
import TransactionsService from "../../main/services/transactionsService.ts";
import TransactionsDAO from "../../main/data/transactionsDAO.ts";
import UserDAO from "../../main/data/userDAO.ts";
import { Subscription } from "../../main/types/subscriptionTypes.ts";
import MockDataGenerator from "../mockDataGenerator.ts";

describe('SubscriptionsDAO tests', () => {
    const mockDataGenerator = new MockDataGenerator()
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());
    let myUserId: string;

    const userDao = new UserDAO(supabase, setup.envConfig())

    beforeEach(async () => {
        await setup.loadTestData();
        myUserId = await setup.userId("test1@flavor8.com") as string
        expect(myUserId).not.toBeNull();
    });
    
    it('should validate payment method interactions', async () => {
        const user = await userDao.getUserById(myUserId)
        const idFromAuth = user.id
        const stripeMock = mock(StripeIAO);
        const stripeMockInstance = instance(stripeMock)
        const paymentService = await mockDataGenerator.paymentServiceWithCustomStripeIAO(stripeMockInstance)
        const stripeCurrentPaymentMethodFromAuth = user.stripe_customer_id
        // expect response to be null due to id from body not matching id from auth
        const detachPaymentMethod = await paymentService.detachPaymentMethod('pm id to be detached' as string, idFromAuth, stripeCurrentPaymentMethodFromAuth as string, 'id that comes from body')
        expect(detachPaymentMethod).toBeNull()

        // expect response to be null due to id from body not matching id from auth
        const updateDefaultPaymentMethod = await paymentService.updateDefaultPaymentMethod('pm id to be updated' as string, idFromAuth, 'id that comes from body')
        expect(updateDefaultPaymentMethod).toBeNull()
    })

    it('should post a subscription and upgrade it from silver to gold', async () => {
        const subscriptionsDao = new SubscriptionsDAO(supabase);
        const transactionsDao = new TransactionsDAO(supabase)
        const transactionsService = new TransactionsService(transactionsDao)

        const stripeMockInstance = mockDataGenerator.mockedStripeIAOWithChargeResponse()
        const subscriptionsService = await mockDataGenerator.subscriptionServiceWithCustomStripeIAO(stripeMockInstance)
        // get subscription levels
        const subLevels = await subscriptionsService.getSubscriptionsLevels()
        const gold = subLevels[0]
        const silver = subLevels[1]

        // get user so we get real balance to test
        const user = await userDao.getUserById(myUserId)
        expect(user.current_balance).toBe(1600)
        // posts a subscription to use as the one we upgrade from
        const silverSubscriptionPost = await subscriptionsService.postSubscription({ user_id: myUserId, subscription_level_id: silver.id }, '1', '1', user.current_balance)
        if (!silverSubscriptionPost) {expect(true).toBe('subscription post failed')}
        expect(silverSubscriptionPost?.subscription_levels.level).toBe('silver')
        expect(silverSubscriptionPost?.user_id).toBe(myUserId)
        expect(silverSubscriptionPost?.can_renew).toBe(true)

        // get transactions by buyer id to make sure the subscription charge and credit were posted
        const allTransactions = await transactionsService.getAll()
        expect(allTransactions.data.length).toBe(24)
        const justPostedSubscriptionChargeTransaction = allTransactions.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID1')!
        expect(justPostedSubscriptionChargeTransaction?.amount).toBe(-500)
        expect(justPostedSubscriptionChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubscriptionChargeTransaction?.balance).toBe(user.current_balance)

        const justPostedSubscriptionCreditTransaction = allTransactions.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID1')!
        expect(justPostedSubscriptionCreditTransaction?.amount).toBe(800)
        expect(justPostedSubscriptionCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubscriptionChargeTransaction.id)
        expect(justPostedSubscriptionCreditTransaction?.balance).toBe(user.current_balance + 800)

        // get user again to make sure balance was updated
        const userAfterSubPost = await userDao.getUserById(myUserId)
        expect(userAfterSubPost.current_balance).toBe(user.current_balance + 800)

        // update subscription end date so upgrade looks different
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        const updatedSilverSub = await subscriptionsDao.updateSubscription({ id: silverSubscriptionPost?.id, user_id: myUserId, end_date: nextWeek })!
        expect(updatedSilverSub.can_renew).toBe(true)

        // upgrade subscription to gold
        const goldSubscriptionUpgrade = await subscriptionsService.upgradeSubscription(gold.id, myUserId,'1', '1', userAfterSubPost.current_balance)
        expect(goldSubscriptionUpgrade?.subscription_levels.level).toBe('gold')
        expect(goldSubscriptionUpgrade?.user_id).toBe(myUserId)
        expect(goldSubscriptionUpgrade?.can_renew).toBe(true)

        // all transactions to make sure the upgrade charge and credit were posted
        const allTransactions2 = await transactionsService.getAll()
        const justPostedSubUpgradeChargeTransaction = allTransactions2.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID2')!
        // only pays for 7 days of gold in this case this number will be different depending on the current month we are in period could vary from 28 to 31 days
        // 500 left to a 1000  so 500/31 = 16.12 * 7 = 112.84 and 500/28 = 17.85 * 7 = 124.95
        expect(justPostedSubUpgradeChargeTransaction?.amount).toBeLessThanOrEqual(-111)
        expect(justPostedSubUpgradeChargeTransaction?.amount).toBeGreaterThanOrEqual(-126)
        expect(justPostedSubUpgradeChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubUpgradeChargeTransaction?.balance).toBe(userAfterSubPost.current_balance)

        const justPostedSubUpgradeCreditTransaction = allTransactions2.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID2')!
        // only gets 7 days of credits
        // 1200 left to a 2000 so 1200/31 = 38.7 * 7 = 270.9 and 1200/28 = 42.85 * 7 = 299.95
        expect(justPostedSubUpgradeCreditTransaction?.amount).toBeGreaterThanOrEqual(270)
        expect(justPostedSubUpgradeCreditTransaction?.amount).toBeLessThanOrEqual(300)
        expect(justPostedSubUpgradeCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubUpgradeChargeTransaction.id)
        expect(justPostedSubUpgradeCreditTransaction?.balance).toBeGreaterThanOrEqual(userAfterSubPost.current_balance + 270)
        expect(justPostedSubUpgradeCreditTransaction?.balance).toBeLessThanOrEqual(userAfterSubPost.current_balance + 300)

        // get user again to make sure balance was updated
        const userAfterSubUpgrade = await userDao.getUserById(myUserId)
        expect(userAfterSubUpgrade.current_balance).toBeGreaterThanOrEqual(userAfterSubPost.current_balance +270)
        expect(userAfterSubUpgrade.current_balance).toBeLessThanOrEqual(userAfterSubPost.current_balance +300)

        // get subscription by id to make sure the old one cant be found because it already expired
        const subscriptionsAfterSilverUpdate = await subscriptionsService.getSubscriptionsByBuyerId(myUserId, false)
        const oldBronzeSubAfterSilverUpdate = subscriptionsAfterSilverUpdate.find((subscription) => subscription.id === silverSubscriptionPost?.id)!
        // cant be found because it already expired and endDate is < today
        expect(oldBronzeSubAfterSilverUpdate).not.toBeDefined()

    });

    it('should fail upgrade if payment failed', async () => {
        const transactionsDao = new TransactionsDAO(supabase)
        const transactionsService = new TransactionsService(transactionsDao)

        const stripeMockInstance = mockDataGenerator.mockedStripeIAOWithChargeResponseIncludingFailed()
        const subscriptionsService = await mockDataGenerator.subscriptionServiceWithCustomStripeIAO(stripeMockInstance)
        // get subscription levels
        const subLevels = await subscriptionsService.getSubscriptionsLevels()
        const silver = subLevels[1]
        const bronze = subLevels[2]

        // get user so we get real balance to test
        const user = await userDao.getUserById(myUserId)
        expect(user.current_balance).toBe(1600)
        // posts a subscription to use as the one we upgrade from
        const bronzeSubscriptionPost = await subscriptionsService.postSubscription({ user_id: myUserId, subscription_level_id: bronze.id }, '1', '1', user.current_balance)
        if (!bronzeSubscriptionPost) {expect(true).toBe('subscription post failed')}
        expect(bronzeSubscriptionPost?.subscription_levels.level).toBe('bronze')
        expect(bronzeSubscriptionPost?.user_id).toBe(myUserId)
        expect(bronzeSubscriptionPost?.can_renew).toBe(true)

        // get transactions by buyer id to make sure the subscription charge and credit were posted
        const allTransactions = await transactionsService.getAll()
        expect(allTransactions.data.length).toBe(24)
        const justPostedSubscriptionChargeTransaction = allTransactions.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID1')!
        expect(justPostedSubscriptionChargeTransaction?.amount).toBe(-100)
        expect(justPostedSubscriptionChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubscriptionChargeTransaction?.balance).toBe(user.current_balance)

        const justPostedSubscriptionCreditTransaction = allTransactions.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID1')!
        expect(justPostedSubscriptionCreditTransaction?.amount).toBe(200)
        expect(justPostedSubscriptionCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubscriptionChargeTransaction.id)
        expect(justPostedSubscriptionCreditTransaction?.balance).toBe(user.current_balance + 200)

        // get user again to make sure balance was updated
        const userAfterSubPost = await userDao.getUserById(myUserId)
        expect(userAfterSubPost.current_balance).toBe(user.current_balance + 200)

        // upgrade subscription to silver With failed payment
        const failedSilverSubscriptionUpgrade = await subscriptionsService.upgradeSubscription(silver.id, myUserId,'1', '1', userAfterSubPost.current_balance)
        // returns null because payment failed
        expect(failedSilverSubscriptionUpgrade).toBeNull()

        // get current sub again to make sure it didn't change
        const subscriptionsAfterFailedSilverUpdate = await subscriptionsService.getMostRecentSubscriptionsByBuyerId(myUserId, false)
        expect(subscriptionsAfterFailedSilverUpdate).toMatchObject(bronzeSubscriptionPost as Subscription)

        // get all transactions to make sure that no upgrade charge or credit were posted
        const allTransactions1 = await transactionsService.getAll()
        expect(allTransactions1.data.length).toBe(24)

    });

    it('should post a subscription and upgrade it bronze to silver', async () => {
        const transactionsDao = new TransactionsDAO(supabase)
        const transactionsService = new TransactionsService(transactionsDao)

        const stripeMockInstance = mockDataGenerator.mockedStripeIAOWithChargeResponse()
        const subscriptionsService = await mockDataGenerator.subscriptionServiceWithCustomStripeIAO(stripeMockInstance)
        // get subscription levels
        const subLevels = await subscriptionsService.getSubscriptionsLevels()
        const silver = subLevels[1]
        const bronze = subLevels[2]

        // get user so we get real balance to test
        const user = await userDao.getUserById(myUserId)
        expect(user.current_balance).toBe(1600)
        // posts a subscription to use as the one we upgrade from
        const bronzeSubscriptionPost = await subscriptionsService.postSubscription({ user_id: myUserId, subscription_level_id: bronze.id }, '1', '1', user.current_balance)
        if (!bronzeSubscriptionPost) {expect(true).toBe('subscription post failed')}
        expect(bronzeSubscriptionPost?.subscription_levels.level).toBe('bronze')
        expect(bronzeSubscriptionPost?.user_id).toBe(myUserId)
        expect(bronzeSubscriptionPost?.can_renew).toBe(true)

        // get transactions by buyer id to make sure the subscription charge and credit were posted
        const allTransactions = await transactionsService.getAll()
        expect(allTransactions.data.length).toBe(24)
        const justPostedSubscriptionChargeTransaction = allTransactions.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID1')!
        expect(justPostedSubscriptionChargeTransaction?.amount).toBe(-100)
        expect(justPostedSubscriptionChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubscriptionChargeTransaction?.balance).toBe(user.current_balance)

        const justPostedSubscriptionCreditTransaction = allTransactions.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID1')!
        expect(justPostedSubscriptionCreditTransaction?.amount).toBe(200)
        expect(justPostedSubscriptionCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubscriptionChargeTransaction.id)
        expect(justPostedSubscriptionCreditTransaction?.balance).toBe(user.current_balance + 200)

        // get user again to make sure balance was updated
        const userAfterSubPost = await userDao.getUserById(myUserId)
        expect(userAfterSubPost.current_balance).toBe(user.current_balance + 200)

        // upgrade subscription to silver
        const silverSubscriptionUpgrade = await subscriptionsService.upgradeSubscription(silver.id, myUserId,'1', '1', userAfterSubPost.current_balance)
        expect(silverSubscriptionUpgrade?.subscription_levels.level).toBe('silver')
        expect(silverSubscriptionUpgrade?.user_id).toBe(myUserId)
        expect(silverSubscriptionUpgrade?.can_renew).toBe(true)

        // all transactions to make sure the upgrade charge and credit were posted
        const allTransactions2 = await transactionsService.getAll()
        const justPostedSubUpgradeChargeTransaction = allTransactions2.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID2')!
        // silver charge is 500 minus 100 from bronze = 400
        expect(justPostedSubUpgradeChargeTransaction?.amount).toBe(-400)
        expect(justPostedSubUpgradeChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubUpgradeChargeTransaction?.balance).toBe(userAfterSubPost.current_balance)

        const justPostedSubUpgradeCreditTransaction = allTransactions2.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID2')!
        // silver credit is 800 minus 200 from bronze = 600
        expect(justPostedSubUpgradeCreditTransaction?.amount).toBe(600)
        expect(justPostedSubUpgradeCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubUpgradeChargeTransaction.id)
        expect(justPostedSubUpgradeCreditTransaction?.balance).toBe(userAfterSubPost.current_balance + 600)

        // get user again to make sure balance was updated
        const userAfterSubUpgrade = await userDao.getUserById(myUserId)
        expect(userAfterSubUpgrade.current_balance).toBe(userAfterSubPost.current_balance + 600)

        // get subscription by id to make sure the old one cant be found because it already expired
        const subscriptionsAfterSilverUpdate = await subscriptionsService.getSubscriptionsByBuyerId(myUserId, false)
        const oldBronzeSubAfterSilverUpdate = subscriptionsAfterSilverUpdate.find((subscription) => subscription.id === bronzeSubscriptionPost?.id)!
        // cant be found because it already expired and endDate is < today
        expect(oldBronzeSubAfterSilverUpdate).not.toBeDefined()

    });

    it('fails when downgrade from gold to silver is attempted', async () => {
        const transactionsDao = new TransactionsDAO(supabase)
        const transactionsService = new TransactionsService(transactionsDao)

        const stripeMockInstance = mockDataGenerator.mockedStripeIAOWithChargeResponse()
        const subscriptionsService = await mockDataGenerator.subscriptionServiceWithCustomStripeIAO(stripeMockInstance)
        // get subscription levels
        const subLevels = await subscriptionsService.getSubscriptionsLevels()
        const gold = subLevels[0]
        const silver = subLevels[1]

        // get user so we get real balance to test
        const user = await userDao.getUserById(myUserId)
        expect(user.current_balance).toBe(1600)
        // posts a gold subscription
        const goldSubscriptionPost = await subscriptionsService.postSubscription({ user_id: myUserId, subscription_level_id: gold.id }, '1', '1', user.current_balance)
        if (!goldSubscriptionPost) {expect(true).toBe('subscription post failed')}
        expect(goldSubscriptionPost?.subscription_levels.level).toBe('gold')
        expect(goldSubscriptionPost?.user_id).toBe(myUserId)
        expect(goldSubscriptionPost?.can_renew).toBe(true)

        // get transactions by buyer id to make sure the subscription charge and credit were posted
        const allTransactions = await transactionsService.getAll()
        expect(allTransactions.data.length).toBe(24)
        const justPostedSubscriptionChargeTransaction = allTransactions.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID1')!
        expect(justPostedSubscriptionChargeTransaction?.amount).toBe(-1000)
        expect(justPostedSubscriptionChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubscriptionChargeTransaction?.balance).toBe(user.current_balance)

        const justPostedSubscriptionCreditTransaction = allTransactions.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID1')!
        expect(justPostedSubscriptionCreditTransaction?.amount).toBe(2000)
        expect(justPostedSubscriptionCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubscriptionChargeTransaction.id)
        expect(justPostedSubscriptionCreditTransaction?.balance).toBe(user.current_balance + 2000)

        // get user again to make sure balance was updated
        const userAfterSubPost = await userDao.getUserById(myUserId)
        expect(userAfterSubPost.current_balance).toBe(user.current_balance + 2000)

        // upgrade subscription to silver expected t
        const silverSubscriptionUpgrade = await subscriptionsService.upgradeSubscription(silver.id, myUserId,'1', '1', userAfterSubPost.current_balance)
        expect(silverSubscriptionUpgrade).toBeNull()

    });

    it('should post a subscription from bronze to gold directly', async () => {
        const subscriptionsDao = new SubscriptionsDAO(supabase);
        const transactionsDao = new TransactionsDAO(supabase)
        const transactionsService = new TransactionsService(transactionsDao)

        const stripeMockInstance = mockDataGenerator.mockedStripeIAOWithChargeResponse()
        const subscriptionsService = await mockDataGenerator.subscriptionServiceWithCustomStripeIAO(stripeMockInstance)
        // get subscription levels
        const subLevels = await subscriptionsService.getSubscriptionsLevels()
        const gold = subLevels[0]
        const bronze = subLevels[2]

        // get user so we get real balance to test
        const user = await userDao.getUserById(myUserId)
        expect(user.current_balance).toBe(1600)
        // posts a bronze subscription
        const bronzeSubscriptionPost = await subscriptionsService.postSubscription({ user_id: myUserId, subscription_level_id: bronze.id }, '1', '1', user.current_balance)
        if (!bronzeSubscriptionPost) {expect(true).toBe('subscription post failed')}
        expect(bronzeSubscriptionPost?.subscription_levels.level).toBe('bronze')
        expect(bronzeSubscriptionPost?.user_id).toBe(myUserId)
        expect(bronzeSubscriptionPost?.can_renew).toBe(true)

        // get transactions by buyer id to make sure the subscription charge and credit were posted
        const allTransactions = await transactionsService.getAll()
        expect(allTransactions.data.length).toBe(24)
        const justPostedSubscriptionChargeTransaction = allTransactions.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID1')!
        expect(justPostedSubscriptionChargeTransaction?.amount).toBe(-100)
        expect(justPostedSubscriptionChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubscriptionChargeTransaction?.balance).toBe(user.current_balance)

        const justPostedSubscriptionCreditTransaction = allTransactions.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID1')!
        expect(justPostedSubscriptionCreditTransaction?.amount).toBe(200)
        expect(justPostedSubscriptionCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubscriptionChargeTransaction.id)
        expect(justPostedSubscriptionCreditTransaction?.balance).toBe(user.current_balance + 200)

        // get user again to make sure balance was updated
        const userAfterSubPost = await userDao.getUserById(myUserId)
        expect(userAfterSubPost.current_balance).toBe(user.current_balance + 200)

        // upgrade subscription to gold
        const goldSubscriptionUpgrade = await subscriptionsService.upgradeSubscription(gold.id, myUserId,'1', '1', userAfterSubPost.current_balance)
        expect(goldSubscriptionUpgrade?.subscription_levels.level).toBe('gold')
        expect(goldSubscriptionUpgrade?.user_id).toBe(myUserId)
        expect(goldSubscriptionUpgrade?.can_renew).toBe(true)

        // all transactions to make sure the upgrade charge and credit were posted
        const allTransactions2 = await transactionsService.getAll()
        const justPostedSubUpgradeChargeTransaction = allTransactions2.data.find((transaction) => transaction.id === 'chargeStripeMockPaymentID2')!
        // gold charge is 1000 minus 100 from bronze = 900
        expect(justPostedSubUpgradeChargeTransaction?.amount).toBe(-900)
        expect(justPostedSubUpgradeChargeTransaction?.refers_to_transaction_id).toBeNull()
        expect(justPostedSubUpgradeChargeTransaction?.balance).toBe(userAfterSubPost.current_balance)

        const justPostedSubUpgradeCreditTransaction = allTransactions2.data.find((transaction) => transaction.id === 'creditStripeMockPaymentID2')!
        // gold credit is 2000 minus 200 from bronze = 600
        expect(justPostedSubUpgradeCreditTransaction?.amount).toBe(1800)
        expect(justPostedSubUpgradeCreditTransaction?.refers_to_transaction_id).toBe(justPostedSubUpgradeChargeTransaction.id)
        expect(justPostedSubUpgradeCreditTransaction?.balance).toBe(userAfterSubPost.current_balance + 1800)

        // get user again to make sure balance was updated
        const userAfterSubUpgrade = await userDao.getUserById(myUserId)
        expect(userAfterSubUpgrade.current_balance).toBe(userAfterSubPost.current_balance + 1800)

        // get subscription by id to make sure the old one cant be found because it already expired
        const subscriptionsAfterUpdate = await subscriptionsService.getSubscriptionsByBuyerId(myUserId, false)
        const oldBronzeSubAfterUpdate = subscriptionsAfterUpdate.find((subscription) => subscription.id === bronzeSubscriptionPost?.id)!
        // cant be found because it already expired and endDate is < today
        expect(oldBronzeSubAfterUpdate).not.toBeDefined()

        // update subscription end date, so that we keep using the one in the seeder
        const updatedGoldSub = await subscriptionsDao.updateSubscription({ id: goldSubscriptionUpgrade?.id, user_id: myUserId, end_date: new Date(), can_renew: false })!
        expect(updatedGoldSub.can_renew).toBe(false)

        // get subscription by id to make sure we end up using the one in the seeder
        const subscriptionsAfterGoldUpdate = await subscriptionsService.getSubscriptionsByBuyerId(myUserId, false)
        // only the one in the seeder should be found, the rest are expired
        expect(subscriptionsAfterGoldUpdate.length).toBe(1)
        expect(subscriptionsAfterGoldUpdate[0].id).toBe('123e4567-e89a-12d3-b456-226600000702')

    });

});