import { DataGrid, GridCellParams, GridColDef, GridRowClassNameParams, GridRowId } from "@mui/x-data-grid";
import styles from './BuyerLeadsTable.module.css'
import Typography from '@mui/material/Typography';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faClock, faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import buyerLeadService from "../../../services/buyer_lead.service";
import DisputeModal from "../DisputeModal";
import { BuyerLead } from "../../../types/buyerLeadTypes.ts";
import { Activity } from "../../../types/activityType.ts";
import { Tooltip } from '@mui/material';

const checkboxClasses = {
    checkboxInput: styles.customCheckboxInput, // Custom CSS class for the checkbox input
};
type Props = {
    leads: BuyerLead[]
    rowSelectionModel: (string | GridRowId)[];
    setRowSelectionModel: React.Dispatch<React.SetStateAction<(string | GridRowId)[]>>
    fetchLeads: () => void
};

function BuyerLeadsTable(props: Props) {

    const columns: GridColDef[] = [
        {
          flex: 1,
          field: "name",
          headerName: "NAME",
          headerClassName: styles.header,
          renderCell: (params) => {
          params.value = params.row.leads.name.split(' ')

          return (
            <div className={styles.leadName}>
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
                <div className={styles.truncateRenderCell} title={`${params.row.leads.phone}\n${params.row.leads.email}`}>
                    <Typography noWrap style={{ fontSize: '0.875rem' }}>
                        {params.row.leads.phone}
                    </Typography>
                    <Typography noWrap style={{ fontSize: '0.875rem' }}>
                        {params.row.leads.email}
                    </Typography>
                </div>
            ),
        },
        {
            flex: 1.5,
            field: "address",
            headerName: "ADDRESS",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => (
                <div className={styles.truncateRenderCell} title={`${params.row.leads.address}\n${params.row.leads.city}, ${params.row.leads.state} ${params.row.leads.zip_code}`}>
                    <Typography noWrap variant="body2" >
                        {params.row.leads.address}
                    </Typography>
                    <Typography noWrap variant="body2" >
                        {params.row.leads.city}, {params.row.leads.state} {params.row.leads.zip_code}
                    </Typography>
                </div>
            ),
        },
        {
            flex: 1,
            field: "county",
            headerName: "COUNTY",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => (
                <div>
                    <FontAwesomeIcon className={styles.statusCircle} icon={faCircle} /> {params.row.leads.county}, {params.row.leads.state}
                </div>
            ),
        },
        {
            flex: 1,
            field: "received",
            headerName: "RECEIVED",
            headerClassName: styles.header,
            renderCell: (params) => {
                // get the newest buyer lead
                const sentDate = params.row.sent_date;

                if (!sentDate) return

                // Format the date
                if (sentDate) {
                    const date = new Date(sentDate)

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
              flex: 0.5,
            field: "price",
            headerName: "PRICE",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => {
                const price = params.row.price;
                if (price) {
                    return <div className={styles.truncateRenderCell}>
                        <Typography noWrap variant="body2" >
                            ${price}
                        </Typography>
                    </div>
                } else {
                    return <div className={styles.truncateRenderCell}>
                        <Typography noWrap variant="body2" >
                            No Price
                        </Typography>
                    </div>
                }
            },
        },
        {
            flex: 1.3,
            field: "credits",
            headerName: "CREDITS",
            headerClassName: styles.header,
            renderHeader: () => (
                <div className={styles.truncateRenderCell}>
                    <Typography variant="body2">
                        <span className={styles.customCredits}>CREDITS</span>
                    </Typography>
                    <Typography variant="body2">
                        <span className={styles.customHeader}>CARD PAYMENT</span>
                    </Typography>
                </div>
            ),
            renderCell: (params) => {
                const dateReceived = new Date(params.row.received)
                const now = new Date()
                const hoursSinceReceived = Math.abs(now.getTime() - dateReceived.getTime()) / 36e5
                if (hoursSinceReceived < 72) {
                    return <FontAwesomeIcon icon={faClock} color="#808080" style={{ fontSize: '18px' }} />
                } else {
                    return <div className={styles.truncateRenderCell}>
                        <Typography noWrap variant="body2" >
                            <span className={styles.customCredits}>{params.row.credits}</span>
                        </Typography>
                        <Typography noWrap variant="body2" >
                            {params.row.creditCardAmount}
                        </Typography>
                    </div>
                }
            },
        },
        {
            flex: 0.8,
            field: "disputes",
            headerName: "DISPUTES",
            editable: false,
            headerClassName: styles.header,
            align: 'center',
            renderCell: (params) => {
                if (!params.row.disputes) {
                    return <DisputeModal key={params.row.id} id={params.row.id} updateRow={props.fetchLeads} />
                } else {
                    return <Typography noWrap variant="body2" className={styles.dispute}>
                        {params.row.disputes?.status}
                    </Typography>
                }
            }
        },
        {
            flex: 0.8,
            field: "amount",
            headerName: "AMOUNT CREDITED",
            editable: false,
            headerClassName: styles.header,
            renderHeader: () => (
                <div className={styles.truncateRenderCell}>
                    <Typography variant="body2">
                        <span className={styles.customHeader}>AMOUNT</span>
                    </Typography>
                    <Typography variant="body2">
                        <span className={styles.customHeader}>CREDITED</span>
                    </Typography>
                </div>
            ),
        },
        {
            flex: 1,
            field: "activities",
            headerName: "NOTES",
            headerClassName: styles.header,
            renderCell: (params) => {
                const notes = params.row.leads.activities
                const note = notes.map((note: Activity) => {
                    return (
                        <div>
                            <span>{note.note}</span>
                        </div>
                    )
                })
                if (notes.length === 0) {
                    return (
                        <span> - </span>
                    )
                }
                return (
                    <Tooltip title={note} placement="top-start" sx={{cursor:'pointer'}}>
                        <FontAwesomeIcon icon={faNoteSticky} color="#fff" style={{ fontSize: '18px', cursor: 'pointer' }} />
                    </Tooltip>
               )
            },
        },
    ];

    // Used to style data grid rows
    const getRowClassName = (params: GridRowClassNameParams) => {
        const classNames = [styles.row];
        const isLastRow = params.isLastVisible
        // Highlight new leads
        if (params.row.status === 'new') { classNames.push(styles.new) }
        if (isLastRow) { classNames.push(styles.lastRow) }
        return classNames.join(' ');
    };

    // Used to style data grid cells
    const getCellClassName = (params: GridCellParams) => {
        const classNames = [styles.row];
        if (params.field === 'name') { classNames.push(styles.strong) }

        if (params.field === 'county') {
            // TODO: add county colors based on ourTake
            // County colors
            // randomly push a color
            const colors = [styles.redCircle, styles.orangeCircle, styles.darkGreenCircle, styles.strongGreenCircle, styles.disabledCircle]
            const randomColor = Math.floor(Math.random() * 5)
            classNames.push(colors[randomColor])
        }
        // Disputes colors
        const disputeStatus = params.row?.disputes?.status;
        classNames.push(disputeStatus && styles[`${disputeStatus.toLowerCase()}Dispute`]);
        return classNames.join(' ');
    };

    const handleUpdate = async (data: { id: string, updatedData: Partial<BuyerLead> }) => {
        await buyerLeadService.updateBuyerLead(data)
        props.fetchLeads()
    }

    return (
        <DataGrid
            rows={props.leads}
            editMode="row"
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={(newRowSelectionModel) => {
                props.setRowSelectionModel(newRowSelectionModel); // Update the state with the selected rows
            }}
            rowSelectionModel={props.rowSelectionModel}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            getRowClassName={getRowClassName}
            getCellClassName={getCellClassName}
            columnHeaderHeight={80}
            sx={{
                border: '0px',
                p: 2,
                color: '#ffffff',
                fontWeight: '400px',
                '& .MuiCheckbox-colorPrimary.Mui-checked': {
                    color: '#01B1F4',
                },
                '.MuiCheckbox-colorPrimary': {
                    color: 'white'
                },
                '.MuiDataGrid-withBorderColor': {
                    borderBottomColor: 'rgba(217, 217, 217, 0.3)'
                },
                '.MuiDataGrid-row--editing .MuiDataGrid-cell': {
                    backgroundColor: "transparent",
                }
            }}
            onRowClick={(params) => { params.row.status === 'new' && handleUpdate({ id: params.row.id, updatedData: { status: 'viewed' } }) }}
            hideFooter
            classes={checkboxClasses}
            disableColumnMenu={true}
        />
    );
}

export default BuyerLeadsTable;
