import { BuyerLead } from "../types/buyerLeadTypes";
import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";
import { EntityWithCount } from "../types/entityWithCount.ts";

type UpdatedBuyerLead = {
  id: string | number | undefined;
  updatedData: Partial<BuyerLead>;
}

class BuyerLeadService {

  constructor(private readonly api: AxiosProvider) {}

  getAllBuyerLeadsByUser = async (getArchived: boolean, limit: number, page: number, search: string, counties: string[] = [], dateRange: string[] = ['', '']): Promise<EntityWithCount<BuyerLead[]>> => {
    return await this.api.getApi().get(`/api/buyer_leads?${getArchived ? 'true' : 'false'}&limit=${limit}&page=${page}&search=${search}&counties=${counties}&dateRange=${dateRange}`).then((response) => response.data);
  };

  getAllBuyerLeadsByBuyer = async (buyerId: string | undefined, getArchived: boolean, limit: number, page: number): Promise<EntityWithCount<BuyerLead[]>> => {
    return await this.api.getApi().get(`/api/buyer_leads/buyer/admin/${buyerId}?${getArchived ? 'true' : 'false'}&limit=${limit}&page=${page}`).then((response) => response.data);
  };

  createBuyerLead = async (buyerLead: Partial<BuyerLead>): Promise<BuyerLead> => {
    return await this.api.getApi().post("/api/buyer_leads/admin/create", buyerLead).then(response => response.data);
  };

  updateBuyerLead = async (buyerLead: UpdatedBuyerLead): Promise<BuyerLead> => {
    return await this.api.getApi().put(`/api/buyer_leads/admin/update`, buyerLead).then(response => response.data);
  };

  deleteBuyerLead = async (buyerLeadId: string): Promise<BuyerLead> => {
    return await this.api.getApi().delete(`/api/buyer_leads/admin/${buyerLeadId}`).then(response => response.data);
  };
}

const buyerLeadService = new BuyerLeadService(authProvider);

export default buyerLeadService;
