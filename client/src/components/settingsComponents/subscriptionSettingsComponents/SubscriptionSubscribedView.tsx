import { Grid, Typography } from "@mui/material";
import { Subscription, SubscriptionLevel } from "../../../types/subscriptionTypes.ts";
import subscriptionService from "../../../services/subscriptionService.tsx";
import ConfirmationPopUp from "./ConfirmationPopUp.tsx";
import { useEffect, useState } from "react";

type Props = {
    getSub: () => void;
    subscription : Subscription
    subscriptionLevels: SubscriptionLevel[]
}

export default function SubscriptionSubscribedView({ subscription, subscriptionLevels, getSub }: Props) {
    const [upgradeChargeAndCredits, setUpgradeChargeAndCredits] = useState<{ charge: number, credit: number }>({ charge: 0, credit: 0 });
    const togglePauseSubscription = () => {
        if (subscription.can_renew) {
            subscriptionService.pauseSubscription(subscription.id).then(() => {
                getSub();
            });
        } else if (!subscription.can_renew) {
            subscriptionService.resumeSubscription(subscription.id).then(() => {
                getSub();
            });
        }
    }

    const sortedSubscriptionLevels = subscriptionLevels.sort((a, b) => a.charge - b.charge);
    const nextTier = sortedSubscriptionLevels.find(
        (tier) => tier.charge > (subscription.subscription_levels?.charge || 0)
    );

    const upgradeSubscription = () => {
        if (!nextTier) {return;}
        subscriptionService.upgradeSubscription({ subscription_level_id: nextTier.id }).then(() => {
            getSub();
        });
    }

    const getUpgradeSubData = async () => {
        await subscriptionService.upgradeSubscriptionData().then((data) => {
            setUpgradeChargeAndCredits(data.upgradeChargeAndCredits)
        });
    }

    useEffect(() => {
        getUpgradeSubData();
    }, [getSub]);

    // get the day of the month the subscription renews
    const renewDay = new Date(subscription.end_date).getDate();

    // this function adds suffixes to numbers => 1st, 2nd, 3rd, 4th, etc.
    const formatNumberWithOrdinalIndicator = (number:number) => {
        const suffixes = ["th", "st", "nd", "rd"];
        const lastDigit = number % 10;
        const secondLastDigit = Math.floor((number % 100) / 10);
        let suffix;
        if (secondLastDigit === 1 || lastDigit > 3 || lastDigit === 0) {
            suffix = suffixes[0];
        } else {
            suffix = suffixes[lastDigit];
        }
        return number.toLocaleString() + suffix;
    }

    const pauseText = [
        `You are about to pause your ${subscription.subscription_levels.level} subscription. You will not be billed until you resume your subscription.`,
        `You may renew your subscription at any time.`
    ];

    const resumeText = [
        `You are about to resume your ${subscription.subscription_levels.level} subscription.`,
        `You will be billed $${subscription.subscription_levels.charge} every ${formatNumberWithOrdinalIndicator(renewDay)} day of the month. and receive $${subscription.subscription_levels.credit} of credits.`,
        `You may pause or upgrade your subscription tier at any time.`
    ];

    const upgradeText = [
        `Your credit card will be charged $${Math.floor(upgradeChargeAndCredits?.charge)} now, and subsequently charged every month. Each month you will receive $${upgradeChargeAndCredits?.credit} non-refundable credits, which are redeemed against new leads assigned to you, unless you dispute them.`,
        `You may cancel your subscription at any time, and move back to ad-hoc billing.`
    ];

    return (
        <Grid container sx={{p:0, display: 'flex' }} >
            <Grid item xs={12} sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                <Typography gutterBottom variant="h5" component="div" >{!subscription.can_renew ? "Paused " : null} Subscription</Typography>
                <Typography gutterBottom > - </Typography>
                <Typography gutterBottom >{subscription.subscription_levels.level.charAt(0).toUpperCase() + subscription.subscription_levels.level.slice(1)}, <strong>${subscription.subscription_levels.charge}</strong> per month</Typography>
            </Grid>
            <Grid item xs={12} sx={{display: 'flex', alignItems:'center', gap:1, mb:2}}>
                {subscription.can_renew ? `You are subscribed at ${subscription.subscription_levels.level} tier. You are billed $${subscription.subscription_levels.charge} every ${formatNumberWithOrdinalIndicator(renewDay)} day of the month. and receive $${subscription.subscription_levels.credit} of credits.` : `You have a paused ${subscription.subscription_levels.level} level subscription. You can resume your subscription at any time.`}
            </Grid>
            <Grid item xs={12} sx={{display: 'flex', alignItems:'center', gap:1}}>
                <ConfirmationPopUp
                    title={subscription.can_renew ? 'Pause Subscription' : 'Resume Subscription'}
                    bodyText={subscription.can_renew ? pauseText : resumeText}
                    handleConfirm={()=>{togglePauseSubscription()}}
                    goldBtn={!subscription.can_renew}
                    confirmText={subscription.can_renew ? 'Confirm, Pause' : 'Confirm, Resume'}
                    openButtonText={subscription.can_renew ? "Pause subscription" : "Resume Subscription"}
                />
                <Typography>{subscription.can_renew ? 'You can resubscribe at any time' : `You will be billed $${subscription.subscription_levels.charge} every ${formatNumberWithOrdinalIndicator(renewDay)} day of the month. and receive $${subscription.subscription_levels.credit} of credits.`}</Typography>
            </Grid>
            {nextTier && <Grid item xs={12} sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 2}}>
                <ConfirmationPopUp
                    title={'Upgrade Subscription Tier'}
                    bodyText={upgradeText}
                    handleConfirm={() => {upgradeSubscription()}}
                    goldBtn={true}
                    confirmText={'Confirm, Subscribe'}
                    openButtonText={"Upgrade to " + nextTier.level}
                />
                <Typography>Upgrade to {nextTier.level} tier - <strong>${nextTier.charge}</strong></Typography>
            </Grid>}
        </Grid>
    );
}