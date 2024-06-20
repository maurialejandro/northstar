import { DataGrid, GridColDef, GridRowClassNameParams, GridRowId } from "@mui/x-data-grid";
import styles from './AdminLeadsTable.module.css';
import Typography from '@mui/material/Typography';
import { Lead } from "../../../types/leadTypes.ts";
import buyerLeadService from "../../../services/buyer_lead.service";
import LeadAssignToBuyer from "../../leads/leadAssignToBuyer/LeadAssignToBuyer";
import { BuyerLead } from "../../../types/buyerLeadTypes.ts";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Tooltip } from "@mui/material";
import { useCallback, useEffect, useState } from 'react';
import LabelPopover from './LabelPopover/LabelPopover.tsx';
import AddLabelModal from './AddLabelModal/AddLabelModal.tsx';
import leadService from "../../../services/lead.service.tsx";
import { LeadLabel } from "../../../types/labelTypes.ts";
import { Activity } from '../../../types/activityType.ts';

type UpdatedBuyerLead = {
    id: string | number | undefined;
    updatedData: Partial<BuyerLead>;
}

const checkboxClasses = {
    checkboxInput: styles.customCheckboxInput, // Custom CSS class for the checkbox input
};
type Props = {
    leads: Lead[]
    rowSelectionModel: (string | GridRowId)[];
    setRowSelectionModel: React.Dispatch<React.SetStateAction<(string | GridRowId)[]>>
    fetchLeads: () => void
};

function AdminLeadsTable({
    leads,
    rowSelectionModel,
    setRowSelectionModel,
    fetchLeads
}: Props) {
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [leadSelected, setLeadSelected] = useState<Lead | null>(null)
    const [openLabelModal, setOpenLabelModal] = useState<boolean>(false)
    const [labels, setLabels] = useState<LeadLabel[]>([])
    const [showActionId, setShowActionId] = useState("-1");

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const getLeadLabels = useCallback(async () => {
        leadService.getLeadLabels().then((response) => {
            setLabels(response)
        })
    }, [])

    useEffect(() => {
        getLeadLabels()
    }, [getLeadLabels])

    const handleCloseLabelModal = () => {
        setOpenLabelModal(false)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const removeLabel = (id : string) => {
        const body = {
            lead_id: id,
        }
        leadService.removeLabel(body).then(() => {
            fetchLeads()
        })
    }

    const handleDivClick = (lead: Lead) => {
        // Construct the path based on the params and navigate to it
        const path = `/a/leads/${lead.id}`;
        navigate(path);
    };

    const columns: GridColDef[] = [
        {
            flex: 1,
            field: "name",
            headerName: "NAME",
            headerClassName: styles.header,
            // navigate(`/a/leads/${params.row.id}`);
            renderCell: (params) => {
            params.value = params.row.name.split(' ')
            return (
                <div
                className={styles.leadName}
                onClick={() => { handleDivClick(params.row); }}
                >
                    <span>{params.value[0]}</span>
                    <span>{params.value[1]}</span>
                </div>
            )
        },
        },
        {
            flex: 1.5,
            field: "contact",
            headerName: "CONTACT",
            headerClassName: styles.header,
            renderCell: (params) => (
                <div className={styles.truncateRenderCell} title={`${params.row.phone}\n${params.row.email}`}>
                    <Typography noWrap style={{ fontSize: '0.875rem' }}>
                        {params.row.phone}
                    </Typography>
                    <Typography noWrap style={{ fontSize: '0.875rem' }}>
                        {params.row.email}
                    </Typography>
                </div>
            ),
        },
        {
            // minWidth: 180,
            flex: 1.5,
            field: "address",
            headerName: "ADDRESS",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => (
                <div className={styles.truncateRenderCell} title={`${params.row.address}\n${params.row.city}, ${params.row.state} ${params.row.zip_code}`}>
                    {/* make font size for this 0.875rem */}
                    <Typography noWrap variant="body2" >
                        {params.row.address}
                    </Typography>
                    <Typography noWrap variant="body2" >
                        {params.row.city}, {params.row.state} {params.row.zip_code}
                    </Typography>
                    <Typography noWrap variant="body2" >
                        {params.row.county}
                    </Typography>
                </div>
            ),
        },
        {
            flex: 1.5,
            field: 'buyer',
            headerName: 'Buyer',
            renderCell: (params) => (<LeadAssignToBuyer lead={params.row} />)
        },
        {
            flex: 1,
            field: "bid",
            headerName: "BID",
            headerClassName: styles.header,
            renderCell: (params) => {
            return (
                <div className={styles.truncateRenderCell} title={`${params.row.phone}\n${params.row.email}`}>
                    <Typography noWrap style={{ fontSize: '0.875rem' }}>
                        {params.row.buyer_leads?.length > 0 && params.row.buyer_leads[0].user_id !== null ? '$' + params.row.buyer_leads[0].price : 'No bid'}
                    </Typography>
                </div>
            )
            },
        },
        {
            flex: 1.3,
            field: "sent_date",
            headerName: "SEND TIMING",
            headerClassName: styles.header,
            renderHeader: () => (
                <div className={styles.truncateRenderCell}>
                    <Typography variant="body2">
                        <span className={styles.customHeader}>SEND</span>
                    </Typography>
                    <Typography variant="body2">
                        <span className={styles.customHeader}>TIMING</span>
                    </Typography>
                </div>
            ),
            // TODO: make a component for this cell, like the LeadAssignToBuyer component
            renderCell: (params) => {
                // get the newest buyer lead
                const latestBuyerLead = params.row.buyer_leads?.find((lead: BuyerLead) => lead.deleted === null)
                if (!latestBuyerLead) return
                if (latestBuyerLead.user_id === null) return

                // Format the date
                if (latestBuyerLead.sent_date !== null) {
                    const date = new Date(latestBuyerLead.sent_date)

                    // Format the date with leading zeros for the month
                    const formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });

                    // Format the time
                    const formattedTime = date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    });
            // TODO grey out text  because sent_date can't be changed
            return (
                <div className={styles.truncateRenderCell} title={`${params.row.sent_date}\n${params.row.sent_time}`}>
                    {/* make font size for this 0.875rem */}
                    <Typography noWrap variant="body2" >
                        {formattedDate}
                    </Typography>
                    <Typography noWrap variant="body2" >
                        {formattedTime}
                    </Typography>
                </div>
                )
                } else {
                    // TODO render a random time for today at least 30 minutes from now
                    return (
                        <div className={styles.truncateRenderCell}>
                            {/* make font size for this 0.875rem */}
                            <Typography noWrap variant="body2" >
                                Time on the future today
                            </Typography>
                        </div>
                    )
                }
            }
        },
        {
            flex: 1,
            field: "label",
            headerName: "LABEL",
            headerClassName: styles.header,
            renderCell: (params) => {

            if (params.row.lead_labels) {
                return (
                    <Tooltip title={params.row.lead_labels.text}>
                    <Chip
                        size="small"
                        label={params.row.lead_labels.text}
                        onDelete={() => {
                            removeLabel(params.id.toString())
                        }}
                        sx={{
                            color: params.row.lead_labels.label_colors.color_text,
                            backgroundColor: params.row.lead_labels.label_colors.color,
                            fontSize: '10px',
                            borderRadius: '4px',
                            "& .MuiChip-deleteIcon": {
                                display: "none",
                            },
                            "&:hover": {
                                "& .MuiChip-deleteIcon": {
                                    display: "block",
                            }
                            },
                        }}
                    />
                    </Tooltip>
                )
            }
            return (
                <div
                    onMouseEnter={() => {
                        setShowActionId(params.id.toString());
                    }}
                    onMouseLeave={() => {
                        setShowActionId("-1");
                    }}
                    style={{
                        display: 'flex',
                        justifyContent: 'start',
                        width: '100%',
                        height: '100%',
                        alignItems: "center"
                    }}>
                        { params.id === showActionId && (
                            <Button
                                variant="contained"
                                onClick={(event) => {
                                handleClick(event)
                                setLeadSelected(params.row)
                            }}
                                sx={{
                                    width: 70,
                                    height: 30,
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
                                }}
                            >+ Add</Button>
                        )}
                </div>
            )
            },
        },
        { flex: 1, field: "billing", headerName: "BILLING", headerClassName: styles.header },
        {
            flex: 1,
            field: "activities",
            headerName: "NOTES",
            width: 200,
            headerClassName: styles.header,
            renderCell: (params) => {
                const notes = params.row.activities
                const notesFilter = notes?.filter((note: Activity) => note.visibility === 'admin')
                const note = notesFilter?.length > 0 ? notesFilter[0].note : '-'
                return (
                    <span style={{ whiteSpace:'normal', overflow: 'hidden', textOverflow: 'hidden'}}> { note } </span>
                )
            },
        },
    ];

    // Used to style data grid rows
    const getRowClassName = (params: GridRowClassNameParams) => {
        const classNames = [styles.row];
        // Stripe the rows
        if (params.indexRelativeToCurrentPage % 2 === 0) {
            classNames.push(styles.evenRow);
        } else {
            classNames.push(styles.oddRow);
        }
        return classNames.join(' ');
    };

    const handleUpdate = async (data: UpdatedBuyerLead) => {
        await buyerLeadService.updateBuyerLead(data)
        fetchLeads()
    }

    return (
        <>
         <DataGrid
            rows={leads}
            editMode="row"
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={(newRowSelectionModel) => {
                setRowSelectionModel(newRowSelectionModel); // Update the state with the selected rows
            }}
            rowSelectionModel={rowSelectionModel}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            getRowClassName={getRowClassName}
            columnHeaderHeight={80}
            rowHeight={80}
            sx={{
                border: '0px',
                p: 2,
                color: '#ffffff',
                ontWeight: '400px',
                width: '100%',
                '& .MuiCheckbox-colorPrimary.Mui-checked': {
                    color: '#01B1F4',
                },
                '.MuiCheckbox-colorPrimary': {
                    color: 'white'
                },
                '.MuiDataGrid-withBorderColor': {
                    borderBottomColor: 'transparent',
                },
                '.MuiDataGrid-row--editing .MuiDataGrid-cell': {
                    backgroundColor: "transparent",
                },
                '.MuiDataGrid-row': {
                    // backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: '10px',
                    border: '0px solid rgb(255,0,0)',
                }
            }}
            onRowClick={(params) => {
                params.row.status === 'new' && handleUpdate({ id: params.row.id, updatedData: { status: 'viewed' } });
            }}
            hideFooter
            classes={checkboxClasses}
            disableColumnMenu={true}
        />
        <LabelPopover
            id={id}
            open={open}
            anchorEl={anchorEl}
            handleClose={handleClose}
            leadSelected={leadSelected}
            setOpenLabelModal={setOpenLabelModal}
            fetchLeads={fetchLeads}
            labels={labels}
        />
        <AddLabelModal
            openLabelModal={openLabelModal}
            handleCloseLabelModal={handleCloseLabelModal}
            getLeadLabels={getLeadLabels}
        />
        </>
    );
}

export default AdminLeadsTable;
