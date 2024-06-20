import { ApiResponse } from "../types/apiResponseType";
import { AverageDisputeRate, Dispute, DisputeRate, ExtendedDispute } from "../types/disputesTypes";
import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";
import { CountyBid } from "../types/countyBidsType.ts";
import { County } from "../types/countyType.ts";

type UpdatedDispute = {
    id: string;
    updatedData: { admin_message?: string };
}

export class DisputeService {

    constructor(private readonly api: AxiosProvider) {}

    adminGetAll = async (limit: number, page: number, search: string, status: string[] = [], dateRange: string[] = ['', '']): Promise<ApiResponse<ExtendedDispute[]>> => {
        return await this.api.getApi().get(`/api/disputes/admin?limit=${limit}&page=${page}&search=${search}&status=${status}&dateRange=${dateRange}`).then((response) => response.data);
    };

    create = async (data: { buyer_lead_id: string, dispute_reason: string, dispute_message: string }): Promise<ApiResponse<Dispute>> => {
        return await this.api.getApi().post(`/api/disputes/create`, data).then((response) => response.data);
    };

    denyDispute = async (dispute: UpdatedDispute): Promise<ApiResponse<Dispute>> => {
        return await this.api.getApi().put(`/api/disputes/admin-deny`, dispute).then((response) => response.data);
    };

    approveDispute = async (dispute: { id: string, buyer_lead_id: string }): Promise<ApiResponse<Dispute>> => {
        return await this.api.getApi().put(`/api/disputes/admin-approve`, dispute).then((response) => response.data);
    }

    getDisputeRate = async (): Promise<DisputeRate> => {
        return await this.api.getApi().get(`/api/disputes/dispute-rate`).then((response) => response.data);
    }

    getCalculatedAverageDisputeRate = async (): Promise<AverageDisputeRate> => {
        return await this.api.getApi().get(`/api/disputes/avarege-dispute`).then((response) => response.data);
    };

    getDisputeRateById = async (id: string): Promise<{dispute_rate: number}> => {
        return await this.api.getApi().get(`/api/disputes/admin/dispute-rate/${id}`).then((response) => response.data);
    }

    getBuyersDisputes = async (county_id : County): Promise<(CountyBid & { dispute_rate: number })[]> => {
        return await this.api.getApi().get(`/api/disputes/admin/buyers-disputes/${county_id.id}`).then((response) => response.data);
    };
}

const disputeService = new DisputeService(authProvider);

export default disputeService;
