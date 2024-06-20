import {Button, Grid, Typography,} from "@mui/material";
import TransactionsTable from "./TransactionsTable";
import { Transaction } from "../../types/transactionType.ts";
import {useCallback, useEffect, useState} from "react";
import transactionService from "../../services/transactions.service";
import CustomPagination from "../Pagination.tsx";
import DateFilter from "../filters/DateFilter.tsx";
import {GridRowId} from "@mui/x-data-grid";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import * as xlsx from "xlsx";

type Props = {
    limit: number
}
function TransactionsSection({ limit }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [transactionsCount, setTransactionsCount] = useState(0)
    const [dateRange, setDateRange] = useState<string[]>(['', ''])
    const [rowSelectionModel, setRowSelectionModel] = useState<(string | GridRowId)[]>([]);

    const handleClearFilters = () => {
        setDateRange(['', ''])
    }

    const handleExport = () => {

        let transactionsToExport: Transaction[] = [];

        // If there are selected rows, filter transactions to include only those
        if (rowSelectionModel.length !== 0) {
            rowSelectionModel.forEach((e: GridRowId) => {
                const selectedTransactions = transactions.filter((transaction: Transaction) => transaction.id === e);
                transactionsToExport = transactionsToExport.concat(selectedTransactions);
            });
        } else if (transactions.length !== 0) {
            // If no rows are selected, include all transactions
            transactionsToExport = transactions;
        }

        // If there are transactions to export, create and write the workbook
        if (transactionsToExport.length !== 0) {
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(transactionsToExport);
            xlsx.utils.book_append_sheet(wb, ws, "Transactions");
            xlsx.writeFile(wb, "Transactions.xlsx");
        }
    }

    const fetchTransactions = useCallback(async () => {
         await transactionService.getTransactionsByUserId(limit, page, dateRange).then((response) => {
            if (response.data) {
                setTransactionsCount(response.count ? response.count : 0);
                setTransactions(response.data ? response.data : []);
                !response.data.length && page > 1 && setPage(response.count ? Math.ceil(response.count / limit) : 1);
            }
        });
    }, [ limit, page, dateRange ]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <Grid item
            container
            sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.4rem",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            xs={12}
        >
            <Grid item width="100%">
                <Grid
                    item
                    display={'flex'}
                    alignItems={'center'}
                    sx={{
                        my: 2,
                        mx: 4,
                        fontSize: '18px',
                        fontWeight: 500,
                        lineHeight: '24px',
                        letterSpacing: '0px',
                        color: '#ffffff',
                        height: '60px'
                    }}
                >
                <Grid item xs={12}><Typography sx={{ fontSize: '18px', color: '#fff', p: 2 }} >My Transactions</Typography> </Grid>
                <Grid item display={'flex'} ml={'auto'}>
                    {/* "EXPORT BUTTON" WITH DOWNLOAD ICON TO THE LEFT */}
                    <Button
                        variant="text"
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                        style={{ color: '#fff', margin: '0 10px' }}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                </Grid>
            </Grid>

            <Grid item width="100%" sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3) ' }}>
                    <Grid container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.2 }}>
                        <Grid item xs={2}>
                            <Typography color={'primary'} sx={{ py: 1, ml: 6 }}>
                                Filters
                            </Typography>
                        </Grid>
                        <Grid item xs={3} sx={{ display: "flex", mr: "auto" }} >
                            <Typography color={'primary'} sx={{ py: 1, pr: 1 }}>
                                Dates
                            </Typography>
                            <DateFilter dateRange={dateRange} setDateRange={setDateRange} tableName="Leads" />
                        </Grid>
                        <Grid item onClick={handleClearFilters} xs={4} sx={{ display: "flex", cursor: 'pointer'}} >
                            {/* TODO: clear filters */}
                            <Typography color={'primary'} sx={{ py: 1, ml: "auto", mr: 6 }}>
                                clear filters
                            </Typography>
                        </Grid>

                    </Grid>
                </Grid>
                {<Grid item sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3) ' }} xs={12}>
                    <TransactionsTable transactions={transactions} rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel} />
                    <Grid item sx={{
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#FFFFFFDE',
                        // position it all the way to the right using margin left auto
                        px: "30px",
                        my: '20px',

                    }} xs={12}>
                        <CustomPagination page={page} setPage={setPage} rows={transactionsCount} limit={limit} />
                    </Grid>
                </Grid>}
            </Grid>
        </Grid>
    );
}

export default TransactionsSection;