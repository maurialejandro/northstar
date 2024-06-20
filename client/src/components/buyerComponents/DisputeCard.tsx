import { Grid, Typography } from "@mui/material";
import CircleProgressBar from "../dialGauge/CircleProgressBar.tsx";
import { useEffect, useState } from 'react';
import disputeService from '../../services/disputesService.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

function DisputeCard() {

    const [disputeRate, setDisputeRate] = useState<number>(0)
    const [averageDisputeRate, setAverageDisputeRate] = useState<number | null>(0);

    useEffect(() => {
        getDisputeRate().then((data) => {
        setDisputeRate(Math.floor(data.dispute_rate * 100));
      })

        getCalculatedAverageDisputeRate().then((data) => {
            setAverageDisputeRate(Math.floor(data.average_dispute * 100));
        });
    }, [disputeRate]);

    const getCalculatedAverageDisputeRate = async () => {
        const data = await disputeService.getCalculatedAverageDisputeRate()
        return data
    }

    const getDisputeRate = async () => {
        return await disputeService.getDisputeRate()
    }

    const getMessageBasedOnAverage = () => {
        if (averageDisputeRate === null) {
        return "Loading...";
        } else if (averageDisputeRate < disputeRate) {
            return "You dispute leads more often than average. This will lower your win rate.";
        } else if (averageDisputeRate > disputeRate) {
            return "You dispute leads less often than average - thanks! This will give you an advantage on leads when competing with buyers who have the same bid for a county.";
        } else {
            return "You dispute leads at roughly the average rate. This is fine. If you dispute less, you may improve your win rate.";
        }
    };

    return (
        <Grid
            sx={{
                height: 250,
                backgroundImage: 'linear-gradient(180deg, #FF007B 0%, #A50050 100%)',
                borderRadius: "0.4rem",
                display: "flex",
                flexDirection: "column",
                position: "relative",
            }}
                xs={3.9}
                item
            >
            <Grid
                container
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: 'center',
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                <CircleProgressBar percentage={disputeRate} circleWidth={180} version={"red"} averageRate={averageDisputeRate!} />
            <Grid>
                <Typography
                    variant="h6"
                    align="center"
                    gutterBottom
                    sx={{
                        textAlign: "start",
                        fontWeight: "700",
                    }}
                >
                    Your dispute rate
                </Typography>
                <Typography
                    sx={{
                    fontSize: "13px",
                        textAlign: "start",
                        maxWidth: "50%",
                    }}
                    align="center"
                >
                    {getMessageBasedOnAverage()}
                </Typography>
            </Grid>
            </Grid>
            <Grid
                sx={{
                    position: "absolute",
                    left: "50%",
                    bottom: 5,
                    transform: "translate(-50%, 0)"
                }}
            >
                <Typography>
                <FontAwesomeIcon
                    style={{
                        fontSize: "10",
                        color: "#fff",
                        margin: '0px 4px 1px 0',
                  }}
                    icon={faCircle}
                />
                    <span style={{fontSize: 11}}> Average dispute rate</span>
                </Typography>
            </Grid>
        </Grid>
    );
}

export default DisputeCard;
