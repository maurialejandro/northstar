import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Typography variant="h2" gutterBottom>
        Welcome to My Website
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleGetStarted}
      >
        Get Started
      </Button>
    </Box>
  );
}

export default HomePage;
