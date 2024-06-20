import { DataGrid, GridColDef, } from "@mui/x-data-grid";
import { Grid } from '@mui/material';
import { Transaction } from '../../../../types/transactionType';
import { formatDateTime } from '../../../../utils/formatDateTime';
import { transactionType } from '../../../../constants/constants';

type Props = {
    transactions: Transaction[]

}

const TransactionTable = ({
    transactions
} : Props) => {
    const rows = transactions.map((transaction) => {
        return {
            id: transaction.id,
            date: transaction.created,
            description : transaction.type,
            credit_card: transaction.amount,
            credit_balance: transaction.balance,
            lead : transaction.buyer_leads_id ? transaction.buyer_leads_id : null,
        };
    });
    const columns: GridColDef[] = [
        {
            field: "date",
            headerName: "Date",
            flex: 1,
            maxWidth: 100,
            renderCell: (params) => { return formatDateTime(params.value as string) }
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            renderCell: (params) => {
                if (params.value === transactionType.LEAD_RETURN) {
                    return (
                        <span>Returned{' '}
                            <span style={{
                                cursor: "pointer",
                                textDecoration: "underline"
                            }}
                            >{`${params.row.lead.lead_id.name}`}
                            </span>
                        </span>
                    )
                }

                if (params.value === transactionType.LEAD_ASSIGN) {
                    return (
                        <span>Assigned{' '}
                            <span style={{
                                cursor: "pointer",
                                textDecoration: "underline"
                            }}
                            >{`${params.row.lead.lead_id.name}`}
                            </span>
                        </span>
                    )
                }

                if (params.value === transactionType.SUBSCRIPTION_CREDIT) {
                    return (
                        <span>Subscription Credit</span>
                    )
                }

                if (params.value === transactionType.SUBSCRIPTION_TYPE) {
                    return (
                        <span>Subscription ({ `${params.value}` })</span>
                    )
                }
            }
        },
        {
            field: "credit_card",
            headerName: "Credit Card",
            flex: 1,
            renderCell: (params) => { return `$ ${params.value}` }
        },
         {
            field: "credit_balance",
            headerName: "Credit Balance",
            flex: 1,
            renderCell: (params) => { return `$ ${params.value}` }
        },
    ];

    return (
        <Grid
            container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: "100%",
                height: 550,
            }}
        >
            <h3>Transactions</h3>
            <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                aria-label="Buyers"
                autoPageSize
                disableColumnMenu={true}
                style={{ width: "100%" }}
            />
        </Grid>
    )
}

export default TransactionTable