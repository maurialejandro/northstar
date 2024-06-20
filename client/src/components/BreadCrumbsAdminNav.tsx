import Typography from "@mui/material/Typography";
import { Box, Container } from "@mui/system";
import { useLocation, useNavigate } from "react-router";
import { ReactNode } from "react";
import { Grid } from "@mui/material";

type Props = {
  children: ReactNode;
};

function BreadCrumbsAdminNav({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumbTitleStyle = {
    backgroundColor: "#e5e5e5",
    cursor: "pointer",
    border: "1px solid lightGray",
    borderTopRightRadius: "3rem",
    borderTopLeftRadius: "3rem",
    px: 3,
    py: 0.5,
    borderBottom: "0px",
    transition: "0.5s",
    "&:hover": {
      color: "black",
    },
  };
  const breadcrumbCurrentTitleStyle = {
    border: "1px solid lightGray",
    borderTopRightRadius: "3rem",
    borderBottom: "0px",
    backgroundColor: "#ffffff",
    color: "black",
  };
  return (
    <Container maxWidth={false}>
      <Typography align="left" variant="h3">
        Northstar Admin Dashboard
      </Typography>
      <Grid container sx={{ mb: "-1px" }}>
        <Grid item xs={1.5}>
          <Typography
            variant={location.pathname === "/a/buyers" ? "h5" : "h6"}
            sx={
              location.pathname === "/a/buyers"
                ? { ...breadcrumbTitleStyle, ...breadcrumbCurrentTitleStyle }
                : breadcrumbTitleStyle
            }
            onClick={() => { navigate("/a/buyers"); }}
          >
            Buyers
          </Typography>
        </Grid>

        <Grid item xs={1.5}>
          <Typography
            variant={location.pathname === "/a/leads" ? "h5" : "h6"}
            onClick={() => { navigate("/a/leads"); }}
            sx={
              location.pathname === "/a/leads"
                ? { ...breadcrumbTitleStyle, ...breadcrumbCurrentTitleStyle }
                : breadcrumbTitleStyle
            }
          >
            Leads
          </Typography>
        </Grid>

        <Grid item xs={1.5}>
          <Typography
            variant={location.pathname === "/a/disputes" ? "h5" : "h6"}
            onClick={() => { navigate("/a/disputes"); }}
            sx={
              location.pathname === "/a/disputes"
                ? { ...breadcrumbTitleStyle, ...breadcrumbCurrentTitleStyle }
                : breadcrumbTitleStyle
            }
          >
            Disputes
          </Typography>
        </Grid>
      </Grid>
      {children && (
        <Box
          sx={{
            backgroundColor: "#ffffff",
            p: 1,
            border: "1px solid lightGray",
            borderRadius: "0.4rem",
            borderTopLeftRadius: "0rem",
          }}
        >
          {children}
        </Box>
      )}
    </Container>
  );
}

export default BreadCrumbsAdminNav;
