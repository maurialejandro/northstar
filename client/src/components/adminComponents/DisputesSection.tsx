import { Grid, Typography } from "@mui/material";
import DisputeCard from "./DisputeCard";
import ResolvedDisputeCard from "./ResolvedDisputeCard";
import { useEffect, useState, useCallback } from "react";
import CustomPagination from "../Pagination";
import StatusSelect from "../filters/StatusSelect";
import SearchField from "../filters/SearchField";
import DateFilter from "../filters/DateFilter";
import { ExtendedDispute } from "../../types/disputesTypes.ts";
import disputeService from "../../services/disputesService.tsx";

function DisputesSection() {
    const [data, setData] = useState<ExtendedDispute[]>([]);
    const [page, setPage] = useState(1);
    const limit = 2;
    const [disputesCount, setDisputesCount] = useState(0)
    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const [searchFilter, setSearchFilter] = useState<string>('')
    const [dateRange, setDateRange] = useState<string[]>(['', ''])

    const fetchDisputes = useCallback(() => {
        disputeService.adminGetAll(limit, page, searchFilter, statusFilter, dateRange).then((response) => {
            if (response.data) {
                setDisputesCount(response.count ? response.count : 0);
                setData(response.data ? response.data : []);
                !response.data.length && page > 1 && setPage(response.count ? Math.ceil(response.count / limit) : 1);
            }
        });
    }, [limit, page, searchFilter, statusFilter, dateRange]);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const areAnyDisputesPending = data.some(dispute => dispute.status === 'Pending');
    const areAnyDisputesArchived = data.some(dispute => dispute.status !== 'Pending');

    return (
        <Grid
            item
            sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.4rem",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
            }}
            xs={12}
        >
            <Grid container >
                <Grid item xs={2}>
                    <Typography variant="h5" color={'primary'} sx={{ fontWeight: "600" }}>
                        Disputes
                    </Typography>
                </Grid>
                <Grid item xs={3} sx={{ display: "flex" }} >
                    <Typography color={'primary'} sx={{ py: 1, pr: 1 }}>
                        Dates
                    </Typography>
                    <DateFilter dateRange={dateRange} setDateRange={setDateRange} tableName="Disputes" />
                </Grid>
                <Grid item xs={3} sx={{ display: "flex" }} >
                    <Typography color={'primary'} sx={{ py: 1, ml: 6 }}>
                        Status
                    </Typography>
                    <StatusSelect options={['Pending', 'Approved', 'Rejected']} setStatusFilter={setStatusFilter} />
                </Grid>
                <Grid item xs={4} sx={{ display: "flex", justifyContent: 'end', ml: 0 }} >
                    <SearchField searchFilter={searchFilter} setSearchFilter={setSearchFilter} />
                </Grid>
                {/* */}{areAnyDisputesPending && <Grid item xs={12}>
                    <Typography color={'primary'} sx={{ py: 1 }}>
                        Pending
                    </Typography>
                </Grid>}
                {data.filter(e => { return e.status === 'Pending' }).map((e) => (
                    <DisputeCard fetchDisputes={fetchDisputes} disputeData={e} key={e.id} />
                ))}
                {areAnyDisputesArchived && <Grid item xs={12}>
                    <Typography color={'primary'} sx={{ py: 1 }}>
                        Archived
                    </Typography>
                </Grid>}
                {data.filter(e => { return e.status !== 'Pending' }).map((e) => (
                    <ResolvedDisputeCard disputeData={e} key={e.id} />
                ))}
                <Grid item xs={12} sx={{ display: "flex", justifyContent: 'end' }}></Grid><CustomPagination page={page} setPage={setPage} rows={disputesCount} limit={limit} />

            </Grid>
        </Grid>
    );
}

export default DisputesSection;