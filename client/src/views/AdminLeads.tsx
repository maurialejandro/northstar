import {
  Container,
  // Container,
  //   Box,
  Grid,
} from "@mui/material";
import AdminLeadsSection from "../components/adminComponents/adminLeadSection/AdminLeadsSection";

function AdminLeads() {
  return (
      <Container
          maxWidth={false}
          disableGutters
          sx={{ width: "100%", minHeight: "87vh" }}
      >
      <Grid
        container
        gap={1}
        justifyContent={"space-between"}
        sx={{ borderRadius: "0.4rem", m: "auto", py: 3 }}
      >
        <AdminLeadsSection limit={10} getArchived={false} />
      </Grid>
    </Container>
  );
}

export default AdminLeads;
