import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./context/routes/AdminRoutes";
import ProtectedRoutes from "./context/routes/ProtectedRoutes";
import Footer from "./components/Footer";
import LoginPage from "./views/LoginPage";
import NavBar from "./components/navBar/NavBar.tsx";

function App() {
  const theme = createTheme({
    palette: {
      // this might break stuff but its worth to have
      mode: "dark",
      primary: {
        main: "#fff", // Set the primary font color as white
      },
      background: {
        default: "#12151f", // Set the default background color as black
      },
    },
    components: {
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: "#fff",
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: "2440px",
            margin: "0 auto",
            padding: "0 100px",
          },
          maxWidthLg: {
            maxWidth: '2440px !important',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <NavBar/>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
          <AdminRoutes />
          <ProtectedRoutes />
        <Footer />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
