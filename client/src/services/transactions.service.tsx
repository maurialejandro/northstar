import { ApiResponse } from "../types/apiResponseType";
import { Transaction } from "../types/transactionType";
import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";

class TransactionService {

    constructor(private readonly api: AxiosProvider) {}

    getAllTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
        return await this.api.getApi().get('/api/transactions/admin/all').then((res) => res.data)
    };

    getTransactionsByUserId = async (limit: number, page: number, dateRange: string[] = ['', '']): Promise<ApiResponse<Transaction[]>> => {
        return await this.api.getApi().get(`/api/transactions/user?limit=${limit}&page=${page}&dateRange=${dateRange}`).then((res) => res.data)
    };

    getBuyerTransactions = async (id: string, limit: number, page: number, dateRange: string[] = ['', '']): Promise<ApiResponse<Transaction[]>> => {
        return await this.api.getApi().get(`/api/transactions/admin/buyer_transactions/${id}?limit=${limit}&page=${page}&dateRange=${dateRange}`).then((res) => res.data)
    }

}

// Create one instance (object) of the service
const transactionService = new TransactionService(authProvider);

export default transactionService;
