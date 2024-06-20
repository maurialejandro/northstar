import BuyerLeadsDAO from '../data/buyerLeadsDAO';
import { BuyerLead } from '../types/buyerLeadsTypes.ts';
import { injectable } from "tsyringe";
import { EntityWithCount } from "../types/entityWithCount.ts";
import DisputesDAO from '../data/disputesDAO.ts';
import { Buyer } from '../types/buyerTypes.ts';
import { LeadImport } from '../types/leadTypes.ts';
import { CountyBid, ExtendedCountyBid } from '../types/countyBidsTypes.ts';
import { DateUtils } from "../middleware/dateUtils.ts";
import CountyBidsDAO from '../data/countyBidsDAO.ts';
import BuyerService from './buyerService.ts';

@injectable()
export default class BuyerLeadsService {
    private readonly buyerLeadsDAO: BuyerLeadsDAO;
    private readonly disputesDAO: DisputesDAO;
    private readonly countyBidsDAO: CountyBidsDAO;

    constructor(buyerLeadsDAO: BuyerLeadsDAO, countyBidsDAO: CountyBidsDAO, disputesDAO: DisputesDAO, readonly buyerService: BuyerService) {
      this.buyerLeadsDAO = buyerLeadsDAO;
      this.countyBidsDAO = countyBidsDAO;
      this.disputesDAO = disputesDAO;
    }

    // get all buyerLeads for admin
    async getAll(
        limit = '50',
        page = '1',
    ): Promise<EntityWithCount<BuyerLead[]>> {
        const offset = parseInt(limit) * (parseInt(page) - 1)
        const buyerLeads = await this.buyerLeadsDAO.getAll(parseInt(limit), offset)
        const buyerLeadsCount = await this.buyerLeadsDAO.countAll(parseInt(limit), offset)
        return { data: buyerLeads, count: buyerLeadsCount }
    }

    // get one buyerLead for admin
    async getOneByID(
        id: string
    ): Promise<BuyerLead> {
        return await this.buyerLeadsDAO.getOneByID(id)
    }

    // count all buyerLeads for admin
    // returns an array of the current page of BuyerLeads and a count of the total number of BuyerLeads
    async getUserLeads(
        user_id: string,
        getArchived = 'false',
        limit = '50',
        page = '1',
        search = '',
        counties: string,
        dateRange: string,
    ): Promise<EntityWithCount<(BuyerLead | undefined)[]>> {
        const offset = parseInt(limit) * (parseInt(page) - 1)
        const parsedDateRange = dateRange ? dateRange.split(',') : ['', '']
        const parsedCounties = counties ? counties.split(',') : []
        const visibility = 'user'
        const dateUtils = new DateUtils();
        const formattedDateRange = dateUtils.formatRangeToUTC(parsedDateRange);

        const buyerLeads = await this.buyerLeadsDAO.getAllByBuyerId(user_id, getArchived === "true", parseInt(limit), offset, search, parsedCounties, formattedDateRange, visibility)
        const buyerLeadsCount = await this.buyerLeadsDAO.countAllByBuyerId(user_id, getArchived === "true", search, parsedCounties, formattedDateRange)
        return { data: buyerLeads, count: buyerLeadsCount }
    }

    async getAllBuyerLeadsByBuyer(
        buyerID: string,
        getArchived = 'false',
        limit = '50',
        page = '1',
        search = '',
        counties: string,
        dateRange: string,
    ): Promise<EntityWithCount<(BuyerLead | undefined)[]>> {
        const offset = parseInt(limit) * (parseInt(page) - 1)
        const parsedDateRange = dateRange ? dateRange.split(',') : ['', '']
        const parsedCounties= counties ? counties.split(',') : []
        
        parsedDateRange[0] = parsedDateRange[0] !== '' ? new Date(parsedDateRange[0]).toISOString() : ''
        parsedDateRange[1] = parsedDateRange[1] !== '' ? new Date(parsedDateRange[1]).toISOString() : ''
        const buyerLeads = await this.buyerLeadsDAO.getAllByBuyerId(buyerID, getArchived === "true", parseInt(limit), offset, search, parsedCounties, { fromDate: parsedDateRange[0], toDate: parsedDateRange[1] })
        const buyerLeadsCount = await this.buyerLeadsDAO.countAllByBuyerId(buyerID, getArchived === "true", search, parsedCounties, { fromDate: parsedDateRange[0], toDate: parsedDateRange[1] })
        return { data: buyerLeads, count: buyerLeadsCount }

    }

    async update(
        id: string,
        updatedData: Partial<BuyerLead>): Promise<BuyerLead> {
        return await this.buyerLeadsDAO.update(id, updatedData)
    }

    async deleteBuyerLead(
        id: string
    ): Promise<BuyerLead> {
        return await this.buyerLeadsDAO.delete(id)
    }

    async createBuyerLead(
        newBuyerLead: { user_id: string; lead_id: string; status: string; price: number; }
    ): Promise<BuyerLead> {
        return await this.buyerLeadsDAO.create(newBuyerLead)
    }
    
    async getNominatedBuyerForLeads(leads: LeadImport[], new_bid: Partial<CountyBid>[] , blackList: Partial<Buyer>[] = []) : Promise<Partial<ExtendedCountyBid>[]> {
        if (leads.length === 0) {
            return [];
        }
        const state = leads[0].state;
        
        const counties = await this.countyBidsDAO.getCountiesByState(state)
        
        const county = counties.filter((county) => county.name.toLocaleLowerCase() === leads[0].county.toLocaleLowerCase())[0];
        // get buyers
        const countyBids = await this.countyBidsDAO.getByCounty(county.id)
        const filteredCountyBids = countyBids.filter(item => item!.bid_amount !== 0);
        
        if (filteredCountyBids.length === 0 && (new_bid === null || new_bid?.length === 0)) {
            return [];
        }

        // add dispute rate to countyBids
        const result : Partial<ExtendedCountyBid>[] = await Promise.all(
            filteredCountyBids.map(async (bid) => {
                
                const disputeRateResult = await this.disputesDAO.getDisputeRate(bid.users!.id!);
                const dispute_rate = disputeRateResult ? disputeRateResult.dispute_rate : null;
                return {
                    ...bid!,
                    dispute_rate,
                };
            })
        );

        if (new_bid?.length !== 0 && new_bid !== null) {
            const newBidCounty = new_bid![0];
            result.push(
                {
                    ...newBidCounty,
                    dispute_rate: null,
                }
            );
        }

        // filter out buyers that are in the blacklist
        const filteredResult = result.filter(item => !blackList.some(buyer => buyer.user_id === item.user_id));
        const groupedByBidAmount: Record<number, Partial<ExtendedCountyBid>[]> = {};

        filteredResult.forEach((bid) => {
            const bidAmount = bid.bid_amount || 0;
            if (!groupedByBidAmount[bidAmount]) {
                groupedByBidAmount[bidAmount] = [];
            }
            groupedByBidAmount[bidAmount].push(bid);
        });

        const groupedResult = Object.values(groupedByBidAmount);
        
        groupedResult.sort((a, b) => {
            const bidAmountA = a[0]?.bid_amount || 0;
            const bidAmountB = b[0]?.bid_amount || 0;
            return bidAmountB - bidAmountA;
        });

        groupedResult.forEach((group) => {
            group.sort((a, b) => {
                const disputeRateA = a.dispute_rate || 0;
                const disputeRateB = b.dispute_rate || 0;
                return disputeRateA - disputeRateB;
            });
        });

        const uniqueUserIds = Array.from(new Set(groupedResult.flat().map((user) => user.user_id))) as string[];

        const getUserBudgetsByID = async (group: string[]) => {
            const promises = group.map(async (id) => {
                const budget = await this.buyerService.getRemainingBudgetTakingIntoAccountAssignedLeads(id);
                
                return { id, budget };
            });
            return await Promise.all(promises);
        };

        // all users budgets
        const budgets = await getUserBudgetsByID(uniqueUserIds);
        
        const roundBuyers = [];

        for (const array of groupedResult) {
            let allBudgetsNonNegative = false;

            while (!allBudgetsNonNegative && array.length > 0) {
                allBudgetsNonNegative = true;

                for (let i = 0; i < array.length; i++) { 
                    const user = array[i];
                    const { bid_amount } = user;
                    const current_budget = budgets.find((budget) => budget.id === user.user_id)?.budget || 0;
                    const newBudget = current_budget - bid_amount!;
                    budgets.find((budget) => budget.id === user.user_id)!.budget = newBudget;
                    // if balance is non-negative, push to roundBuyers
                    if (newBudget >= 0) {
                        allBudgetsNonNegative = false;
                        roundBuyers.push(user);
                    } else {
                        // if balance is negative, remove buyer from array
                        array.splice(i, 1);
                        allBudgetsNonNegative = false;
                        // Decrement the index to stay at the current position in the array
                        i--;
                    }

                    if (array.length === 0) {
                        break;
                    }
            }
        }
        }
        roundBuyers.length = Math.min(roundBuyers.length, leads.length);
        
        // lead assign, returns buyers with leads
        return roundBuyers.map((buyer, index) => {
            return {
                ...buyer,
                lead_assigned: leads[index].id,
            }
        });
    }
}