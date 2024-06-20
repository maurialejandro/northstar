/* eslint-disable multiline-ternary */
import {Grid} from "@mui/material";
import subscriptionService from "../../services/subscriptionService.tsx";
import {useEffect, useState} from "react";
import SubscriptionLevelsOffer from "./subscriptionSettingsComponents/SubscriptionLevelsOffer.tsx";
import {Subscription, SubscriptionLevel} from "../../types/subscriptionTypes.ts";
import SubscriptionSubscribedView from "./subscriptionSettingsComponents/SubscriptionSubscribedView.tsx";

function SubscriptionSettingsSection() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [subscriptionLevels, setSubscriptionLevels] = useState<SubscriptionLevel[]>([]);
    const [silver, setSilver] = useState<SubscriptionLevel | null>(null);
    const getSubscription = async () => {
        const sub = await subscriptionService.getById();
        setSubscription(sub);

        const levels = await subscriptionService.getSubscriptionLevels();
        setSubscriptionLevels(levels);
        setSilver(levels.find(e => e.level === 'silver') as SubscriptionLevel)
    }

    useEffect(() => {
        getSubscription();
    }, []);

    return (
        <Grid
            item
            sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backgroundImage:'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                borderRadius: "0.4rem",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            xs={12}
        >
            <Grid container sx={{ p:'24px', display: 'flex' }} >
                {!subscription ? (silver && <SubscriptionLevelsOffer getSub={getSubscription} subscriptionLevels={subscriptionLevels} silver={silver} />)
                    : (subscriptionLevels && <SubscriptionSubscribedView getSub={getSubscription} subscription={subscription} subscriptionLevels={subscriptionLevels} />)
                }
            </Grid>
        </Grid>
    );
}

export default SubscriptionSettingsSection;