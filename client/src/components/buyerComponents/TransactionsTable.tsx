import { ThemeProvider, Typography, createTheme } from "@mui/material";
import { DataGrid, GridCellParams, GridColDef, GridRowId } from "@mui/x-data-grid";
import { Transaction } from "../../types/transactionType.ts";
import styles from './TransactionsTable.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import React from "react";

type Props = {
    transactions: Transaction[]
    rowSelectionModel: (string | GridRowId)[];
    setRowSelectionModel: React.Dispatch<React.SetStateAction<(string | GridRowId)[]>>
};

const theme = createTheme({
    components: {
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: '#fff'
                },
            },
        },
    },
});

function TransactionsTable(props: Props) {

  // defines columns for data grid table
    const columns: GridColDef[] = [
        {
            flex: 1,
            field: "created",
            headerName: "Date",
            headerClassName: styles.header,
            editable: false,
            renderCell: (params) => {
                params.value = new Date(params.value).toLocaleDateString("en-US")
                return (
                    <div>
                        {params.value}
                    </div>
                )
            },
        },
        {
            flex: 1,
            field: "buyer_leads.lead_id.name",
            headerName: "Name",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => {

                if (['bronze', 'silver', 'gold'].includes(params.row.type)) {
                    params.value = params.row.type.charAt(0).toUpperCase() + params.row.type.slice(1)
                    return (
                        <div>
                            {params.value} Subscription
                        </div>
                    )
                }

                function capitalizeFirstLetter(string: string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                if (params.row.type === 'subscription-credits') {
                    console.log(params.row.refers_to_transaction)
                    const subscription_level = capitalizeFirstLetter(params.row.refers_to_transaction.subscription_level.level)
                    params.value = subscription_level + ' Credits'

                    return (
                        <div>
                            {params.value}
                        </div>
                    )
                }

                if (params.row.type === 'return') {
                    params.value = 'Dispute Approved'
                    return (
                        <div>
                            {params.value}
                        </div>
                    )
                }

                if (params.row.type === 'add-credits') {
                    params.value = 'Credits Added'
                    return (
                        <div>
                            {params.value}
                        </div>
                    )
                }

                // if row.type is 'lead-assign', then return the lead name
                if (params.row.type === 'lead-assign') {
                    params.value = params.row.buyer_leads ? params.row.buyer_leads.lead_id.name.split(' ') : params.row.id
                    return (
                        <div className = { styles.leadName } >
                            <span>{params.value[0]}</span>
                            <span>{params.value[1]}</span>
                        </div >
                    )
                }

                params.value = 'Unknown'
                return (
                    <div className = { styles.leadName } >
                        <span>{params.value[0]}</span>
                        <span>{params.value[1]}</span>
                    </div >
                )

            },
        },
        {
            flex: 1,
            field: "buyer_leads.lead_id.county",
            headerName: "County",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => {
                params.value = params.row.buyer_leads ? params.row.buyer_leads.lead_id.county : 'N/A'
                return (
                    <div>
                        {params.value !== 'N/A' ? <FontAwesomeIcon className={styles.statusCircle} icon={faCircle} /> : null} {params.value}
                    </div>
                )
            },
        },
        {
            flex: 0.75,
            field: "price",
            headerAlign: "center",
            align: "center",
            headerName: "Price",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => {
                // TODO render based on transaction type
                // if transaction type is 'lead-assign', then render the lead price
                if (params.row.type === 'lead-assign') {
                    // the price should be determined at the moment the lead is assigned base on the buyer county bid
                    params.value = "wheres the price"
                    return (
                        <div>
                            {params.value}
                        </div>
                    )
                }

                params.row.type === 'add-credits'
                ? params.value = params.row.amount
                : ['bronze', 'silver', 'gold'].includes(params.row.type)
                ? params.value = params.row.amount
                : params.value = 0
                return (
                <div>
                    {params.value}
                </div>
              )
            },
        },
        {
            field: "credits",
            headerName: "Credits",
            headerClassName: styles.customCredits,
            headerAlign: "center",
            align: "center",
            // TODO - make sure this logic is correct
            renderCell: (params) => {
                const renderedValue = params.row.type === 'lead-assign' ? params.row.amount * (-1) : 0;
                const shouldDisplayMinusSign = renderedValue !== 0;
                return (
                    <div className={styles.truncateRenderCell}>
                        <Typography noWrap variant="body2">
                            <span className={styles.customCredits}>
                                {shouldDisplayMinusSign ? '-' : ''}${Math.abs(renderedValue)}
                            </span>
                        </Typography>
                    </div>
                );
            }

        },
        {
            flex: 0.75,
            field: "card-payment",
            headerAlign: "center",
            align: "center",
            headerName: "Card Payment",
            headerClassName: styles.header,
            editable: false,
            renderCell: (params) => {
                params.row.type === 'add-credits'
                ? params.value = params.row.amount
                : ['bronze', 'silver', 'gold'].includes(params.row.type)
                ? params.value = params.row.amount
                    // TODO if credits did not cover the whole lead price this should be charge to the card
                : params.value = 0
                return (
                    <div>
                        {params.value}
                    </div>
                )
            },
        },
        {
            flex: 0.75,
            field: "credit-received",
            headerAlign: "center",
            align: "center",
            headerName: "Credit Received",
            editable: false,
            headerClassName: styles.header,
            renderCell: (params) => {
                params.row.type === 'return'
                ? params.value = params.row.amount
                : params.row.type === 'add-credits'
                ? params.value = params.row.amount
                : params.row.type === 'subscription-credits'
                ? params.value = params.row.amount
                : params.value = 0
                return (
                    <div>
                        {params.value !== 0 ? `$${params.value}` : null}
                    </div>
                )
            },
        },
        {
            flex: 0.75,
            field: "balance",
            headerAlign: "center",
            align: "center",
            headerName: "Balance",
            headerClassName: styles.header,
            editable: false
        },
        {
            flex: 2,
            field: "type",
            headerName: "Notes",
            headerClassName: styles.header,
            editable: false,
            renderCell: (params) => {
                if (params.value === 'return') {
                    params.value = 'Dispute Approved';
                } else if (params.value === 'add-credits') {
                    params.value = 'Credits Added';
                } else if (params.value === 'subscription-credits') {
                    params.value = `Subscription Credits Assigned`;
                } else if (['bronze', 'silver', 'gold'].includes(params.value)) {
                    params.value = `${params.value.charAt(0).toUpperCase() + params.value.slice(1)} Subscription Charge`;
                } else if (params.value === 'lead-assign') {
                    params.value = 'Lead Assigned';
                } else {
                    params.value = null;
                }

                return (
                    <div>
                        {params.value}
                    </div>
                )
            },
        },

    ];

    // Used to style data grid cells
    const getCellClassName = (params: GridCellParams) => {
        const classNames = [];
        const colors = [styles.redCircle, styles.orangeCircle, styles.darkGreenCircle, styles.strongGreenCircle, styles.disabledCircle]
        const randomColor = Math.floor(Math.random() * 5)
        const fieldsToDollar = ['price', "card-payment", "balance"]
        if (fieldsToDollar.includes(params.field)) { classNames.push(styles.dollar) }
        classNames.push(colors[randomColor])
        return classNames.join(' ');
    };

    return (
        <ThemeProvider theme={theme}>
            <DataGrid
                rows={props.transactions}
                editMode="row"
                columns={columns}

                checkboxSelection
                onRowSelectionModelChange={(newRowSelectionModel) => {
                    props.setRowSelectionModel(newRowSelectionModel); // Update the state with the selected rows
                }}
                rowSelectionModel={props.rowSelectionModel}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
                getCellClassName={getCellClassName}
                sx={{
                    border: '0px',
                    p: 2,
                    color: '#ffffff',
                    fontWeight: '400px',
                    '.MuiDataGrid-withBorderColor': {
                        borderBottomColor: 'rgba(217, 217, 217, 0.3)'
                    },
                    '.MuiDataGrid-row--editing .MuiDataGrid-cell': {
                        backgroundColor: "transparent",
                        color: '#ffffff',
                    },
                }}
                initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                }}
                pageSizeOptions={[25]}
                hideFooter={props.transactions.length < 25}
                disableColumnMenu={true}
            />
        </ThemeProvider>
    );
}

export default TransactionsTable;
