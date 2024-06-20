import { Breadcrumbs, Container, Link, Typography} from "@mui/material";
import LeadDetail from "../components/adminComponents/adminLeadsTable/leadDeteail/LeadDetail.tsx";

function AdminLeadDetail() {

    return (
        <Container
          maxWidth={false}
          disableGutters
          sx={{ width: "100%", minHeight: "87vh" }}
        >
            <h2>Lead Detail</h2>
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 2, color: "#fff", fontSize: 12}}>
                <Link underline="hover" sx={{textDecoration: "underline"}} color="inherit" href="/a/leads">
                    Leads
                </Link>
                <Typography color="text.primary" sx={{fontSize: 12}}>Lead Detail</Typography>
            </Breadcrumbs>
            <LeadDetail/>

        </Container>
    )
}

export default AdminLeadDetail;
