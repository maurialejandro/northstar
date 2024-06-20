import { Container, Grid } from "@mui/material";
import DisputesSection from "../components/adminComponents/DisputesSection.tsx";

function AdminDisputesDashboard() {
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
        <DisputesSection />
      </Grid>
    </Container>
  );
}

export default AdminDisputesDashboard;
