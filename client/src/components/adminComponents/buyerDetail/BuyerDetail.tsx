import { Grid, useMediaQuery } from "@mui/material";
import GeneralInformation from "./generalInformation/GeneralInformation";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from 'react';
import transactionService from '../../../services/transactions.service';
import { Transaction } from '../../../types/transactionType';
import TransactionTable from './transactionTable/TransactionTable';
import buyerLeadService from '../../../services/buyer_lead.service';
import { BuyerLead } from '../../../types/buyerLeadTypes';
import BuyerDisputes from './buyerDisputes/BuyerDisputes';

const BuyerDetail = () => {
    const { id } = useParams();
    const [transactions, setTransactions] = useState<Transaction[] | null>([])
    const [leads, setLeads] = useState<BuyerLead[]>([])
    const disputes = leads.filter((lead) => lead.disputes !== null && lead.disputes.status === 'Pending')

    const getBuyerTransactions = useCallback(async () => {
        const res = await transactionService.getBuyerTransactions(id!, 50, 1)
        return res.data
    }, [id])

    const getLeads = useCallback(async () => {
        const res = await buyerLeadService.getAllBuyerLeadsByBuyer(id, true, 200, 1)
        return res.data
    }, [id]);

    useEffect(() => {
        getBuyerTransactions().then((response) => {
            setTransactions(response)
        })
    }, [getBuyerTransactions])

    useEffect(() => {
        getLeads().then((response) => {
            setLeads(response)
        })
    }, [getLeads])

    console.log(transactions);

    const isScreenSmall = useMediaQuery('(max-width: 1250px)');

    return (
        <Grid
            container
            sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.4rem",
                display: 'grid',
                gridTemplateColumns: !isScreenSmall ? '18% 54% 18%' : '30% 60%',
                justifyContent: 'center',
                padding: '20px',
                gap: 3,
            }}
            xs={12}
        >
        <Grid item >
            <GeneralInformation
                buyerId={id!}
                leads={leads}
                transactions={transactions!}
            />
        </Grid>
        <Grid item >
            <TransactionTable
                transactions={transactions!}
            />
        </Grid>
        {!isScreenSmall && (
            <Grid item >
                <BuyerDisputes
                    leads={leads}
                    getLeads={getLeads}
                    disputes={disputes}
                />
            </Grid>
        )}
        </Grid>
    );
}

export default BuyerDetail