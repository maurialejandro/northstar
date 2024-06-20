import { ExtendedCountyBid, CountyBid } from './countyBidsType';

export type County = {
    id: string;
    name: string;
    state: string;
    population: bigint;
    county_bids: CountyBid[] | null;
}

export type ExtendedCounty = {
    id: string;
    name: string;
    state: string;
    population: bigint;
    county_bids: ExtendedCountyBid[] | null;
}
