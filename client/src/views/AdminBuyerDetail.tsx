import {Breadcrumbs, Container, Link, Typography } from "@mui/material";
import BuyerDetail from "../components/adminComponents/buyerDetail/BuyerDetail.tsx";

function AdminBuyerDetail() {

    return (
        <Container
          maxWidth={false}
          disableGutters
          sx={{ width: "100%", minHeight: "87vh" }}
        >
            <h2>Buyer Detail</h2>
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 2, color: "#fff", fontSize: 12}}>
                <Link underline="hover" sx={{textDecoration: "underline"}} color="inherit" href="/a/buyers">
                    Buyers
                </Link>
                <Typography color="text.primary" sx={{fontSize: 12}}>Buyer Detail</Typography>
            </Breadcrumbs>
            <BuyerDetail />

        </Container>
    );
}

export default AdminBuyerDetail;
