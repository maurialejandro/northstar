import TransactionsDAO from '../data/transactionsDAO';
import { injectable } from "tsyringe";
import { ExtendedTransaction, Transaction } from '../types/transactionType.ts';
import { EntityWithCount } from "../types/entityWithCount.ts";

type ReturnCredits = {
    amount: number,
    user_id: string,
    buyer_leads_id: string,
    dispute_id: string
    refers_to_transaction_id: string
}

@injectable()
export default class TransactionsService {
    private readonly transactionsDAO: TransactionsDAO;

    constructor(transactionsDAO: TransactionsDAO) {
        this.transactionsDAO = transactionsDAO;
    }

    // returns an array of Transactions
    async getAll(
        limit = '50',
        page = '1',
    ): Promise<EntityWithCount<ExtendedTransaction[]>> {
        const offset = parseInt(limit) * (parseInt(page) - 1)
        const transactions = await this.transactionsDAO.getAll(parseInt(limit), offset)
        const transactionsCount = await this.transactionsDAO.countAll();
        return { data: transactions, count: transactionsCount }
    }

    // getAllByBuyerId
    async getAllByBuyerId(
        user_id: string,
        limit = '50',
        page = '1',
        dateRange: string
    ): Promise<EntityWithCount<ExtendedTransaction[]>> {
        const offset = parseInt(limit) * (parseInt(page) - 1)
        const parsedDateRange = dateRange ? dateRange.split(',') : ['', '']

        parsedDateRange[0] = parsedDateRange[0] !== '' ? new Date(parsedDateRange[0]).toISOString() : ''
        if (parsedDateRange[1] !== '') {
            const d = new Date(parsedDateRange[1])
            d.setHours(23,59,59,999)
            parsedDateRange[1] = d.toISOString()
        }

        const transactions = await this.transactionsDAO.getAllByBuyerId(user_id, parseInt(limit), offset,{ fromDate: parsedDateRange[0], toDate: parsedDateRange[1] })
        const transactionsCount = await this.transactionsDAO.countAllByBuyerId(user_id, { fromDate: parsedDateRange[0], toDate: parsedDateRange[1] })

        return { data: transactions, count: transactionsCount }
    }

    async returnCredits({ user_id, buyer_leads_id, amount, dispute_id, refers_to_transaction_id }: ReturnCredits): Promise<Transaction | null> {
        return await this.transactionsDAO.returnCredits(user_id, buyer_leads_id, amount, dispute_id, refers_to_transaction_id)
    }

    async getTransactionsByBuyerLeadId(id: string): Promise<Transaction[] | null> {
        return await this.transactionsDAO.getTransactionsByBuyerLeadId(id)
    }

    async postTransaction(data:Partial<Transaction>): Promise<Transaction> {
        return await this.transactionsDAO.postTransaction(data)
    }
}
