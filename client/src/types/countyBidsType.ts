// import { User } from "./userTypes.ts";
import { Buyer} from "./buyerType";

export type CountyBid = {
  id: string;
  user_id: string;
  county_id: string
  counties: CountyId
  bid_amount: null | number;
  high_bid: number | null;
  users: Buyer;
  win_rate: number;
}

export type ExtendedCountyBid = {
  id: string;
  user_id: string;
  county_id: string
  counties: CountyId
  bid_amount: null | number;
  // users: User; // TODO use the correct type once we clean them up card number #17
  users: Buyer;
  dispute_rate? : number;
}

export type CountyId = {
  id: string
  name: string
  state: string
  population: string
  county_id: string
  bid_amount: null | number;
}
export type UserId = {
  id: string
  email: string
}

export type UpdatedBid = {
  id: string | number | undefined;
  updatedData: {
    county_id: string | undefined;
    bid_amount: number;
  };
};

export type UpdateBidBuyer = {
  county_id: string | null;
  bid_amount: number;
};

export type BidRow = {
  state: string | null;
  county: string | null;
  bid_amount: null | number;
  high_bid?: number | null;
  ourTake?: string | null;
  id: string | number;
  edit: string;
  isNew?: boolean;
  county_id: string | null;
  win_rate: number;
}
