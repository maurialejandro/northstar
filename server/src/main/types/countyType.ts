import { ExtendedCountyBid } from './countyBidsTypes';

export type County = {
    id: string;
    name: string;
    state: string;
    population: number;
}

export type ExtendedCounty = {
    id: string;
    name: string;
    state: string;
    population: number;
    county_bids: ExtendedCountyBid[] | null;
}
