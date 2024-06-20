import { Button, Grid } from '@mui/material';
import { BuyerLead } from '../../../../types/buyerLeadTypes'
import ItemDetail from '../customCard/ItemDetail';
import { formatDateTime } from '../../../../utils/formatDateTime';
import disputeService from '../../../../services/disputesService';
import { useEffect, useState } from 'react';

type Props = {
    leads: BuyerLead[]
    getLeads: () => void
    disputes: BuyerLead[]
}

const BuyerDisputes = ({ getLeads, disputes }: Props) => {

    const [visibleDisputes, setVisibleDisputes] = useState(
        disputes
    );

    useEffect(() => {
        setVisibleDisputes(disputes);
    }, [disputes]);

    const approveDispute = async (id: string, buyer_lead_id: string) => {
        await disputeService.approveDispute({ id, buyer_lead_id }).then(() => {
            const updatedDisputes = visibleDisputes.filter((dispute) => dispute.disputes.id !== id);
            setVisibleDisputes(updatedDisputes);
            getLeads();
        });
    };

    return (
        <>
            <h3>Disputes</h3>
            {
                visibleDisputes.map((dispute) => {
                    return (
                        <ItemDetail
                        >
                            <Grid container>
                                <Grid item xs={8} mb={2}>
                                    <span>Dispute:{" "}
                                        <span
                                            style={{
                                                cursor: "pointer",
                                                textDecoration: "underline",
                                            }}
                                        >{`${dispute.leads.name}`}</span>
                                    </span>
                                </Grid>
                                <Grid item xs={4}>
                                    <span>{ formatDateTime(dispute.created.toString()) } </span>
                                </Grid>
                            </Grid>
                            <Grid container mb={2}>
                                <Grid item xs={12}>
                                    <span>Dispute reason: { dispute.disputes?.dispute_reason ? dispute.disputes?.dispute_reason : "N/A" } </span>
                                </Grid>
                            </Grid>
                            <Grid container mb={2}>
                                <Grid item xs={12}>
                                    <span>Dispute Detail: { dispute.disputes?.dispute_message ? dispute.disputes?.dispute_message : "N/A" } </span>
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'end',
                                    alignItems: 'center',
                                    gap: 1,
                                    pr: 2
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        approveDispute(dispute.disputes.id, dispute.disputes.buyer_lead_id)
                                    }}
                                        sx={{
                                            backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                                            color: '#000000',
                                            fontSize: '10px',
                                            height: '25px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        Accept
                                    </Button>

                                <Button
                                    variant="outlined"
                                    color={"inherit"}
                                    sx={{
                                        fontSize: '10px',
                                        height: '25px',
                                        fontWeight: '500',
                                        textTransform: 'uppercase'
                                    }}>
                                        Deny
                                    </Button>

                            </Grid>
                        </ItemDetail>
                    )
                })
            }

        </>
    )
}

export default BuyerDisputes