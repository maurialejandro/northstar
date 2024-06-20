import { TestDBSetup } from "../db_tests.ts";
import BuyerDAO from "../../main/data/buyerDAO.ts";
import { Buyer } from "../../main/types/buyerTypes.ts";
import BuyerService from "../../main/services/buyerService.ts";
import { DateUtils } from "../../main/middleware/dateUtils.ts";
import TransactionsDAO from "../../main/data/transactionsDAO.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import BuyerLeadsDAO from "../../main/data/buyerLeadsDAO.ts";

describe('test BuyerService', () => {
    const setup = new TestDBSetup();
    const wrapper = new SupabaseWrapper(setup.supabase());
    const dao = new BuyerDAO(setup.db());
    const service = new BuyerService(
        dao,
        new TransactionsDAO(wrapper),
        new DateUtils()
    );

    beforeAll(async () => {
        await setup.loadTestData();
    });

    test('getRemainingBudgetTakingIntoAccountAssignedLeads', async () => {
        const myUserId = await setup.userId("test1@flavor8.com");
        const buyer: Buyer = (await dao.getBuyerById(myUserId!))!;
        const budget = await service.getBudget(buyer.id);
        expect(budget.remainingAmount).toBe(300);

        const budgetTakingIntoAccountUnchargedAssignedLeads = await service.getRemainingBudgetTakingIntoAccountAssignedLeads(buyer.id);
        expect(budgetTakingIntoAccountUnchargedAssignedLeads).toBe(0);
    });

    test('getRemainingBudgetTakingIntoAccountAssignedLeads is modified upon buyerLead creation', async () => {
        const myUserId = '123e4567-e89a-12d3-b456-226600000203'
        const budget = await service.getBudget(myUserId);
        expect(budget.remainingAmount).toBe(500);
        const budgetTakingIntoAccountUnchargedAssignedLeads = await service.getRemainingBudgetTakingIntoAccountAssignedLeads(myUserId);
        expect(budgetTakingIntoAccountUnchargedAssignedLeads).toBe(300);

        const buyerLeadDao = new BuyerLeadsDAO(wrapper);
        // create a lead to check if it is taken into account
        const buyerLeadData = {
            user_id: myUserId!,
            lead_id: '123e4567-e89a-12d3-b456-226600000329',
            status: 'new',
            price: 150
        };
        const newCratedBuyerlead = await buyerLeadDao.create(buyerLeadData);
        const budgetTakingIntoAccountUnchargedAssignedLeads2 = await service.getRemainingBudgetTakingIntoAccountAssignedLeads(myUserId);
        expect(budgetTakingIntoAccountUnchargedAssignedLeads2).toBe(budgetTakingIntoAccountUnchargedAssignedLeads - newCratedBuyerlead.price);
    });

})