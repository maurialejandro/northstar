import {County} from "../types/countyType.ts";
import { AxiosResponse } from "axios";
import { CountyBid, UpdatedBid } from "../types/countyBidsType";
import { GridRowId } from "@mui/x-data-grid";
import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";

class CountyBidService {

    constructor(private readonly api: AxiosProvider) {}

    createCountyBid = async (countyBid: { county_id: string, bid_amount: number }): Promise<CountyBid[]> => {
        return await this.api.getApi().post("/api/county_bids/create", countyBid).then(res => res.data);
    };

    getAllCountyBids = async (): Promise<AxiosResponse<CountyBid[]>> => {
        return await this.api.getApi().get('/api/county_bids/admin/all').then(res => res.data);
    };

    getCountyBidByBuyerId = async (): Promise<CountyBid[]> => {
        return await this.api.getApi().get('/api/county_bids/by_user').then(res => res.data);
    };

    getCountyBidByCountyId = async (countyId: string): Promise<AxiosResponse<CountyBid[]>> => {
        return await this.api.getApi().get(`/api/county_bids/admin/by_county/${countyId}`).then(res => res.data);
    };

    updateCountyBid = async (countyBid: UpdatedBid): Promise<AxiosResponse<CountyBid[]>> => {
        return await this.api.getApi().put(`/api/county_bids/update`, countyBid);
    };

    bulkDeleteCountyBids = async (ids: (string | GridRowId)[]): Promise<null> => {
        return await this.api.getApi().put(`/api/county_bids/bulk_delete`, { ids }).then(res => res.data);
    };

    getAllStates = async (): Promise<string[]> => {
        return await this.api.getApi().get('/api/county_bids/states').then(res => res.data);
    }

    getCountiesByState = async (state: string): Promise<County[]> => {
        return await this.api.getApi().get(`/api/county_bids/counties/${state}`).then(res => res.data);

    }

    getAllCounties = async (): Promise<County[]> => {
        return await this.api.getApi().get('/api/county_bids/counties').then(res => res.data);
  }

    getCountyById = async (id: string): Promise<CountyBid[]> => {
        return await this.api.getApi().get(`/api/county_bids/counties_by_id/${id}`).then(res => res.data);
    }

    getCountyByLead = async (body : { id: string, state: string | null, county: string | undefined }) => {
        return await this.api.getApi().post("/api/county_bids/admin/by_lead", body).then(res => res);
    };

    getCountiesBidsByAdmin = async (id: string): Promise<CountyBid[]> => {
        return await this.api.getApi().get(`/api/county_bids/admin/${id}`).then(res => res.data);
    }
}

// Create one instance (object) of the service
const countyBidService = new CountyBidService(authProvider);

export default countyBidService;
