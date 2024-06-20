import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography} from "@mui/material";
import subscriptionService from "../../../services/subscriptionService.tsx";
import { useEffect, useState } from "react";
import { SubscriptionLevel } from "../../../types/subscriptionTypes.ts";
import ConfirmationPopUp from "./ConfirmationPopUp.tsx";

type Props = {
    getSub: () => void;
    subscriptionLevels: SubscriptionLevel[];
    silver: SubscriptionLevel;
}

function SubscriptionLevelsOffer({ getSub, subscriptionLevels, silver }: Props) {
    const gold = subscriptionLevels?.find(e=>e.level === 'gold') as SubscriptionLevel;
    const bronze = subscriptionLevels?.find(e=>e.level === 'bronze') as SubscriptionLevel;
    const [selectedSubscriptionLevel, setSelectedSubscriptionLevel] = useState<string>(silver?.id ?? '');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSubscriptionLevel((event.target as HTMLInputElement).value);
    };

    const handleSubscriptionConfirm = () => {
        subscriptionService.postSubscription(selectedSubscriptionLevel).then(() => {
            getSub();
        });
    }

    useEffect(() => {
        if (selectedSubscriptionLevel === ''){ setSelectedSubscriptionLevel(silver?.id) }
    }, [selectedSubscriptionLevel, silver?.id]);

    const bodyText = [
        `Your credit card will be charged $${subscriptionLevels?.find(e=> e.id === selectedSubscriptionLevel)?.charge} now, and subsequently charged every month. Each month you will receive $${subscriptionLevels?.find(e=> e.id === selectedSubscriptionLevel)?.credit} non-refundable credits, which are redeemed against new leads assigned to you, unless you dispute them.`,
        `You may cancel your subscription at any time, and move back to ad-hoc billing.`
    ];

    return (
            <Grid container sx={{p:0, display: 'flex'}} >
               <Grid item xs={12} sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                        <Typography gutterBottom variant="h5" component="div">Subscriptions</Typography>
                        <Typography gutterBottom> - </Typography>
                        <Typography gutterBottom>earn free credits every month when you subscribe</Typography>
                    </Grid>
                <Grid item xs={12} sx={{display: 'flex', alignItems:'center', gap:1, mb:2}}>
                    <FormControl>
                        <RadioGroup
                            value={selectedSubscriptionLevel}
                            onChange={handleChange}
                        >
                            {subscriptionLevels && bronze && <FormControlLabel value={bronze.id} control={<Radio />} label={'Bronze - $' + bronze.charge + ' per month, earn $' + bronze.credit + ' credits'} />}
                            {subscriptionLevels && silver && <FormControlLabel value={silver.id} control={<Radio />} label={'Silver - $' + silver.charge + ' per month, earn $' + silver.credit + ' credits'} />}
                            {subscriptionLevels && gold && <FormControlLabel value={gold.id} control={<Radio />} label={'Gold - $' + gold.charge + ' per month, earn $' + gold.credit + ' credits'} />}
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sx={{display: 'flex', alignItems:'center', gap:1, mb:2}}>
                    {subscriptionLevels?.find(e=> e.id === selectedSubscriptionLevel) && <ConfirmationPopUp
                        title={'Confirm Subscription'}
                        bodyText={bodyText}
                        handleConfirm={handleSubscriptionConfirm}
                        goldBtn={true}
                        confirmText={'Confirm, Subscribe'}
                        openButtonText={"Subscribe Now"}
                    />}
                </Grid>
            </Grid>
    );
}

export default SubscriptionLevelsOffer;