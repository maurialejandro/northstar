import { AxiosResponse } from "axios";
import { Buyer } from "../types/buyerType";
import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";
import {budgetCardProps} from "../types/buyerBudgetCardTypes.ts";

class BuyerService {

  constructor(private readonly api: AxiosProvider) {}

  getAllBuyers = async (): Promise<AxiosResponse<Buyer[]>> => {
    return await this.api.getApi().get('/api/admin/buyers');
  };

  getBuyerById = async (buyerId: string | undefined): Promise<AxiosResponse<Buyer>> => {
    return await this.api.getApi().get(`/api/buyers/admin/${buyerId}`)
  };

  getBudget = async (): Promise<budgetCardProps> => {
    return await this.api.getApi().get('/api/buyers/budget/get-remaining').then((response) => response.data);
  };

}

// Create one instance (object) of the service
const buyerService = new BuyerService(authProvider);

export default buyerService;
