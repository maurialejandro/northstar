import {Button, Grid, Typography} from "@mui/material";
import CircleProgressBar from "../dialGauge/CircleProgressBar.tsx";
import { useEffect, useState } from "react";
import buyerService from "../../services/buyer.service.tsx";
import {budgetCardProps} from "../../types/buyerBudgetCardTypes.ts";

function BudgetCard() {
    const [budgetData, setBudgetData] = useState<Partial<budgetCardProps>>({});

    useEffect(() => {
        async function fetchData() {
            const data = await buyerService.getBudget();
            setBudgetData(data);
        }
        fetchData();
    }, []);

    if (!budgetData) {
        return <div>Loading...</div>;
    }

    return (
        <Grid
            item
            sx={{
                height: 250,
                backgroundImage: 'linear-gradient(180deg, #01C2FF 0%, #002195 100%)',
                borderRadius: "0.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            xs={3.9}
        >
            <Grid>
                <Typography variant={"h6"}>Monthly Budget</Typography>
                <Typography>Balance: ${budgetData.current_balance ?? "0"}</Typography>
                <Typography>Budget: ${budgetData.monthly_budget ?? "0"}</Typography>
                <Typography>Remaining: ${budgetData?.remainingAmount ?? "0"} ({budgetData.dateRange?.fromDate.slice(0, -5)} to {budgetData.dateRange?.toDate.slice(0, -5)})</Typography>
                <Typography>Pending Charges: (-${budgetData.pendingCharges})</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 2 }}
                    // on click navigate to settings page
                    onClick={() => {
                        window.location.href = "/settings?changeBudget=true";
                    }}
                >
                    CHANGE BUDGET
                </Button>
            </Grid>
            <CircleProgressBar percentage={budgetData.budgetPercentUsed!} circleWidth={180} version={"blue"} />
        </Grid>
    );
}

export default BudgetCard;
