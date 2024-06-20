import { Box, Button, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useState } from "react";
import { UserData } from "../../types/buyerType.ts";

type Props = {
    loggedInUser: UserData | null
};

function SubscriptionCard({ loggedInUser }: Props) {
    const [plan, setPlan] = useState<string>('bronze');
    const [amount] = useState<number>(1);

    // Add Funds
    const handleAddFunds = async () => {
        if (amount === 0) { alert('Amount can not be 0'); return; }
        try {
            // TODO replace outDated, create logic
            // const { data } = await paymentService.paymentCheckout(loggedInUser, amount);
            // window.location.assign(data.url)
            console.log(loggedInUser);
            console.log('new payment logic needed');
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubscription = async () => {
        try {
            // TODO replace outDated, create logic
            // const response = await paymentService.subscript(loggedInUser, plan, card)
            console.log('new subscription logic needed');
        } catch (error) {
            console.error(error);
        }
    }

    const handlePlanChange = (event: SelectChangeEvent<string>) => {
        setPlan(event.target.value);
    };

    return (
        <Grid
            item
            sx={{
                height: 250,
                backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                borderRadius: "0.4rem"
            }}
            xs={3.9}
        >
            <Typography variant="h6" align="center" gutterBottom>
                Subscription & Payment
            </Typography>
            <Box>
                <div>
                    <InputLabel id="plan-label">Choose a plan</InputLabel>
                    <Select
                        labelId="plan-label"
                        id="plan"
                        value={plan}
                        onChange={handlePlanChange}
                    >
                        <MenuItem value="bronze">Bronze</MenuItem>
                        <MenuItem value="silver">Silver</MenuItem>
                        <MenuItem value="gold">Gold</MenuItem>
                    </Select>
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={handleSubscription}
                    >
                        Subscript
                    </Button>
                </div>
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={handleAddFunds}
                        sx={{ mt: 2 }}

                    >
                        Add Funds
                    </Button>
                </div>
            </Box>
        </Grid>
    );
}

export default SubscriptionCard;
