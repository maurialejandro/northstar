import {
  Container,
  Grid,
  // Box,
} from "@mui/material";
import BuyerLeadsSection from "../components/buyerComponents/buyerLeadsSection/BuyerLeadsSection";

function BuyerLeads() {
  // TODO fetch leads and pass as prop to BuyerLeadsSection
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
        sx={{ borderRadius: "0.4rem", m: "auto", py: 3, height: "100%" }}
      >
        <BuyerLeadsSection limit={50} showFilters={true} />
      </Grid>
    </Container>

  );
}

export default BuyerLeads;
