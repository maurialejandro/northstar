import { mock, instance, when, anyString, anything } from 'ts-mockito';
import CountyBidsDAO from '../../main/data/countyBidsDAO';
import CountyBidsService from '../../main/services/countyBidsService';
import { ExtendedCountyBid, User } from '../../main/types/countyBidsTypes';
import { County } from '../../main/types/countyType';
import BuyerLeadsService from '../../main/services/buyerLeadsService';
import DisputesDAO from '../../main/data/disputesDAO';
import BuyerService from '../../main/services/buyerService';
import BuyerDAO from '../../main/data/buyerDAO';
import { Buyer } from '../../main/types/buyerTypes';
import TransactionsDAO from '../../main/data/transactionsDAO';
import { ExtendedTransaction } from '../../main/types/transactionType';

describe('CountyBidsService', () => {

    type ScenarioData = {
        user_id: string;
        bid_amount: number;
        multiples: number;
        budget: number;
        unChargedAssignedLeadsAmount?: number
        amountOfBuyerLeads?: number
    }

    type Lead = {
        id: string;
        state: string;
        county: string;
    }

    const county: County = {
        id: '1',
        state: 'STATE1',
        name: 'county1',
        population: 1000,
    }

    function getWinRate(results: Partial<ExtendedCountyBid>) {
            return {
                county: results.counties!.name,
                win_rate: results.win_rate,
            }
    }

    function generateCountyBid(scenarioData: ScenarioData[]): ExtendedCountyBid {
        const countyBidsFilter = scenarioData.filter(item => item.user_id === 'b1');

        if (countyBidsFilter.length === 0) {
            return { id: "1", bid_amount: scenarioData[0].bid_amount, user_id: scenarioData[0].user_id, users: { id: scenarioData[0].user_id, current_balance: scenarioData[0].multiples , email: "" }, county_id: county.id, counties: county }
        }
        
        const user: User = { id: 'b1', current_balance: countyBidsFilter[0].budget, email: "" }
        return { id: "1", bid_amount: countyBidsFilter[0].bid_amount, user_id: 'b1', users: user, county_id: county.id, counties: county }
    }

    function generateLeadsArray(count: number) : Lead[] {
        return Array.from({ length: count }, (_, index) => ({
            id: `l${index + 1}`,
            state: `STATE1`,
            county: 'county1'
        }));
    }

    function generateTransactionsArray(amount: number): ExtendedTransaction[] {
        const transactionType = mock<ExtendedTransaction>()
        return [{ ...instance(transactionType), amount }]
    }

    function service(scenarioData: ScenarioData[]): BuyerLeadsService {
        const countyBidsDAO = mock(CountyBidsDAO);
        const disputesDAO = mock(DisputesDAO);
        const transactionsDAO = mock(TransactionsDAO)
        const buyerDAO = mock(BuyerDAO)
        const buyerType = mock<Buyer>()
        const buyerService = mock(BuyerService)
        
        when(countyBidsDAO.getCountiesByState(anyString())).thenReturn(Promise.resolve([county]))

        for (const buyer of scenarioData) {
            when(disputesDAO.getDisputeRate(buyer.user_id))
                .thenReturn(Promise.resolve({ dispute_rate: 0.5 }))
            when(buyerDAO.getBuyerById(buyer.user_id))
                .thenReturn(Promise.resolve({
                    ...instance(buyerType),
                    monthly_budget: buyer.budget,
                    id: buyer.user_id,
                    current_budget: buyer.budget
                }))
            when(transactionsDAO.getAllByBuyerId(buyer.user_id, 50, 0, anything()))
                .thenReturn(Promise.resolve(generateTransactionsArray(buyer.budget)))
            when(buyerDAO.getUnchargedAssignedLeads(buyer.user_id))
                .thenReturn(Promise.resolve([]))
            when(buyerService.getRemainingBudgetTakingIntoAccountAssignedLeads(buyer.user_id)
                ).thenReturn(Promise.resolve(buyer.budget))
            
        }

        when(countyBidsDAO.getByCounty(county.id)).thenReturn(Promise.resolve(
            scenarioData.map((buyer): ExtendedCountyBid => {
                const user: User = { id: buyer.user_id, current_balance: buyer.budget, email: "" }
                return { id: buyer.user_id, bid_amount: buyer.bid_amount, user_id: buyer.user_id, users: user, county_id: county.id }
            }
            )
        ));
        return new BuyerLeadsService(instance(mock()), instance(countyBidsDAO), instance(disputesDAO), instance(buyerService))
    }

    async function service2(scenarioData: ScenarioData[]): Promise<CountyBidsService> {
        const countyBidsDAO = mock(CountyBidsDAO);
        const buyerLeadsService = mock(BuyerLeadsService);
        const s1 = service(scenarioData);
        const r1 = await s1.getNominatedBuyerForLeads(generateLeadsArray(100), [])
        console.log(r1);
        
        when(buyerLeadsService.getNominatedBuyerForLeads(anything(),anything(), anything())).thenResolve(r1)

        return new CountyBidsService(
            instance(countyBidsDAO),
            instance(buyerLeadsService)
        );
    }

    it('1 high bidder with basically unlimited budget, then our buyer', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b1", bid_amount: 50, multiples: 10, budget: 500 },
            { user_id: "b3", bid_amount: 200, multiples: 100, budget: 20000 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 0 });
    });

    it('1 group of bidders with finite budget with a higher bid, then our buyer', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b2", bid_amount: 200, multiples: 40, budget: 8000 },
            { user_id: "b3", bid_amount: 200, multiples: 40, budget: 8000 },
            { user_id: "b1", bid_amount: 100, multiples: 20, budget: 2000 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 20 });
    })

    it('2 groups of bidders, then our buyer', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b2", bid_amount: 150, multiples: 25, budget: 3750 },
            { user_id: "b3", bid_amount: 150, multiples: 25 , budget: 3750 },
            { user_id: "b1", bid_amount: 100, multiples: 50, budget: 5000 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 50 });
    });

    it('our buyer with unlimited budget, then others', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b1", bid_amount: 100, multiples: 100, budget: 10000 },
            { user_id: "b2", bid_amount: 50, multiples: 10, budget: 500 },
            { user_id: "b3", bid_amount: 50, multiples: 10, budget: 500 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 100 });
    });

    it('our buyer with finite budget that will get used up, then others', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b1", bid_amount: 100, multiples: 80, budget: 8000 },
            { user_id: "b2", bid_amount: 90, multiples: 10, budget: 900 },
            { user_id: "b3", bid_amount: 80, multiples: 10, budget: 800 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 80 });
    });

    it(' our buyer with zero budget, then others', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b1", bid_amount: 150, multiples: 0, budget: 0 },
            { user_id: "b2", bid_amount: 100, multiples: 10, budget: 1000 },
            { user_id: "b3", bid_amount: 100, multiples: 10, budget: 1000 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 0 });
    });

    it('only our buyer with finite budget, no others', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b1", bid_amount: 150, multiples: 30, budget: 4500 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 30 });
    });

    it('1 high bidder who isn’t us, not our buyer', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b2", bid_amount: 150, multiples: 30, budget: 4500 },
        ]

        const s1 = await service2(countyBids);

        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 0 });
    });

    it('a bunch of other bidders, not our buyer', async () => {

        const countyBids: ScenarioData[] = [
            { user_id: "b2", bid_amount: 100, multiples: 30, budget: 3000 },
            { user_id: "b2", bid_amount: 100, multiples: 50, budget: 5000 },
            { user_id: "b2", bid_amount: 150, multiples: 20, budget: 3000 },
        ]

        const s1 = await service2(countyBids);
        
        const res1 = await s1.winRateForBid(generateCountyBid(countyBids), 'b1', false);
        const result1 = getWinRate(res1)
        expect(result1).toEqual({ county: 'county1', win_rate: 0 });
    });

})