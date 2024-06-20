import { useContext } from "react";
import { Container, Grid } from "@mui/material";
import DataContext from "../context/DataContext";
import DisputeCard from "../components/buyerComponents/DisputeCard";
import BudgetCard from "../components/buyerComponents/BudgetCard";
import SubscriptionCard from "../components/buyerComponents/SubscriptionCard";
import CountyBidsSection from "../components/buyerComponents/CountyBidsSection";
import BuyerLeadsSection from "../components/buyerComponents/buyerLeadsSection/BuyerLeadsSection";

function BuyerDashboard() {
  const { loggedInUser } = useContext(DataContext);

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
        <DisputeCard />
        <BudgetCard />
        <SubscriptionCard loggedInUser={loggedInUser} />

        <CountyBidsSection />

        <BuyerLeadsSection
          limit={25}
          showFilters={false}
        />
      </Grid>
    </Container>

  );
}

export default BuyerDashboard;
