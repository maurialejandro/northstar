import { Button, Grid } from '@mui/material';
import { ExtendedLead } from '../../../../../types/leadTypes';
import ItemDetail from '../../../buyerDetail/customCard/ItemDetail';
import { formatDateTime } from '../../../../../utils/formatDateTime';
import disputeService from '../../../../../services/disputesService';

type Props = {
    lead: ExtendedLead[]
    getLead: () => Promise<ExtendedLead>
    setLead: (lead: ExtendedLead[]) => void
}

const BuyerLeadInformation = ({
    lead,
    getLead,
    setLead,
}: Props) => {
    const buyer = lead[0]?.buyer_leads?.[0]?.users ? lead[0]?.buyer_leads?.[0]?.users : null
    const dispute = lead[0]?.buyer_leads?.[0]?.disputes ? lead[0]?.buyer_leads?.[0]?.disputes : null
    const buyerLeads = lead[0]?.buyer_leads ? lead[0]?.buyer_leads?.[0] : null
    const { name } = lead[0] || {};

    const approveDispute = async (id: string, buyer_lead_id: string) => {
        await disputeService.approveDispute({ id, buyer_lead_id }).then(() => {
            getLead().then((response) => {
                setLead([response]);
            });
        });
    };

    return (
        <>
            <h3></h3>
            <ItemDetail
                title="Buyer"
            >
                <span>
                    Buyer : <span style={{ cursor: "pointer", textDecoration: "underline"}}>{buyer?.name}</span>
                </span>
                <span>Bid: ${buyerLeads?.price}  </span>
                <Grid
                    container
                    sx={{
                        display: 'flex',
                        justifyContent: 'end',
                        alignItems: 'center',
                        gap: 1,
                        pr: 2,
                        mt: 1,
                    }}
                >
                    <Button
                        variant="contained"
                        sx={{
                            backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                            color: '#000000',
                            fontSize: '10px',
                            height: '25px',
                            fontWeight: '500',
                            textTransform: 'uppercase'
                        }}
                    >
                        Send
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
                            Now
                    </Button>
                </Grid>
            </ItemDetail>

            <ItemDetail
                title="Dispute"
            >
                <Grid container>
                    <Grid item xs={8} mb={2}>
                        <span>Dispute:{" "}
                            <span
                                style={{
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                }}
                            >{`${name}`}</span>
                        </span>
                    </Grid>
                    <Grid item xs={4}>
                                    <span>{ dispute ? formatDateTime(dispute.created!.toString()) : 'N/A' } </span>
                    </Grid>
                </Grid>
                <Grid container mb={2}>
                    <Grid item xs={12}>
                        <span>Dispute reason: { dispute ? dispute.dispute_reason : "N/A" } </span>
                    </Grid>
                </Grid>
                <Grid container mb={2}>
                    <Grid item xs={12}>
                        <span>Dispute Detail: { dispute ? dispute.dispute_message : "N/A" } </span>
                    </Grid>
                </Grid>
                {
                    dispute?.status === 'Pending'
                        ? (
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
                                        approveDispute(dispute.id, buyerLeads!.id)
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
                        )
                        : <span>Status : { dispute?.status }</span>
                }
            </ItemDetail>
        </>
    )
}

export default BuyerLeadInformation