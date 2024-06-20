import { Routes, Route } from "react-router-dom";
import BuyerDashboard from "../../views/BuyerDashboard";
import BuyerLeads from "../../views/BuyerLeads";
import VerifyUser from "../../middleware/VerifyUser"
import BuyerTransactionsDashboard from "../../views/BuyerTransactionsDashboard";
import SettingsView from "../../views/SettingsView";

const ProtectedRoutes = () => {
  return (
      <Routes>
        <Route path="/b/dashboard" element={
          <VerifyUser >
            <BuyerDashboard />
          </VerifyUser>
        } />
        <Route path="/b/transactions" element={
          <VerifyUser >
            <BuyerTransactionsDashboard />
          </VerifyUser>
        } />
        <Route path="/b/leads" element={
          <VerifyUser >
            <BuyerLeads />
          </VerifyUser>
        } />
        <Route path="/settings" element={
          <VerifyUser >
            <SettingsView />
          </VerifyUser>
        } />
      </Routes>
  );
};

export default ProtectedRoutes;
