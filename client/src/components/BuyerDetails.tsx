import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Typography, Grid, Link } from "@mui/material";
import LinearProgressWithLabel from ".//LinearProgressWithLabel";
import LeadAssignToBuyer from "./leads/leadAssignToBuyer/LeadAssignToBuyer";
import { BuyerLead } from "../types/buyerLeadTypes.ts";
import {Lead} from "../types/leadTypes.ts";

type Props = {
  data: BuyerLead[] | undefined;
};

function BuyerDetails({ data }: Props) {

  if (!data) return null;
  const lead: Lead[] = data.map((buyerLead) => {
    return buyerLead.leads;
  });

  const columns: GridColDef[] = [
    { field: "name", headerName: "Lead Name" },
    { field: "phone", headerName: "Phone" },
    { field: "email", headerName: "Email" },
    { field: "address", headerName: "Address" },
    { field: "city", headerName: "City" },
    { field: "state", headerName: "State" },
    { field: "zip_code", headerName: "ZipCode" },
    { field: "county", headerName: "County" },
    {
      field: 'buyer',
      headerName: 'Buyer',
      width: 200,
      renderCell: (params) => {
        return (
          <LeadAssignToBuyer lead={params.row} />
        )
      },
    },
  ];

  return (
    <>
      <Grid container>
        <Grid
          item
          sx={{
            height: 250,
            p: 3,
            borderRight: "1px solid lightGray",
          }}
          xs={4}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Account Settings
          </Typography>
          <Typography align="left" gutterBottom>
            Payment Status:{" "}
            <Link href="#" variant="body2">
              Card on file
            </Link>
          </Typography>
          <Typography align="left" gutterBottom>
            Dispute Rate:{" "}
            <Link href="#" variant="body2">
              50%
            </Link>
          </Typography>
          <Typography
            align="left"
            gutterBottom
            sx={{ fontSize: "0.7rem", lineHeight: "0rem" }}
          >
            (<Link href="#">what does this mean?</Link>)
          </Typography>
          <Typography align="left" gutterBottom>
            Subscription:{" "}
            <Link href="#" variant="body2">
              Bronze
            </Link>
          </Typography>
          <Typography align="left" gutterBottom>
            Next Billing Date:{" "}
            <Link href="#" variant="body2">
              22/04/2023
            </Link>
          </Typography>
        </Grid>
        <Grid
          item
          sx={{
            height: 250,
            p: 3,
          }}
          xs={4}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Monthly Budget
          </Typography>
          <LinearProgressWithLabel value={80} />
          <Typography align="left" gutterBottom>
            <Link href="#" variant="body2">
              $800
            </Link>
            Spent out of{" "}
            <Link href="#" variant="body2">
              $1000
            </Link>
          </Typography>
          <Typography align="left" gutterBottom>
            <Link href="#" variant="body2">
              $200
            </Link>
            Remaining through 07/05/2023
          </Typography>
          <Box sx={{ display: "flex" }}>
            <Button variant="outlined" color="primary" size="small">
              Add Funds
            </Button>
          </Box>
        </Grid>
        <Grid
          item
          sx={{
            height: 250,
            p: 3,
            borderLeft: "1px solid lightGray",
          }}
          xs={4}
        >
          <Typography variant="h6" align="center" gutterBottom>
            My County Bids
          </Typography>
          <Box>
            <Typography variant="h6" align="center" gutterBottom>
              County Bids Table
            </Typography>
             {/* <CountyBidsTable countyData={countyData.slice(0, 3)} /> */}
          </Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          item
          xs={4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Typography variant="h6" align="center" sx={{ mt: 5 }} gutterBottom>
            My Leads
          </Typography>
          <Button variant="outlined" color="primary" sx={{ mt: 5 }}>
            CSV
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ height: 550, width: "100%" }}>
        <DataGrid
          rows={lead}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          autoPageSize
          disableColumnMenu={true}
        />
      </Box>
    </>
  );
}

export default BuyerDetails;
