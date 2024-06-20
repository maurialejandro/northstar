import "reflect-metadata"
import { anyString, anything, instance, mock, when } from "ts-mockito";
import BuyerLeadsService from '../../main/services/buyerLeadsService';
import DisputesDAO from '../../main/data/disputesDAO'; 
import { CountyBid, ExtendedCountyBid, User } from '../../main/types/countyBidsTypes';
import { County } from '../../main/types/countyType';
import CountyBidsDAO from '../../main/data/countyBidsDAO';
import TransactionsDAO from "../../main/data/transactionsDAO";
import BuyerDAO from "../../main/data/buyerDAO";
import { Buyer } from "../../main/types/buyerTypes";
import BuyerService from "../../main/services/buyerService";
import { DateUtils } from "../../main/middleware/dateUtils";
import { ExtendedTransaction } from "../../main/types/transactionType";
import { BuyerLead } from "../../main/types/buyerLeadsTypes";

type Lead = {
    id: string;
    state: string;
    county: string;
};

describe('BuyerLeadsService', () => {

    const county: County = {
        id: "1",
        name: "El Paso",
        state: "CO",
        population: 1000,
    }

    type BuyerWithBid = {
        buyerId: string
        bid: number
        budget: number
        disputeRate: number
        unChargedAssignedLeadsAmount?: number
        amountOfBuyerLeads?: number
    }

    function service(scenarioData: BuyerWithBid[]): BuyerLeadsService {

        const countyBidsDAO = mock(CountyBidsDAO);

        // we always return the same county for these tests
        when(countyBidsDAO.getCountiesByState(anyString())).thenReturn(Promise.resolve([county]))

        const disputesDAO = mock(DisputesDAO);
        const buyerDAO = mock(BuyerDAO)
        const transactionsDAO = mock(TransactionsDAO)
        const buyerType = mock<Buyer>()

        // wire the passed in dispute rates for each buyer to the mock disputeDao
        for (const buyer of scenarioData) {
            when(disputesDAO.getDisputeRate(buyer.buyerId))
                .thenReturn(Promise.resolve({ dispute_rate: buyer.disputeRate }))
            when(buyerDAO.getBuyerById(buyer.buyerId))
                .thenReturn(Promise.resolve({
                    ...instance(buyerType),
                    monthly_budget: buyer.budget,
                    id: buyer.buyerId,
                    current_budget: buyer.budget
                }))
            when(transactionsDAO.getAllByBuyerId(buyer.buyerId, 50, 0, anything()))
                .thenReturn(Promise.resolve(generateTransactionsArray(buyer.budget)))
            if (buyer.unChargedAssignedLeadsAmount && buyer.amountOfBuyerLeads) {
                when(buyerDAO.getUnchargedAssignedLeads(buyer.buyerId))
                    .thenReturn(Promise.resolve(generateBuyerLeadsArray(buyer.unChargedAssignedLeadsAmount, buyer.amountOfBuyerLeads)))
            } else {
                when(buyerDAO.getUnchargedAssignedLeads(buyer.buyerId))
                    .thenReturn(Promise.resolve([]))
            }
        }

        // map the passed in bids for each buyer to the mock countybidservice
        when(countyBidsDAO.getByCounty(county.id)).thenReturn(Promise.resolve(
            scenarioData.map((buyer): CountyBid => {
                const user: User = { id: buyer.buyerId, current_balance: buyer.budget, email: "" }
                return { id: "1", bid_amount: buyer.bid, user_id: buyer.buyerId, users: user, county_id: county.id }
            }
            )
        ));
        const buyerService = new BuyerService(instance(buyerDAO), instance(transactionsDAO), new DateUtils())
        return new BuyerLeadsService(instance(mock()), instance(countyBidsDAO), instance(disputesDAO), buyerService)
    }

    function generateTransactionsArray(amount: number): ExtendedTransaction[] {
        const transactionType = mock<ExtendedTransaction>()
        return [{ ...instance(transactionType), amount }]
    }

    function generateBuyerLeadsArray(amount: number, amountOfBuyerLeads = 1): BuyerLead[] {
        const buyerLeadType = mock<BuyerLead>()
        // loop through the amount of buyerLeads and return an array of buyerLeads
        // with the amount passed in
        const buyerLeadArray = []
        for (let i = 0; i < amountOfBuyerLeads; i++) {
            buyerLeadArray.push({ ...instance(buyerLeadType), price:amount/amountOfBuyerLeads })
        }
        return buyerLeadArray
    }

    function generateLeadsArray(count: number): Lead[] {
        return Array.from({ length: count }, (_, index) => ({
            id: `l${index + 1}`,
            state: 'CO',
            county: 'EL PASO',
        }));
    }

    function userIds(results: Partial<ExtendedCountyBid>[]): string[] {  
        return results.map((result: Partial<ExtendedCountyBid>) => { return `${result.user_id!}-${result.lead_assigned!}` })
    }

    it('will round robin between buyers in the same bid group', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 1000, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 1000, disputeRate: 0.2 },
            { buyerId: "b3", bid: 50, budget: 50, disputeRate: 0.1 },
            { buyerId: "b4", bid: 50, budget: 50, disputeRate: 0 },
            { buyerId: "b5", bid: 50, budget: 50, disputeRate: 0.4 }
        ])
        
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(6), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b2-l2", "b1-l3", "b2-l4", "b1-l5", "b2-l6"])
    });

    it('There are 6 leads but it should return 5 nominated buyers', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 100, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 100, disputeRate: 0.2 },
            { buyerId: "b3", bid: 50, budget: 50, disputeRate: 0.1 },
            { buyerId: "b4", bid: 50, budget: 50, disputeRate: 0 },
            { buyerId: "b5", bid: 50, budget: 50, disputeRate: 0.4 }
        ])
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(6), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b2-l2", "b4-l3", "b3-l4", "b5-l5"])
    });

    it('test with unbalanced buyers, should return an empty array because none of them have balance', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 60, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 50, disputeRate: 0.2 },
            { buyerId: "b3", bid: 50, budget: 30, disputeRate: 0.1 },
            { buyerId: "b4", bid: 50, budget: 40, disputeRate: 0.2 },
            { buyerId: "b5", bid: 50, budget: 0, disputeRate: 0.3 }
        ])
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(10), [])
        expect(userIds(r1)).toStrictEqual([])
    });

    it('the first buyer wins all the leads, should return same buyer', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 1000, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 50, disputeRate: 0.2 },
            { buyerId: "b3", bid: 50, budget: 200, disputeRate: 0.1 },
            { buyerId: "b4", bid: 50, budget: 100, disputeRate: 0.2 },
            { buyerId: "b5", bid: 50, budget: 300, disputeRate: 0.3 }
        ])
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(10), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b1-l2", "b1-l3", "b1-l4", "b1-l5", "b1-l6", "b1-l7", "b1-l8", "b1-l9", "b1-l10"])
    });

    it('In the first group there is a buyer who does not have a balance, he should not be nominated', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 400, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 50, disputeRate: 0.2 },
            { buyerId: "b3", bid: 40, budget: 300, disputeRate: 0.1 },
            { buyerId: "b4", bid: 40, budget: 200, disputeRate: 0.2 },
            { buyerId: "b5", bid: 40, budget: 100, disputeRate: 0.3 },
            { buyerId: "b6", bid: 30, budget: 100, disputeRate: 0.4 }
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b1-l2", "b1-l3", "b1-l4", "b3-l5", "b4-l6", "b5-l7", "b3-l8", "b4-l9", "b5-l10", "b3-l11", "b4-l12", "b3-l13"])
    });

    it('b6 and b7 should not be nominated, because there are not enough leads', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 250, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 350, disputeRate: 0.2 },
            { buyerId: "b3", bid: 40, budget: 250, disputeRate: 0.1 },
            { buyerId: "b4", bid: 40, budget: 100, disputeRate: 0.2 },
            { buyerId: "b5", bid: 40, budget: 150, disputeRate: 0.3 },
            { buyerId: "b6", bid: 30, budget: 100, disputeRate: 0.4 },
            { buyerId: "b7", bid: 30, budget: 100, disputeRate: 0.4 }
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b2-l2", "b1-l3", "b2-l4", "b2-l5", "b3-l6", "b4-l7", "b5-l8", "b3-l9", "b4-l10", "b5-l11", "b3-l12", "b5-l13"])
    });

    it('test with a large group of leads', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 250, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 350, disputeRate: 0.2 },
            { buyerId: "b3", bid: 40, budget: 250, disputeRate: 0.1 },
            { buyerId: "b4", bid: 40, budget: 100, disputeRate: 0.2 },
            { buyerId: "b5", bid: 40, budget: 150, disputeRate: 0.3 },
            { buyerId: "b6", bid: 30, budget: 100, disputeRate: 0.4 },
            { buyerId: "b7", bid: 30, budget: 100, disputeRate: 0.4 }
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(20), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b2-l2", "b1-l3", "b2-l4", "b2-l5", "b3-l6", "b4-l7", "b5-l8", "b3-l9", "b4-l10", "b5-l11", "b3-l12", "b5-l13", "b3-l14", "b3-l15", "b3-l16", "b6-l17", "b7-l18", "b6-l19", "b7-l20"])
    });

    it('The second nominated group should only receive one lead each.', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 300, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 350, disputeRate: 0.2 },
            { buyerId: "b3", bid: 80, budget: 100, disputeRate: 0 },
            { buyerId: "b4", bid: 80, budget: 100, disputeRate: 0.1 },
            { buyerId: "b5", bid: 30, budget: 150, disputeRate: 0.1 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b2-l2", "b1-l3", "b2-l4", "b1-l5", "b2-l6", "b3-l7", "b4-l8", "b5-l9", "b5-l10", "b5-l11", "b5-l12", "b5-l13"])
    });

    it('the blackList buyer should not return', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 300, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 350, disputeRate: 0.2 },
            { buyerId: "b3", bid: 80, budget: 100, disputeRate: 0 },
            { buyerId: "b4", bid: 80, budget: 100, disputeRate: 0.1 },
            { buyerId: "b5", bid: 30, budget: 150, disputeRate: 0.1 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [], [{user_id: "b1"}])
        expect(userIds(r1)).toStrictEqual(["b2-l1", "b2-l2", "b2-l3", "b3-l4", "b4-l5", "b5-l6", "b5-l7", "b5-l8", "b5-l9", "b5-l10"])
    });

    it('only one buyer nominated but he is on the blacklist', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 300, disputeRate: 0.1 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [], [{user_id: "b1"}])
        expect(userIds(r1)).toStrictEqual([])
    });

    it('all buyers have bid_amount 0. should return empty array', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 0, budget: 300, disputeRate: 0.1 },
            { buyerId: "b2", bid: 0, budget: 350, disputeRate: 0.2 },
            { buyerId: "b3", bid: 0, budget: 100, disputeRate: 0 },
            { buyerId: "b4", bid: 0, budget: 100, disputeRate: 0.1 },
            { buyerId: "b5", bid: 0, budget: 150, disputeRate: 0.1 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [], [{user_id: "b1"}])
        expect(userIds(r1)).toStrictEqual([])
    });

    it('all buyers have 0 balance', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 0, disputeRate: 0.1 },
            { buyerId: "b2", bid: 100, budget: 0, disputeRate: 0.2 },
            { buyerId: "b3", bid: 80, budget: 0, disputeRate: 0 },
            { buyerId: "b4", bid: 80, budget: 0, disputeRate: 0.1 },
            { buyerId: "b5", bid: 50, budget: 0, disputeRate: 0.1 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [])
        expect(userIds(r1)).toStrictEqual([])
    });

    it('all buyers receive a single lead', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 100, disputeRate: 0.1 },
            { buyerId: "b2", bid: 90, budget: 90, disputeRate: 0.2 },
            { buyerId: "b3", bid: 80, budget: 80, disputeRate: 0 },
            { buyerId: "b4", bid: 70, budget: 70, disputeRate: 0.1 },
            { buyerId: "b5", bid: 50, budget: 50, disputeRate: 0.1 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(4), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b2-l2", "b3-l3", "b4-l4"])
    });

    it('a buyer with bid_amount 0', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 450, disputeRate: 0.1 },
            { buyerId: "b2", bid: 90, budget: 300, disputeRate: 0.2 },
            { buyerId: "b3", bid: 0, budget: 200, disputeRate: 0.4 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(7), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b1-l2", "b1-l3", "b1-l4", "b2-l5", "b2-l6", "b2-l7"])
    });

    it('a single lead', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 450, disputeRate: 0.1 },
            { buyerId: "b2", bid: 90, budget: 300, disputeRate: 0.2 },
            { buyerId: "b3", bid: 0, budget: 200, disputeRate: 0.4 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(1), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1"])
    });

    it('1 lead and 1 buyer nominated but blacklisted, should return an empty array', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 450, disputeRate: 0.1 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(1), [], [{user_id: "b1"}])
        expect(userIds(r1)).toStrictEqual([])
    });

    it('should order dispute rate', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 200, disputeRate: 0.3 },
            { buyerId: "b2", bid: 100, budget: 300, disputeRate: 0.2 },
            { buyerId: "b3", bid: 100, budget: 100, disputeRate: 0.1 },
            { buyerId: "b4", bid: 50, budget: 100, disputeRate: 0.4 },
        ]) 
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(7), [])
        expect(userIds(r1)).toStrictEqual(["b3-l1", "b2-l2", "b1-l3", "b2-l4", "b1-l5", "b2-l6","b4-l7" ])
    });

    it('should take into account uncharged leads and not assign any to b2', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 200, disputeRate: 0 },
            // b2 has 3 uncharged leads of 100 each so, he is out of budget and does not get leads
            { buyerId: "b2", bid: 100, budget: 300, disputeRate: 0 , amountOfBuyerLeads: 3, unChargedAssignedLeadsAmount: 300 },
            { buyerId: "b3", bid: 100, budget: 100, disputeRate: 0 },
            { buyerId: "b4", bid: 50, budget: 100, disputeRate: 0 },
        ])
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(7), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b3-l2", "b1-l3", "b4-l4", "b4-l5" ])
    });

    it('should take into account uncharged leads and assign only 1 to b2 in the correct order', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 200, disputeRate: 0 },
            // b2 has 2 uncharged leads of 100 each so, he has only 100 budget and gets one lead
            { buyerId: "b2", bid: 100, budget: 300, disputeRate: 0 , amountOfBuyerLeads: 2, unChargedAssignedLeadsAmount: 200 },
            { buyerId: "b3", bid: 100, budget: 100, disputeRate: 0 },
            { buyerId: "b4", bid: 50, budget: 100, disputeRate: 0 },
        ])
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(7), [])
        expect(userIds(r1)).toStrictEqual(["b1-l1", "b2-l2", "b3-l3", "b1-l4", "b4-l5", "b4-l6" ])
    });

    it('all buyers have max assigned leads. should return empty array', async () => {
        const s1 = service([
            { buyerId: "b1", bid: 100, budget: 100, disputeRate: 0, amountOfBuyerLeads: 1, unChargedAssignedLeadsAmount: 100 },
            { buyerId: "b2", bid: 100, budget: 100, disputeRate: 0, amountOfBuyerLeads: 2, unChargedAssignedLeadsAmount: 100 },
            { buyerId: "b3", bid: 100, budget: 100, disputeRate: 0, amountOfBuyerLeads: 3, unChargedAssignedLeadsAmount: 100 },
            { buyerId: "b4", bid: 100, budget: 100, disputeRate: 0, amountOfBuyerLeads: 4, unChargedAssignedLeadsAmount: 100 },
            { buyerId: "b5", bid: 100, budget: 100, disputeRate: 0, amountOfBuyerLeads: 5, unChargedAssignedLeadsAmount: 100 },
        ])
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(13), [{ user_id: "b1" }])
        expect(userIds(r1)).toStrictEqual([])
    });

})
