import { Container, Typography } from "@mui/material";
import UserContactInfo from "../components/settingsComponents/UserContactInfo.tsx";
import ChangeBudget from "../components/settingsComponents/ChangeBudget.tsx";
import PaymentMethodsSection from "../components/settingsComponents/PaymentMethodsSection.tsx";
import SubscriptionSettingsSection from "../components/settingsComponents/SubscriptionSettingsSection.tsx";
import { useCallback, useContext, useEffect, useState } from "react";
import userService from "../services/user.service.tsx";
import { UserData } from "../types/buyerType.ts";
import DataContext from "../context/DataContext.tsx";

function SettingsView() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const { setLoggedInUser } = useContext(DataContext);

    const getLoggedInUser = useCallback(async () => {
        const data = await userService.getUserInfo();
        setLoggedInUser(data);
        setUserData(data);
    }, [setLoggedInUser, setUserData]);

    useEffect(() => {
        getLoggedInUser();
    }, [getLoggedInUser]);

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{ width: "100%", minHeight: "87vh", display:'flex', flexDirection:'column', gap:2 }}
        >
            <Typography variant="h4" component="h4" sx={{ py: 3, pl: 2 }} >
                Settings
            </Typography>
            <UserContactInfo />
            <ChangeBudget />
            <PaymentMethodsSection getLoggedInUser={getLoggedInUser}/>
            {userData?.stripe_payment_method_id && <SubscriptionSettingsSection/>}
        </Container>
    );
}

export default SettingsView;
