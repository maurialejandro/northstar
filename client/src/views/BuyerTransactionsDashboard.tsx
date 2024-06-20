import { Container, Grid } from "@mui/material";
import TransactionsSection from "../components/buyerComponents/TransactionsSection";

function BuyerTransactionsDashboard() {
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
        <Grid
          item
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "0.4rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          xs={12}
        >
          <TransactionsSection limit={25} />
        </Grid>
      </Grid>
    </Container>
  );

}

export default BuyerTransactionsDashboard;
