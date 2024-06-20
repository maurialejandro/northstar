import { TestDBSetup } from "../db_tests.ts";
import TransactionsDAO from "../../main/data/transactionsDAO.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import { Transaction } from "../../main/types/transactionType.ts";

describe('TransactionsDAO', () => {
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());
    let myUserId: string | null;

    const limit = 15
    const offset = 0
    const dateRange = { fromDate: '', toDate: '' }
    const dao = new TransactionsDAO(supabase);
    const zequiBuyer = '123e4567-e89a-12d3-b456-226600000203';

    const today = new Date();
    const todayMinus7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const todayPlus16Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 16);

    beforeAll(async () => {
        await setup.loadTestData();
        myUserId = await setup.userId("test1@flavor8.com");
        expect(myUserId).not.toBeNull();
    });

    describe('getAll', () => {

        it('should not be null', async () => {
            const resp = await dao.getAll(limit,offset);
            expect(resp).not.toBeNull();
        });

        it('should fetch all transactions limited by offset and limit', async () => {
            
            const getAllTransactions = await dao.getAll(5, 0);
            expect(getAllTransactions.length).toBe(5);

            const getAllTransactions2 = await dao.getAll(2, 5);
            const getAllTransactions3 = await dao.getAll(50, 0);
            expect(getAllTransactions3[5].id).toBe(getAllTransactions2[0].id);

            const getAllTransactions4 = await dao.getAll(6, 7);
            expect(getAllTransactions3[7].id).toBe(getAllTransactions4[0].id);

            const getAllTransactions5 = await dao.getAll();
            expect(getAllTransactions5.length).toBe(22);
        });

        it('should count all transactions', async () => {
            const countAllTransactions = await dao.countAll();
            expect(countAllTransactions).toBe(22);
        })
    });

    describe('countAllTransactionByBuyer', () => {
        it('should count all transaction by buyer id', async () => {

            const dateRange = { fromDate: todayMinus7Days.toISOString() , toDate: todayPlus16Days.toISOString() };
            // Testing get all data and count all data to check if show it
            const countTransactionByBuyer = await dao.countAllByBuyerId(zequiBuyer, {fromDate: '', toDate: ''});
            const getAllTransactionByBuyer = await dao.getAllByBuyerId(zequiBuyer, 50, 0, {fromDate: '', toDate: ''});
            expect(countTransactionByBuyer).toEqual(getAllTransactionByBuyer.length);

            /*

            Testing with date range limit in 50 and offset in 0 because we want all data to check only date filter.
            the filter should bring only tree object.

            */
            const getAllBuyerByIdFilter = await dao.getAllByBuyerId(zequiBuyer, 50, 0, dateRange);
            expect(getAllBuyerByIdFilter.length).toBe(7);
            const fromDate = new Date(dateRange.fromDate);
            const toDate = new Date(dateRange.toDate);
            getAllBuyerByIdFilter.forEach((transaction) => {
                const transactionDate = new Date(transaction.created);
                expect(transactionDate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
            });
            getAllBuyerByIdFilter.forEach((transaction) => {
                const transactionDate = new Date(transaction.created);
                expect(transactionDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
            })
        });
    });

    describe('getAllByBuyerId', () => {
        it('should get all transaction by buyer and count', async () => {

            const dateRange = { fromDate: todayMinus7Days.toISOString(), toDate: todayPlus16Days.toISOString() }
            const getTransactionByBuyer = await dao.getAllByBuyerId(zequiBuyer, limit, offset, dateRange)
            const countTransactionByBuyer = await dao.countAllByBuyerId(zequiBuyer, dateRange);
            expect(getTransactionByBuyer[0].user_id).toBe(zequiBuyer);
            expect(getTransactionByBuyer.length).toBe(countTransactionByBuyer);

            /*
             * Get transaction by buyer with date, for the myUserId without
             * the total of transactions is 6 but with filter in 2 only show 2 object
             */
            const customDateFilter = { fromDate: todayMinus7Days.toISOString(), toDate: '' };
            const getTransactionByBuyerFilter = await dao.getAllByBuyerId(zequiBuyer, 2, offset, customDateFilter);
            expect(getTransactionByBuyerFilter.length).toBe(2);
            const fromDate = new Date(customDateFilter.fromDate);
            getTransactionByBuyerFilter.forEach((transaction) => {
                const transactionDate = new Date(transaction.created);
                expect(transactionDate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
            });

            const customDateFilter2 = { fromDate: '', toDate: todayPlus16Days.toISOString() };
            const getTransactionByBuyer2 = await dao.getAllByBuyerId(zequiBuyer, limit, offset, customDateFilter2);
            const toDate = new Date(customDateFilter2.toDate);
            getTransactionByBuyer2.forEach((transaction) => {
                const transactionDate = new Date(transaction.created);
                expect(transactionDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
            });

            const customDAteFilter3 = { fromDate: todayMinus7Days.toISOString(), toDate: todayPlus16Days.toISOString() };
            const toDate2 = new Date(customDAteFilter3.toDate);
            const fromDate2 = new Date(customDAteFilter3.fromDate);
            const getTransactionByBuyer3 = await dao.getAllByBuyerId(zequiBuyer, limit, offset, customDAteFilter3);
            getTransactionByBuyer3.forEach((transaction) => {
            
                const transactionDate = new Date(transaction.created);
                // Change date time to check if greater than equal
                expect(transactionDate.getTime()).toBeGreaterThanOrEqual(fromDate2.getTime());
                expect(transactionDate.getTime()).toBeLessThanOrEqual(toDate2.getTime()) 
            });
        })
    })

    describe('getTransactionsByBuyerLeadId', () => {

        it('should fetch transactions with matching buyerLeads', async () => {
            const resp = await dao.getTransactionsByBuyerLeadId('123e4567-e89b-12d3-a456-426655440003');
            const allHaveBuyerId = resp?.every(transaction => transaction.buyer_leads_id === '123e4567-e89b-12d3-a456-426655440003');
            expect(allHaveBuyerId).toBe(true);
        });

    });

    describe('getTransactionsByBuyerId', () => {

        beforeEach(async () => {
            await setup.loadTestData();
            myUserId = await setup.userId("test1@flavor8.com");
            expect(myUserId).not.toBeNull();
        });

        it('should fetch transactions with matching buyerId', async () => {
            const resp = await dao.getAllByBuyerId(myUserId!, limit, offset, dateRange);
            expect(resp?.length).toBe(10);
            expect(resp).toEqual(expect.arrayContaining([
                expect.objectContaining({ user_id: myUserId }),
            ]));
        });

        // it should return the sum of all transactions
        it('should return the sum of all transactions', async () => {
            const resp = await dao.getAllByBuyerId(myUserId!, limit, offset, dateRange);
            const sum = resp?.reduce((acc, transaction) => acc + transaction.amount, 0);
            expect(sum).toBe(400); // TODO what's the logic here? doesn't matter the type of transaction? ticket #31
        });

    });

    describe('postTransaction', () => {
        // TODO create test for all types of transactions
        it('should post a transaction', async () => {

            const newTransaction: Partial<Transaction> = {
                id:'transaction-test1',
                user_id: myUserId!,
                amount: 100,
                type: 'add-credits',
                charge_date: new Date()
                // TODO make sure the balance is calculated properly
            }

            const resp = await dao.postTransaction(newTransaction);
            expect(resp).not.toBeNull();
            const allTransactions = await dao.getAll(null,null);
            expect(allTransactions.some(transaction => transaction.id === newTransaction.id)).toBe(true);
            const userTransactions = await dao.getAllByBuyerId(myUserId!, limit, offset, dateRange);
            const sum = userTransactions?.reduce((acc, transaction) => acc + transaction.amount, 0);
            expect(sum).toBe(500);

        });
    });
});