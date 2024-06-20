import DisputesDAO from '../data/disputesDAO';
import TransactionsService from '../services/transactionsService';
import { AverageContext, DisputesAverage, ExtendedDispute, GlobalAvaregeDispute } from '../types/disputesTypes.ts';
import { injectable } from "tsyringe";
import { EntityWithCount } from '../types/entityWithCount';
import { Transaction } from '../types/transactionType.ts';
import BuyerLeadsService from "./buyerLeadsService.ts";

@injectable()
export default class DisputesService {
    private readonly disputesDAO: DisputesDAO;
    private readonly buyerLeadsService: BuyerLeadsService;
    private readonly transactionsService: TransactionsService;

    constructor(disputesDAO: DisputesDAO, transactionsService: TransactionsService, buyerLeadsService: BuyerLeadsService) {
        this.transactionsService = transactionsService;
        this.disputesDAO = disputesDAO;
        this.buyerLeadsService = buyerLeadsService;
    }

    async getAll(limit = '50', page = '1', search: string, status: string, dateRange: string): Promise<EntityWithCount<ExtendedDispute[]>> {
        const offset = parseInt(limit) * (parseInt(page) - 1)
        const parsedStatus = status ? status.split(',') : []
        const parsedDateRange = dateRange ? dateRange.split(',') : ['', '']

        parsedDateRange[0] = parsedDateRange[0] !== '' ? new Date(parsedDateRange[0]).toISOString() : ''
        parsedDateRange[1] = parsedDateRange[1] !== '' ? new Date(parsedDateRange[1]).toISOString() : ''

        const disputes = await this.disputesDAO.getAll(parseInt(limit), offset, search, parsedStatus, { fromDate: parsedDateRange[0], toDate: parsedDateRange[1] })
        const disputesCount = await this.disputesDAO.countDisputes(search, parsedStatus, { fromDate: parsedDateRange[0], toDate: parsedDateRange[1] })
        return { data: disputes, count: disputesCount }
    }

    async checkStatusById(id: string): Promise<"Pending" | "Approved" | "Rejected"> {
        return (await this.disputesDAO.getDisputeById(id)).status as "Pending" | "Approved" | "Rejected"
    }

    async getDisputeById(id: string): Promise<ExtendedDispute> {
        return await this.disputesDAO.getDisputeById(id)
    }

    async approveDispute(id: string, buyer_lead_id: string): Promise<Transaction[] | ExtendedDispute | null> {
        const prevTransactions = await this.transactionsService.getTransactionsByBuyerLeadId(buyer_lead_id)
        if (prevTransactions?.length) {
            const leadAssignTransaction = prevTransactions.find((transaction: Transaction) => transaction.type === 'lead-assign')
            const returnTransaction = prevTransactions.find((transaction: Transaction) => transaction.type === 'return')
            // returnTransaction this means that the credit was already returned, so we just update the dispute status
            if (returnTransaction) return await this.disputesDAO.update(id, { status: 'Approved' })
            // leadAssignTransaction this means that the lead was charged, so we return the credit and update the dispute status
            if (leadAssignTransaction) {
                const { user_id, amount } = leadAssignTransaction
                const newReturnTransaction = await this.transactionsService.returnCredits({ user_id, buyer_leads_id: buyer_lead_id as string, amount, dispute_id: id, refers_to_transaction_id: leadAssignTransaction.id })
                if (newReturnTransaction) {
                    return await this.disputesDAO.update(id, { status: 'Approved' })
                } else {
                    return newReturnTransaction
                }
            }
        } else {
            return await this.disputesDAO.update(id, { status: 'Approved' })
        }
        return prevTransactions
    }

    async create(
        buyer_lead_id: string,
        dispute_reason: string,
        dispute_message: string,
    ): Promise<ExtendedDispute> {
        return await this.disputesDAO.create(buyer_lead_id, dispute_reason, dispute_message)
    }

    async userOwnsBuyerLead(user_id: string, buyer_lead_id: string): Promise<boolean> {
        const buyerLead = await this.buyerLeadsService.getOneByID(buyer_lead_id)
        // if ids match returns true
        return !!(buyerLead && buyerLead.user_id === user_id);
    }

    async update(
        id: string,
        updatedData: Partial<ExtendedDispute>): Promise<ExtendedDispute> {
        return await this.disputesDAO.update(id, updatedData)
    }

    async delete(
        id: string
    ): Promise<ExtendedDispute> {
        return await this.disputesDAO.delete(id)
    }
    
    async getDisputeRate(buyerId: string): Promise<{dispute_rate : number | null}> {
       const disputeRate = await this.disputesDAO.getDisputeRate(buyerId)
       return disputeRate
    }

    async getCalculatedAverageDisputeRate(): Promise<{ average_dispute: number, dispute_count: number, lead_count: number }> {
       const disputeRate = await this.disputesDAO.getCalculatedAverageDisputeRate()
       return disputeRate
    }
    
    async getGlobalAverage(): Promise<DisputesAverage> {
       const disputeRate = await this.disputesDAO.getGlobalAverage()
      return disputeRate
    }
    
    async updateAverageDispute(name: string, value: number, context: AverageContext): Promise<GlobalAvaregeDispute> {
       const disputeRate = await this.disputesDAO.updateAverageDispute(name, value, context)
       return disputeRate
    }  
}
