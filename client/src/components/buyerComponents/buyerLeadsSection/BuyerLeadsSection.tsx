import {Button, Grid, Typography} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import BuyerLeadsTable from "../buyerLeadsTable/BuyerLeadsTable";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import buyerLeadService from "../../../services/buyer_lead.service";
import { GridRowId } from "@mui/x-data-grid";
import CustomPagination from "../../Pagination";
import SearchField from "../../filters/SearchField";
import DataContext from "../../../context/DataContext";
import { BuyerLead } from "../../../types/buyerLeadTypes.ts";
import { Lead } from "../../../types/leadTypes.ts";
import DateFilter from "../../filters/DateFilter.tsx";
import CountyFilter from "../../filters/CountyFilter.tsx";

import * as xlsx from "xlsx";

type Props = {
    limit: number
    showFilters: boolean
}
function BuyerLeadsSection({ limit, showFilters }: Props) {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<BuyerLead[]>([])
    const [rowSelectionModel, setRowSelectionModel] = useState<(string | GridRowId)[]>([]);
    const [page, setPage] = useState(1);
    const [leadsCount, setLeadsCount] = useState(0)
    const { filters, setFilters } = useContext(DataContext);
    const location = useLocation();
    const [dateRange, setDateRange] = useState<string[]>(['', ''])
    const [countiesFilter, setCountiesFilter] = useState<string[]>([])
    const [includeArchived] = useState(false)

    const handleClearFilters = () => {
        setCountiesFilter([])
        setDateRange(['', ''])
    }

    const fetchLeads = useCallback(async () => {
        await buyerLeadService.getAllBuyerLeadsByUser(includeArchived, limit, page, filters.leadSearch, countiesFilter, dateRange).then((response) => {
            if (response.data) {
                setLeadsCount(response.count ? response.count : 0);
                setLeads(response.data ? response.data : []);
                !response.data.length && page > 1 && setPage(response.count ? Math.ceil(response.count / limit) : 1);
            }
        });
    }, [includeArchived, limit, page, filters.leadSearch, countiesFilter, dateRange]);

    const handleExport = () => {
        let leadsToExport: Lead[] = [];

        // If there are selected rows, filter and format the leads to include only those
        if (rowSelectionModel.length !== 0) {
            rowSelectionModel.forEach((e: GridRowId) => {
                const selectedLeads = leads.filter((lead: BuyerLead) => lead.id === e)
                    .map((lead: BuyerLead) => lead.leads);
                leadsToExport = leadsToExport.concat(selectedLeads.flat());
            });
        } else if (leads.length !== 0) {
            // If no rows are selected, format and include all leads
            leadsToExport = leads.map((lead: BuyerLead) => lead.leads).flat();
        }

        // If there are leads to export, create and write the workbook
        if (leadsToExport.length !== 0) {
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(leadsToExport);
            xlsx.utils.book_append_sheet(wb, ws, "Leads");
            xlsx.writeFile(wb, "Leads.xlsx");
        }
    }

    useEffect(() => {
        if (filters.leadSearch !== '' && location.pathname === '/b/dashboard') { navigate('/b/leads'); return; }
        fetchLeads();
    }, [fetchLeads, filters.leadSearch, location.pathname, navigate]);

    return (
        <Grid
            container
            sx={{
                // TODO: what's the right color?
                // backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.4rem",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
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
                    {/* KEEP TO THE LEFT */}
                    <Grid item
                          sx={{
                              // my: 2,
                              // mx: 4,
                              display: 'flex',
                              justifyContent: 'start',
                              alignItems: 'start',
                              fontSize: '18px',
                              fontWeight: 500,
                              lineHeight: '24px',
                              letterSpacing: '0px',
                              color: '#ffffff'
                          }} xs={10}>My Leads</Grid>

                    {/* KEEP TO THE RIGHT */}
                    {/* add margin left auto */}
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

                        {/* "ARCHIVE BUTTON" */}
                        <Button
                            variant="outlined"
                            style={rowSelectionModel.length === 0 ? { margin: '0 10px', color: "gray", border: "1.5px solid gray" } : { margin: '0 10px', color: "#fff", border: "1.5px solid #fff" }}
                            onClick={() => {
                              rowSelectionModel.forEach(async (e) => {
                                await buyerLeadService.updateBuyerLead({ id: e, updatedData: { status: 'archived' } });
                              });
                              fetchLeads();
                            }}
                        >
                            Archive
                        </Button>
                        <SearchField
                            searchFilter={filters.leadSearch}
                            setSearchFilter={() => {
                                setFilters({ ...filters, leadSearch: '' })
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
            {showFilters && <Grid item width="100%" sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3) ' }}>
                <Grid container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2.2 }}>
                    <Grid item xs={2}>
                        <Typography color={'primary'} sx={{ py: 1, ml: 6 }}>
                            Filters
                        </Typography>
                    </Grid>
                    <Grid item xs={3} sx={{ display: "flex" }} >
                        <Typography color={'primary'} sx={{ py: 1, pr: 1 }}>
                            Dates
                        </Typography>
                        <DateFilter dateRange={dateRange} setDateRange={setDateRange} tableName="Leads" />
                    </Grid>
                    <Grid item xs={3} sx={{ display: "flex" }} >
                        <Typography color={'primary'} sx={{ py: 1, pr: 1 }}>
                            Counties
                        </Typography>
                        <CountyFilter countiesFilter={countiesFilter} setCountiesFilter={setCountiesFilter} />
                    </Grid>
                    <Grid item onClick={handleClearFilters} xs={4} sx={{ display: "flex", cursor: 'pointer'}} >
                        {/* TODO: clear filters */}
                        <Typography color={'primary'} sx={{ py: 1, ml: "auto", mr: 6 }}>
                            clear filters
                        </Typography>
                    </Grid>

                </Grid>
            </Grid>}
                <Grid item sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3) ' }} xs={12}>
                    {/* pass a limit as prop number */}
                    <BuyerLeadsTable leads={leads} rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel} fetchLeads={fetchLeads} />
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
                        {/* should be a link to /b/leads */}
                        {!showFilters && <Button variant="contained"
                            // on click navigate to /b/leads
                                                 onClick={() => { navigate('/b/leads'); }}
                                                 sx={{ backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)', color: '#000000', fontSize: '13px', mx: 0, height: '30px' }} >SEE ALL</Button>}
                        <CustomPagination page={page} setPage={setPage} rows={leadsCount} limit={limit} />
                    </Grid>
                </Grid>
            </Grid>
    );
}

export default BuyerLeadsSection;
