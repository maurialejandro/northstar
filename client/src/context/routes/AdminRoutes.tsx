import { Routes, Route } from "react-router-dom";
import AdminLeads from "../../views/AdminLeads";
import AdminDisputesDashboard from "../../views/AdminDisputesDashboard.tsx";
import AdminBuyers from "../../views/AdminBuyers";
import AdminBuyerDetail from "../../views/AdminBuyerDetail";
import AdminLeadDetail from "../../views/AdminLeadDetail";
import VerifyAdmin from "../../middleware/VerifyAdmin"

const AdminRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/a/leads" element={
          <VerifyAdmin >
            <AdminLeads />
          </VerifyAdmin>
        } />
        <Route path="/a/disputes" element={
          <VerifyAdmin >
            <AdminDisputesDashboard />
          </VerifyAdmin>
        } />
        <Route path="/a/buyers" element={
          <VerifyAdmin >
            <AdminBuyers />
          </VerifyAdmin>
        } />
        <Route path="/a/buyers/:id" element={
          <VerifyAdmin >
            <AdminBuyerDetail />
          </VerifyAdmin>
        } />
        <Route path="/a/leads/:id" element={
          <VerifyAdmin >
            <AdminLeadDetail />
          </VerifyAdmin>
        } />
      </Routes>

    </>
  );
};

export default AdminRoutes;
