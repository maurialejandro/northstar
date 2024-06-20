import { DataGrid, GridColDef, } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import buyerService from "../../../../services/buyer.service";
import { Buyer } from "../../../../types/buyerType";
import { Grid, Typography } from "@mui/material";

const BuyersTable = () => {

    const navigate = useNavigate();
    const [loadedBuyers, setLoadedBuyers] = useState<Buyer[]>([]);

    const fetchBuyers = async () => {
        const res = await buyerService.getAllBuyers();
        return res.data;
    };

    useEffect(() => {
        fetchBuyers().then((buyersData) => {
            setLoadedBuyers(buyersData);
        });
    }, []);

    const rows = loadedBuyers.map((buyer) => {
        return {
            id: buyer.id,
            name: buyer.name,
            email: buyer.email,
            current_balance: buyer.current_balance,
        };
    });

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Buyer Name",
            flex: 1,
            renderCell: (params) => {

                return (
                    <span
                        onClick={() => {
                            handleRowClick(params.id.toString())
                        }}
                        style={{
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                    >
                        {params.value}
                    </span>
                )

            }
        },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "current_balance", headerName: "Current Balance", flex: 1 },
    ];

    function handleRowClick(id: string) {
        navigate(`/a/buyers/${id}`, { state: { userId: id } });
    }

    return (
        <Grid
            container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: "100%",
                height: 550,
                paddingTop: "70px",
            }}
        >

            <Typography variant="h5" sx={{ paddingBottom: 1 }}>Buyers</Typography>

            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
                aria-label="Buyers"
                autoPageSize
                disableColumnMenu={true}
                style={{ width: "100%" }}
            />
        </Grid>
    )
}

export default BuyersTable