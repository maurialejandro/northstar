import { Button, Grid } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import AdminLeadsTable from '../adminLeadsTable/AdminLeadsTable';
import { useCallback, useEffect, useState } from "react";
import leadService from "../../../services/lead.service";
import { GridRowId } from "@mui/x-data-grid";
import CustomPagination from "../../Pagination";
import { Lead } from "../../../types/leadTypes.ts";
import ImportLeads from "../../leads/importLeads/importLeads.tsx";

type Props = {
    limit: number
    getArchived: boolean
}
function AdminLeadsSection({ limit, getArchived }: Props) {
    const [formattedLeads, setFormattedLeads] = useState<Lead[]>([])
    const [rowSelectionModel, setRowSelectionModel] = useState<(string | GridRowId)[]>([]);
    const [page, setPage] = useState(1);
    const [leadsCount, setLeadsCount] = useState(0)

    const fetchLeads = useCallback(async () => {

        await leadService.getAllLeads(getArchived, limit, page).then((leadsData) => {
            const formattedLeads = leadsData.data.map((lead: Lead) => { return { ...lead } })

            formattedLeads.map((lead: Lead) => {
                // TODO: format leads on import
                lead.county = lead.county?.toLowerCase().replace(/\b[a-z]/g, (letter: string) => letter.toUpperCase()) // this didn't work
                lead.county = `${lead.county}, ${lead.state}`

                // TODO : fetchLeads shouldn't use db metadata directly in ui business logic, deleted and created

                const filteredBuyerLeads = lead.buyer_leads?.filter((buyerLead) => {
                    return buyerLead.deleted === null
                });

                if (filteredBuyerLeads === undefined) {
                    return lead
                }

                const thisLeadBuyerLead = filteredBuyerLeads.find((lead) => lead.deleted === null);

                if (thisLeadBuyerLead) {
                lead.buyer_leads = [thisLeadBuyerLead]
                }

                return lead
            })

            setFormattedLeads(formattedLeads);
            setLeadsCount(leadsData.count);
        }).catch((error) => {
            console.log(error); // TODO: handle error!
            console.log("error not handled");
        }
        );
    }, [getArchived, limit, page])
    useEffect(() => {
        fetchLeads()
    },[fetchLeads])

    return (
        <Grid
            container
            sx={{
                // backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "0.4rem",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
            }}
        >
            <Grid item width="100%">
                <Grid
                    item
                    display={'flex'}
                    alignItems={'center'}
                    sx={{
                        my: 2,
                        mx: 6,
                        fontSize: '18px',
                        fontWeight: 500,
                        lineHeight: '24px',
                        letterSpacing: '0px',
                        color: '#ffffff',
                        height: '60px'
                    }}
                >
                    <Grid item>Leads</Grid>

                    <Grid item display={'flex'} ml={'auto'}>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '0 15px', width: "120px" }}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <input
                                type="text"
                                placeholder="Search"
                                style={{
                                    marginLeft: '5px',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'gray',
                                    fontSize: '16px',
                                    width: '100%'
                                }}
                            />
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item width="100%" sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3) ' }} >
                <Grid
                    item
                    display={'flex'}
                    alignItems={'center'}
                    sx={{
                        my: 2,
                        mx: 6,
                        fontSize: '18px',
                        fontWeight: 500,
                        lineHeight: '24px',
                        letterSpacing: '0px',
                        color: '#ffffff',
                        height: '60px'
                    }}
                >
                    <Grid item>
                        <Button variant="contained"
                                       sx={{
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        lineHeight: '20.02px',
                                        letterSpacing: '0.17px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        padding: '5px 10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                       }} >
                            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '10px' }} />Filters</Button>
                    </Grid>
                    <Grid item display={'flex'} ml={'auto'}>
                        <ImportLeads/>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item
                  sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3) ' }}
                  xs={12}>
                <AdminLeadsTable leads={formattedLeads} rowSelectionModel={rowSelectionModel} setRowSelectionModel={setRowSelectionModel} fetchLeads={fetchLeads} />
                <Grid item sx={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#FFFFFFDE',
                    px: "30px",
                    my: '20px',

                }} xs={12}>
                    <CustomPagination page={page} setPage={setPage} rows={leadsCount} limit={limit} />
                </Grid>

            </Grid>
        </Grid>
    );
}

export default AdminLeadsSection;
