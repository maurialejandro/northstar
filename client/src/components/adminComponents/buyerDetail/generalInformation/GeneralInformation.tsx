import { useCallback, useEffect, useMemo, useState } from 'react';
import ItemDetail from '../customCard/ItemDetail'
import buyerService from '../../../../services/buyer.service';
import { Buyer } from '../../../../types/buyerType';
import { BuyerLead } from '../../../../types/buyerLeadTypes';
import disputeService from '../../../../services/disputesService';
import { formatDateTime } from '../../../../utils/formatDateTime';
import countyBidService from '../../../../services/county_bids.service';
import { CountyBid } from '../../../../types/countyBidsType';
import { Transaction } from '../../../../types/transactionType';

type Props = {
    buyerId: string
    leads: BuyerLead[]
    transactions: Transaction[]
}

const countDisputes = (data: BuyerLead[]) => {
        return data.reduce((acc, item) => {
            if (item.disputes && item.disputes !== null) {
                acc++;
            }
            return acc;
        }, 0);
};

const calculateSpend = (data: Transaction[]) => {
  return data.reduce((accumulator, transaction) => {
    if (transaction.stripe_transaction_id !== null) {
      return accumulator + transaction.amount;
    }
    return accumulator;
  }, 0);
};

const GeneralInformation = ({
    buyerId,
    leads,
    transactions
}: Props) => {
    const [contactInfo, setContactInfo] = useState<Partial<Buyer>>({})
    const [disputeRate, setDisputeRate] = useState<number>(0)
    const [countyBids, setCountyBids] = useState<CountyBid[]>([])

    // useMemo because sometimes it may be difficult to do this calculation
    const disputesCount = useMemo(() => countDisputes(leads), [leads]);
    const spend = useMemo(() => calculateSpend(transactions), [transactions]);

    const { name, email, phone } = contactInfo

    const subscriptionStarted = contactInfo?.subscriptions && contactInfo.subscriptions.length > 0
        ? contactInfo.subscriptions[0]?.start_date
        : null;

    const subscriptionName = contactInfo?.subscription_levels && contactInfo.subscription_levels.length > 0
        ? contactInfo.subscription_levels[0]?.level
        : null;

    const credit = contactInfo?.subscription_levels && contactInfo.subscription_levels.length > 0
        ? contactInfo.subscription_levels[0]?.credit
        : null;

    const getBuyer = useCallback(async () => {
        const res = await buyerService.getBuyerById(buyerId)
        return res.data
    }, [buyerId]);

    const getDisputeRate = useCallback(async () => {
        const res = await disputeService.getDisputeRateById(buyerId);
        return res;
    }, [buyerId])

    const getCountiesBidsByAdmin = useCallback(async () => {
        const res = await countyBidService.getCountiesBidsByAdmin(buyerId);
        return res;
     }, [buyerId])

    useEffect(() => {
        getBuyer().then((buyerData) => {
            setContactInfo(buyerData);
        });
    }, [getBuyer])

    useEffect(() => {
        getDisputeRate().then((response) => {
            setDisputeRate(response.dispute_rate * 100)
        })
    }, [getDisputeRate])

    useEffect(() => {
        getCountiesBidsByAdmin().then((response) => {
            setCountyBids(response)
        })
    }, [getCountiesBidsByAdmin])

    return (
        <>
            <h3>{ name }</h3>
            <ItemDetail
                title="Contact Info"
            >
                <span>Phone: { phone }</span>
                <span>SMS: { phone }</span>
                <span>Email: { email }</span>
            </ItemDetail>

            <ItemDetail
                title="Contact Info"
            >
                <span>Leads received: { leads.length } </span>
                <span>Leads disputed: { disputesCount } </span>
                <span>Dispute rate: {`${disputeRate}%`} </span>
            </ItemDetail>

             <ItemDetail
                title="Subscription"
            >
                <span>Subscription started: { formatDateTime(subscriptionStarted) } </span>
                <span>Subscription level: { subscriptionName } </span>
            </ItemDetail>

            <ItemDetail
                title="Financials"
            >
                <span>Leads received: { leads.length } </span>
                <span>Credit: {`$ ${credit}`} </span>
                <span>Spend: {`$ ${spend}`} </span>
            </ItemDetail>

            <ItemDetail title={"County Bids"}>
                {countyBids.map((item) => {
                    return (
                        <span key={item.id}>
                            {item.counties.name}, {item.counties.state} : {`$${item.bid_amount}`}
                        </span>
                    )
                })}
            </ItemDetail>

        </>
    )
}

export default GeneralInformation