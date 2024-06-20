import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography, Box, Grid } from "@mui/material";
import { useState } from "react";
import { ExtendedDispute } from "../../types/disputesTypes.ts";

type Props = {
    disputeData: ExtendedDispute;
};

function ResolvedDisputeCard({ disputeData }: Props) {
    const { dispute_reason, dispute_message, status, dispute_date } = disputeData;
    const { price = 50, sent_date } = disputeData.buyer_leads;
    const { name, email, phone, address } = disputeData.buyer_leads.leads;
    const buyer_name = disputeData.buyer_leads.users.name;
    const dispute_rate = '??'

    const [display, setDisplay] = useState(false);
    const color = status === 'Rejected' ? "#FF8383" : "#12974B"; // 01B1F4
    return (
        <>
            <Grid
                item
                xs={12}
                sx={{
                    border: '1px solid ' + color,
                    borderRadius: "10px",
                    mb: 1,
                    color: "#FFF",
                }}
            >
                <Grid container >

                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', p: 3, py: 2 }} onClick={() => { setDisplay(!display); }}>
                        <Typography align="left" variant="body2" sx={{ fontWeight: "600", mr: 2 }}>
                            <strong>Disputed: </strong>{dispute_date?.toLocaleString()}
                        </Typography>

                        <Typography align="left" variant="body2" >
                            {name}
                        </Typography>
                        <Typography align="right" sx={{ flex: 1, px: 1, fontSize: '20px' }}>
                            {display ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} />}
                        </Typography>
                    </Grid>

                    {display && <>
                        {/* COL 1 */}
                        <Grid item xs={1} sx={{ pl: 3 }}>
                            {['Name', 'Phone', 'Address', 'Email'].map((e) => (
                                <Typography align="left" variant="body2">
                                    {e}
                                </Typography>
                            ))}
                        </Grid>

                        <Grid item xs={2.5} >
                            {[name, phone, address, email].map((e) => (
                                <Typography align="left" variant="body2">
                                    {e}
                                </Typography>
                            ))}
                        </Grid>

                        {/* COL 2 */}
                        <Grid item xs={0.6} >
                            {['Buyer', 'Bid', 'Sent'].map((e) => (
                                <Typography align="left" variant="body2">
                                    {e}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={1.3}>
                            {[buyer_name, '$' + price, sent_date].map((e) => (
                                <Typography align="left" variant="body2">
                                    {e}
                                </Typography>
                            ))}
                        </Grid>

                        {/* COL 3 */}
                        <Grid item xs={1.5} >
                            {['Dispute Rate', 'Dispute Reason', 'Dispute Details'].map((e) => (
                                <Typography align="left" variant="body2">
                                    {e}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={4.5} sx={{ mb: 4 }}>
                            {[dispute_rate + '%', dispute_reason, dispute_message].map((e) => (
                                <Typography align="left" variant="body2" sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}>
                                    {e}
                                </Typography>
                            ))}
                        </Grid>
                    </>
                    }
                    <Grid item xs={12} sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3)', p: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "start" }}>
                            <Typography align="left" variant="body2" sx={{ fontWeight: "600", mr: 2, color }}>
                                {status[0].toLocaleUpperCase() + status.slice(1)}: {dispute_reason}. {dispute_message}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Grid >
        </>
    );
}

export default ResolvedDisputeCard;
