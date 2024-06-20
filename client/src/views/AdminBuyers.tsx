import { Container } from "@mui/material";

import BuyersTable from "../components/adminComponents/adminBuyerSection/BuyersTable/BuyersTable.tsx";

function AdminBuyers() {

    return (
        <Container
            maxWidth={false}
            disableGutters
        >
            <BuyersTable/>
        </Container>
  );
}

export default AdminBuyers;
