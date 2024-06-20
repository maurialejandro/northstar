import 'reflect-metadata'
import CountyBidsDAO from '../data/countyBidsDAO';
import { CountyBid, ExtendedCountyBid } from '../types/countyBidsTypes.ts';
import { injectable } from "tsyringe";
import { County } from "../types/countyType.ts";
import { LeadImport } from '../types/leadTypes.ts';
// import { Buyer } from '../types/buyerTypes.ts';
import BuyerLeadsService from './buyerLeadsService.ts';

@injectable()
export default class CountyBidsService {
    private readonly countyBidsDAO: CountyBidsDAO;
    // private readonly disputesDAO: DisputesDAO
    private readonly buyerLeadsService: BuyerLeadsService

    constructor(
        countyBidsDAO: CountyBidsDAO,
        buyerLeadsService: BuyerLeadsService
    ) {
        this.countyBidsDAO = countyBidsDAO
        this.buyerLeadsService = buyerLeadsService
    }

    // returns an array of CountyBids
    async getCountyBids(limit = '50', page = '1', search: string, counties: string ): Promise<CountyBid[]> {
        const offset = parseInt(limit) * (parseInt(page) - 1)
        const parsedCounties = counties ? counties.split(',') : ['', '']
        return await this.countyBidsDAO.getAll(parseInt(limit), offset, search, parsedCounties)
    }

    async getCountyBidsByBuyer(
        user_id: string
    ): Promise<Partial<CountyBid>[]> {
        const countyBids = await this.countyBidsDAO.getByBuyer(user_id)
        const allCountyBids = await this.countyBidsDAO.getAllBids()

        const resultFilter = allCountyBids.filter(counties => {
            return countyBids.some(counties2 => {
                return (
                    counties.counties!.state === counties2.counties!.state &&
                    counties.counties!.name === counties2.counties!.name
                );
            });
        });
        
        const maxBidAmountForState: Record<string, Partial<CountyBid>> = resultFilter.reduce((acc, element) => {
            const key = `${element.counties!.name}-${element.counties!.state}`;

            if (!acc[key] || acc[key].bid_amount! < element.bid_amount!) {
                acc[key] = {
                    ...element,
                    users: element.users!,
                    bid_amount: element.bid_amount!,
                    counties: element.counties!,
                }
            }
            return acc;
        }, {} as Record<string, Partial<CountyBid>>);

        const countyBidsWithHighBid = countyBids.map(countyBid => {
            const key = `${countyBid.counties!.name}-${countyBid.counties!.state}`;
            const maxBid = maxBidAmountForState[key];
            return {
                ...countyBid,
                high_bid: maxBid ? maxBid.bid_amount : null,
            };
        });
        
        const bidsWithWinRate = await Promise.all(countyBidsWithHighBid.map(async (countyBid) => {
            return await this.winRateForBid(countyBid, user_id, false)
        }))
        return bidsWithWinRate
    }

    async getCountyBidsByCounty(
        county_id: string
    ): Promise<Partial<CountyBid>[]> {
        return await this.countyBidsDAO.getByCounty(county_id)
    }

    async create(
        userId: string,
        countyId: string,
        bidAmount: number): Promise<CountyBid> {
        return await this.countyBidsDAO.create(userId, countyId, bidAmount)
    }

    async update(
        id: string,
        updatedData: Partial<CountyBid>): Promise<CountyBid> {
        return await this.countyBidsDAO.update(id, updatedData)
    }

    async bulkDelete(ids: string[]): Promise<CountyBid[]> {
        return await this.countyBidsDAO.bulkDelete(ids)
    }

    async getCountiesByState(state: string): Promise<County[]> {
        return await this.countyBidsDAO.getCountiesByState(state)
    }

    async getAllCounties(): Promise<County[]> {
        return await this.countyBidsDAO.getAllCounties()
    }

    async getAllStates(): Promise<string[]> {
        const states = await this.countyBidsDAO.getAllStates();
        return states.map(state => state.state);
    }

    async getCountyById(id: string): Promise<CountyBid> {
        return await this.countyBidsDAO.getCountyById(id)
    }

    async countyBidsById(id: string): Promise<CountyBid> {
        return await this.countyBidsDAO.countyBidsById(id)
    }

    async winRateForBid(countyBid: Partial<CountyBid>, user_id: string, newBidCalculation: boolean): Promise<Partial<ExtendedCountyBid>> {

        const newBid = newBidCalculation ? [countyBid] : []
        const state = countyBid.counties!.state
        const county = countyBid.counties!.name
        const generateLeadsArray = (count = 100): LeadImport[] => {
            return Array.from({ length: count }, (_, index) => ({
                id: `l${index + 1}`,
                state,
                county,
            }));
        }
                
        const nominateBuyers = await this.buyerLeadsService.getNominatedBuyerForLeads(generateLeadsArray(100), newBid, [])
        
        if (nominateBuyers === null) {
            throw new Error('No buyers found')
        }
                
        const filteredBuyers = nominateBuyers.filter((buyer) => buyer.user_id === user_id)

        if (filteredBuyers === null) {
            return {
                ...countyBid,
                win_rate: 0,
            }
            
        }

        const winRate = (filteredBuyers.length / 100) * 100

        return {
            ...countyBid,
            win_rate: winRate,
        }
    }
}