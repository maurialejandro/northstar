import { ApiTests, Method, UserLevel } from "../resource_tests.ts";
import TransactionsDAO from "../../main/data/transactionsDAO.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import { TestDBSetup } from "../db_tests.ts";
import { Transaction, CreditCardTransactionTypes } from "../../main/types/transactionType.ts";

const apiTests = new ApiTests();
const testBuyer01WithNoSubId = '123e4567-e89a-12d3-b456-226600000204'
const testBuyer02WithSubId = '123e4567-e89a-12d3-b456-226600000205'
const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const endOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

const setup = new TestDBSetup();
const supabase = new SupabaseWrapper(setup.supabase());
const transactionsDAO = new TransactionsDAO(supabase);

describe("Get Budget Remaining and Change budget", () => { 

    beforeEach(async () => { 
        await apiTests.loadTestData();
  })

    apiTests.testAuth("/api/buyers/budget/get-remaining", false, Method.GET);
    apiTests.testAuth(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, true, Method.GET);

    it("can get budget card props as USER", async () => { 
        const originalBudget = await apiTests.callApi("/api/buyers/budget/get-remaining", Method.GET, UserLevel.USER);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(300);
        expect(originalBudget.body.budgetPercentUsed).toBe(80);
  })

    it("can get budget card props as ADMIN", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1500);
        expect(originalBudget.body.budgetPercentUsed).toBe(0);
  })

    it("can update budget as USER", async () => { 
        const originalBudget = await apiTests.callApi("/api/buyers/budget/get-remaining", Method.GET, UserLevel.USER);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(300);
        expect(originalBudget.body.budgetPercentUsed).toBe(80);
        const updateUserBudget = await apiTests.callApi("/api/buyers/budget/update", Method.PUT, UserLevel.USER, { monthly_budget: 2000 });
        expect(updateUserBudget.status).toBe(200);
        const updatedBudget = await apiTests.callApi("/api/buyers/budget/get-remaining", Method.GET, UserLevel.USER);
        expect(updatedBudget.body.monthly_budget).toBe(2000);
        expect(updatedBudget.body.remainingAmount).toBe(800);
        expect(updatedBudget.body.budgetPercentUsed).toBe(60);
  })

    it("can update budget as ADMIN", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1500);
        expect(originalBudget.body.budgetPercentUsed).toBe(0);
        await apiTests.callApi(`/api/buyers/admin/budget/update`, Method.PUT, UserLevel.ADMIN, { monthly_budget: 2000, user_id: testBuyer01WithNoSubId });
        const updatedBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudget.body.monthly_budget).toBe(2000);
        expect(updatedBudget.body.remainingAmount).toBe(2000);
        expect(updatedBudget.body.budgetPercentUsed).toBe(0);
  })

    it("should return date range of current month", async () => { 
        const originalBudgetWithNoSub = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer02WithSubId}`, Method.GET, UserLevel.ADMIN);
        const cycleStart = new Date(originalBudgetWithNoSub.body.dateRange.fromDate);
        const cycleEnd = new Date(originalBudgetWithNoSub.body.dateRange.toDate);

        expect(cycleStart.getDate()).toBe(startOfCurrentMonth.getDate());
        expect(cycleStart.getMonth()).toBe(startOfCurrentMonth.getMonth());
        expect(cycleStart.getFullYear()).toBe(startOfCurrentMonth.getFullYear());

        expect(cycleEnd.getDate()).toBe(endOfCurrentMonth.getDate());
        expect(cycleEnd.getMonth()).toBe(endOfCurrentMonth.getMonth());
        expect(cycleEnd.getFullYear()).toBe(endOfCurrentMonth.getFullYear());

  })

 })

describe("Budget and balance changes", () => { 

    beforeEach(async () => { 
        await apiTests.loadTestData();
  })

    it("should not change the budget when approving disputed, already charged lead. return is made to current_balance", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer02WithSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1000);
        expect(originalBudget.body.budgetPercentUsed).toBe(33);
        expect(originalBudget.body.pendingCharges).toBe(0);
        expect(originalBudget.body.current_balance).toBe(700);

        const approveDispute = await apiTests.callApi("/api/disputes/admin/approve", Method.PUT, UserLevel.ADMIN, { id: '123e4567-e89a-12d3-b456-226600000607', buyer_lead_id: "123e4567-e89a-12d3-b456-226600000419" });
        expect(approveDispute.status).toBe(200);

        const updatedBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer02WithSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudget.body.monthly_budget).toBe(1500);
        expect(updatedBudget.body.remainingAmount).toBe(1000);
        expect(updatedBudget.body.budgetPercentUsed).toBe(33);
        expect(updatedBudget.body.pendingCharges).toBe(0);
        expect(updatedBudget.body.current_balance).toBe(800);
  })

    it("should not change the budget when rejecting disputed, already charged lead. no return made", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer02WithSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1000);
        expect(originalBudget.body.budgetPercentUsed).toBe(33);
        expect(originalBudget.body.pendingCharges).toBe(0);
        expect(originalBudget.body.current_balance).toBe(700);

        const approveDispute = await apiTests.callApi("/api/disputes/admin/deny", Method.PUT, UserLevel.ADMIN, { id: '123e4567-e89a-12d3-b456-226600000607', buyer_lead_id: "123e4567-e89a-12d3-b456-226600000419" });
        expect(approveDispute.status).toBe(200);

        const updatedBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer02WithSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudget.body.monthly_budget).toBe(1500);
        expect(updatedBudget.body.remainingAmount).toBe(1000);
        expect(updatedBudget.body.budgetPercentUsed).toBe(33);
        expect(updatedBudget.body.pendingCharges).toBe(0);
        expect(updatedBudget.body.current_balance).toBe(700);
  })

    it("should not change balance or budget before charging, show pending charges", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1500);
        expect(originalBudget.body.budgetPercentUsed).toBe(0);
        expect(originalBudget.body.pendingCharges).toBe(100);
        expect(originalBudget.body.current_balance).toBe(0);

        // TODO NS7.2 create this in test.sql
        // const buyerLeadId = '123e4567-e89a-12d3-b456-226600000421'
  })

    it("should not change pending charges if disputed and pending", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1500);
        expect(originalBudget.body.budgetPercentUsed).toBe(0);
        expect(originalBudget.body.pendingCharges).toBe(100);
        expect(originalBudget.body.current_balance).toBe(0);

        // TODO NS7.2 create this in test.sql
        const buyerLeadId = '123e4567-e89a-12d3-b456-226600000422'
        const disputeId = '123e4567-e89a-12d3-b456-226600000608'

        const denyDispute = await apiTests.callApi("/api/disputes/admin/deny", Method.PUT, UserLevel.ADMIN, { id: disputeId, buyer_lead_id: buyerLeadId });
        expect(denyDispute.status).toBe(200);

        const updatedBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudget.body.monthly_budget).toBe(1500);
        expect(updatedBudget.body.remainingAmount).toBe(1500);
        expect(updatedBudget.body.budgetPercentUsed).toBe(0);
        expect(updatedBudget.body.pendingCharges).toBe(200);
        expect(updatedBudget.body.current_balance).toBe(0);
  })

    it("should change budget when transaction hits credit card", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1500);
        expect(originalBudget.body.budgetPercentUsed).toBe(0);
        expect(originalBudget.body.pendingCharges).toBe(100);
        expect(originalBudget.body.current_balance).toBe(0);

        const buyerLeadId = '123e4567-e89a-12d3-b456-226600000423'

        const newTransaction: Partial<Transaction> = {
            id: "test-transaction-id",
            user_id: testBuyer01WithNoSubId,
            buyer_leads_id: buyerLeadId,
            amount: -100,
            type: CreditCardTransactionTypes.LEAD_CHARGE,
            charge_date: new Date(),
            stripe_transaction_id: "ch_1J5X2n2eZvKYlo2C0Q2QX0ZS",
            credit_card_charged: 'success',
      }

        const newTransactionResponse = await transactionsDAO.postTransaction(newTransaction);
        expect(newTransactionResponse).not.toBeNull();

        const updatedBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudget.body.monthly_budget).toBe(1500);
        expect(updatedBudget.body.remainingAmount).toBe(1400);
        expect(updatedBudget.body.budgetPercentUsed).toBe(7);
        expect(updatedBudget.body.pendingCharges).toBe(100);
        expect(updatedBudget.body.current_balance).toBe(0);
  })

    it("should not change budget when transaction hits credit card on previous month", async () => { 
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1500);
        expect(originalBudget.body.budgetPercentUsed).toBe(0);
        expect(originalBudget.body.pendingCharges).toBe(100);
        expect(originalBudget.body.current_balance).toBe(0);

        const buyerLeadId = '123e4567-e89a-12d3-b456-226600000423'

        const lastDayOfPreviousMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

        const newTransaction: Partial<Transaction> = {
            id: "test-transaction-id",
            user_id: testBuyer01WithNoSubId,
            buyer_leads_id: buyerLeadId,
            amount: -100,
            type: CreditCardTransactionTypes.LEAD_CHARGE,
            // start of current month minus 2 days
            charge_date: lastDayOfPreviousMonth,
            stripe_transaction_id: "ch_1J5X2n2eZvKYlo2C0Q2QX0ZS",
            credit_card_charged: 'success',
      }

        const newTransactionResponse = await transactionsDAO.postTransaction(newTransaction);
        expect(newTransactionResponse).not.toBeNull();

        const updatedBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudget.body.monthly_budget).toBe(1500);
        expect(updatedBudget.body.remainingAmount).toBe(1500);
        expect(updatedBudget.body.budgetPercentUsed).toBe(0);
        expect(updatedBudget.body.pendingCharges).toBe(100);
        expect(updatedBudget.body.current_balance).toBe(0);
  })

    it("should change current balance when transaction is type of add-credits/return/promotion/subscription-credits/lead-assign/admin", async () => {
        const originalBudget = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(originalBudget.body.monthly_budget).toBe(1500);
        expect(originalBudget.body.remainingAmount).toBe(1500);
        expect(originalBudget.body.budgetPercentUsed).toBe(0);
        expect(originalBudget.body.pendingCharges).toBe(100);
        expect(originalBudget.body.current_balance).toBe(0);

        const newAddCreditsTransaction: Partial<Transaction> = {
            id: "test-transaction-add-credits-id",
            user_id: testBuyer01WithNoSubId,
            amount: -100,
            type: CreditCardTransactionTypes.ADD_CREDITS,
            // start of current month minus 2 days
            charge_date: new Date(),
            stripe_transaction_id: "ch_1J5X2n2eZvKYlo2C0Q2QX0ZS",
            credit_card_charged: 'success',
      }

        const newAddCreditTransactionResponse = await transactionsDAO.postTransaction(newAddCreditsTransaction);
        expect(newAddCreditTransactionResponse).not.toBeNull();

        const updatedBudgetAfterAddCredits = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudgetAfterAddCredits.body.monthly_budget).toBe(1500);
        expect(updatedBudgetAfterAddCredits.body.remainingAmount).toBe(1400);
        expect(updatedBudgetAfterAddCredits.body.budgetPercentUsed).toBe(7);
        expect(updatedBudgetAfterAddCredits.body.pendingCharges).toBe(100);
        expect(updatedBudgetAfterAddCredits.body.current_balance).toBe(100);

        const newReturnTransaction: Partial<Transaction> = {
            id: "test-transaction-return-id",
            user_id: testBuyer01WithNoSubId,
            amount: 100,
            type: 'return',
      }

        const newReturnTransactionResponse = await transactionsDAO.postTransaction(newReturnTransaction);
        expect(newReturnTransactionResponse).not.toBeNull();

        const updatedBudgetAfterReturn = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudgetAfterReturn.body.monthly_budget).toBe(1500);
        expect(updatedBudgetAfterReturn.body.remainingAmount).toBe(1400);
        expect(updatedBudgetAfterReturn.body.budgetPercentUsed).toBe(7);
        expect(updatedBudgetAfterReturn.body.pendingCharges).toBe(100);
        expect(updatedBudgetAfterReturn.body.current_balance).toBe(200);

        const newPromotionTransaction: Partial<Transaction> = {
            id: "test-transaction-promotion-id",
            user_id: testBuyer01WithNoSubId,
            amount: 100,
            type: 'promotion',
      }

        const newPromotionTransactionResponse = await transactionsDAO.postTransaction(newPromotionTransaction);
        expect(newPromotionTransactionResponse).not.toBeNull();

        const updatedBudgetAfterPromotion = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudgetAfterPromotion.body.monthly_budget).toBe(1500);
        expect(updatedBudgetAfterPromotion.body.remainingAmount).toBe(1400);
        expect(updatedBudgetAfterPromotion.body.budgetPercentUsed).toBe(7);
        expect(updatedBudgetAfterPromotion.body.pendingCharges).toBe(100);
        expect(updatedBudgetAfterPromotion.body.current_balance).toBe(300);

        const newAdminTransaction: Partial<Transaction> = {
            id: "test-transaction-admin-id",
            user_id: testBuyer01WithNoSubId,
            amount: 100,
            type: 'admin',
      }

        const newAdminTransactionResponse = await transactionsDAO.postTransaction(newAdminTransaction);
        expect(newAdminTransactionResponse).not.toBeNull();

        const updatedBudgetAfterAdmin = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudgetAfterAdmin.body.monthly_budget).toBe(1500);
        expect(updatedBudgetAfterAdmin.body.remainingAmount).toBe(1400);
        expect(updatedBudgetAfterAdmin.body.budgetPercentUsed).toBe(7);
        expect(updatedBudgetAfterAdmin.body.pendingCharges).toBe(100);
        expect(updatedBudgetAfterAdmin.body.current_balance).toBe(400);

        const newGoldSubscriptionTransaction: Partial<Transaction> = {
            id: "test-transaction-gold-id",
            user_id: testBuyer01WithNoSubId,
            amount: -1000,
            type: CreditCardTransactionTypes.GOLD,
            charge_date: new Date(),
            stripe_transaction_id: "ch_1J5X2n2eZvKYlo2C0Q2QX0ZS",
            credit_card_charged: 'success',
      }

        const newGoldSubscriptionTransactionResponse = await transactionsDAO.postTransaction(newGoldSubscriptionTransaction);
        expect(newGoldSubscriptionTransactionResponse).not.toBeNull();

        const updatedBudgetAfterGoldSubscription = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudgetAfterGoldSubscription.body.monthly_budget).toBe(1500);
        expect(updatedBudgetAfterGoldSubscription.body.remainingAmount).toBe(400);
        expect(updatedBudgetAfterGoldSubscription.body.budgetPercentUsed).toBe(73);
        expect(updatedBudgetAfterGoldSubscription.body.pendingCharges).toBe(100);
        expect(updatedBudgetAfterGoldSubscription.body.current_balance).toBe(400);

        const newGoldCreditsTransaction: Partial<Transaction> = {
            id: "test-transaction-gold-credits-id",
            user_id: testBuyer01WithNoSubId,
            amount: 2000,
            type: 'subscription-credits',
            refers_to_transaction_id: "test-transaction-gold-id" ,
            refers_to_transaction: "test-transaction-gold-id" ,
      }

        const newGoldCreditsTransactionResponse = await transactionsDAO.postTransaction(newGoldCreditsTransaction);
        expect(newGoldCreditsTransactionResponse).not.toBeNull();

        const updatedBudgetAfterGoldCredits = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudgetAfterGoldCredits.body.monthly_budget).toBe(1500);
        expect(updatedBudgetAfterGoldCredits.body.remainingAmount).toBe(400);
        expect(updatedBudgetAfterGoldCredits.body.budgetPercentUsed).toBe(73);
        expect(updatedBudgetAfterGoldCredits.body.pendingCharges).toBe(100);
        expect(updatedBudgetAfterGoldCredits.body.current_balance).toBe(2400);

        const newLeadAssignTransaction: Partial<Transaction> = {
            id: "test-transaction-lead-assign-id",
            user_id: testBuyer01WithNoSubId,
            amount: -100,
            type: 'lead-assign',
            buyer_leads_id: '123e4567-e89a-12d3-b456-226600000424',
      }

        const newLeadAssignTransactionResponse = await transactionsDAO.postTransaction(newLeadAssignTransaction);
        expect(newLeadAssignTransactionResponse).not.toBeNull();

        const updatedBudgetAfterLeadAssign = await apiTests.callApi(`/api/buyers/admin/budget/get-remaining?user_id=${testBuyer01WithNoSubId}`, Method.GET, UserLevel.ADMIN);
        expect(updatedBudgetAfterLeadAssign.body.monthly_budget).toBe(1500);
        expect(updatedBudgetAfterLeadAssign.body.remainingAmount).toBe(400);
        expect(updatedBudgetAfterLeadAssign.body.budgetPercentUsed).toBe(73);
        expect(updatedBudgetAfterLeadAssign.body.pendingCharges).toBe(100);
        expect(updatedBudgetAfterLeadAssign.body.current_balance).toBe(2300);

  })

 })
