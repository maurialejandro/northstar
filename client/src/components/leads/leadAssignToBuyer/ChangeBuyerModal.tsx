import { Box, Grid, Modal, Typography } from '@mui/material'
import { Buyer } from '../../../types/buyerType'
import ChangeBuyerTable from './ChangeBuyerTable'
import { CountyBid } from '../../../types/countyBidsType'
import { BuyerLead } from '../../../types/buyerLeadTypes'
import { Lead } from '../../../types/leadTypes'
import { useEffect, useState } from 'react'
import disputeService from '../../../services/disputesService'
// import countyBidService from '../../../services/county_bids.service'

type Props = {
    openChangeBuyer: boolean
    handleClose: () => void
    interestedBuyers: Buyer[]
    selectedBuyer: Buyer | undefined
    countyBids: CountyBid[]
    setSelectedBuyer: (buyer: Buyer) => void
    setBuyerLead: (buyerLead: BuyerLead) => void
    buyerLead: BuyerLead | undefined
    lead: Lead
    thisLeadBuyerLead: BuyerLead | undefined
}

export default function ChangeBuyerModal({
    openChangeBuyer,
    handleClose,
    interestedBuyers,
    selectedBuyer,
    countyBids,
    setSelectedBuyer,
    setBuyerLead,
    buyerLead,
    lead,
    thisLeadBuyerLead
}: Props) {

    const [lastDay, setLastDay] = useState<string>("")
    const [buyersDisputes, setBuyersDisputes] = useState<(CountyBid & { dispute_rate: number })[]>([])
    const [loadingDisputes, setLoadingDisputes] = useState(false)
    const [disputeRate, setDisputeRate] = useState<number>(0)

    useEffect(() => {
        if (!selectedBuyer) { return }
        const lastDay = calculateLastSentDateDifference(selectedBuyer.buyer_leads!)
        setLastDay(lastDay)
    }, [selectedBuyer])

    useEffect(() => {
        if (openChangeBuyer) {
        setLoadingDisputes(true)
        disputeService.getBuyersDisputes(lead.county_id).then((response) => {
            setBuyersDisputes(response)
            setLoadingDisputes(false)
         })
        }
    }, [openChangeBuyer, lead.county_id])

    useEffect(() => {
        if (selectedBuyer! && openChangeBuyer) {
            disputeService.getDisputeRateById(selectedBuyer.id.toString()).then((response) => {
                const disputeRate = response.dispute_rate * 100
                setDisputeRate(disputeRate)
            })
        }
    }, [selectedBuyer, openChangeBuyer])

    const subscriptions = selectedBuyer?.subscriptions && selectedBuyer.subscriptions.length > 0
        ? selectedBuyer.subscriptions[0].subscription_level_id.level.charAt(0).toUpperCase() + selectedBuyer?.subscriptions[0].subscription_level_id.level.slice(1)
        : null

    const calculateLastSentDateDifference = (buyers: BuyerLead[]): string => {

        const validBuyers = buyers
            .filter((buyer) => buyer.sent_date !== null)
            .sort((a, b) => new Date(a.sent_date!).getTime() - new Date(b.sent_date!).getTime());

        if (validBuyers.length === 0) {
            return '';
        }
        const currentDate = new Date();
        const lastSentDate = new Date(validBuyers[validBuyers.length - 1].sent_date!);

        const timeDifference = currentDate.getTime() - lastSentDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        return daysDifference.toString()
    };

    return (
        <Modal
        open={openChangeBuyer}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        >
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 900,
                bgcolor: '#1A2033',
                borderRadius: '10px',
                boxShadow: 24,
                p: 4,
                paddingBottom: '0px',
                paddingRight: '0px',
            }}
        >
            <Grid
                container
                spacing={3}
            >
                <Grid
                    item
                    md={3}
                    sx={{
                        paddingTop: '0px !important',
                        paddingLeft: '0px !important',
                    }}
                >
                    <Typography sx={{marginTop: 2, marginBottom: 0, marginLeft:2}} variant='h6'>Targeted Buyer:</Typography>
                    <Typography sx={{marginTop: 0, marginLeft: 2}} variant='h6'>{selectedBuyer?.name}</Typography>

                <Grid
                    mt={5}
                    sx={{
                        fontSize: '13px',
                        marginLeft: 2,
                        marginTop: 8,
                        marginBottom: 2,
                        paddingBottom: 2,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <span>{`${lead?.county_id?.name} County Max Bid :${thisLeadBuyerLead?.price ? thisLeadBuyerLead?.price : 0}`} </span>
                    <span>{`Last Lead Received: ${lastDay ? lastDay : 0} days`}</span>
                    <span>{subscriptions} Subscription</span>
                    <span>Monthly budget: {selectedBuyer?.monthly_budget}</span>
                    <span>Dispute Rate: {disputeRate}%</span>
                </Grid>
            </Grid>
            <Grid
                item
                md={9}
                sx={{
                    paddingLeft: '0px !important',
                    borderLeft: 'solid 1px #fff',
                    paddingTop: '0px !important',
                    position: 'relative'
                }}
            >
                <ChangeBuyerTable
                    interestedBuyers={interestedBuyers}
                    countyBids={countyBids}
                    setSelectedBuyer={setSelectedBuyer}
                    setBuyerLead={setBuyerLead}
                    buyerLead={buyerLead}
                    lead={lead}
                    handleClose={handleClose}
                    calculateLastSentDateDifference={calculateLastSentDateDifference}
                    loadingDisputes={loadingDisputes}
                    buyersDisputes={buyersDisputes}
                />
            <Grid>
            </Grid>
            </Grid>
            </Grid>
        </Box>
        </Modal>
    )
}
