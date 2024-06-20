import { useState, useEffect } from "react";
import { Lead } from "../../../types/leadTypes.ts";
import { Buyer } from "../../../types/buyerType.ts";
import { BuyerLead } from "../../../types/buyerLeadTypes.ts";
import { CountyBid } from "../../../types/countyBidsType.ts";
import ChangeBuyerModal from './ChangeBuyerModal.tsx';

type Props = {
    lead: Lead;
};

const LeadAssignToBuyer = (props: Props) => {
    const lead = props.lead;
    const [selectedBuyer, setSelectedBuyer] = useState<Buyer | undefined>(undefined);
    const [interestedBuyers, setInterestedBuyers] = useState<Buyer[]>([]);
    const [openChangeBuyer, setOpenChangeBuyer] = useState<boolean>(false)
    const [countyBids, setCountyBids] = useState<CountyBid[]>([])
    const [thisLeadBuyerLead, setThisLeadBuyerLead] = useState<BuyerLead | undefined>(undefined)

    useEffect(() => {
        const thisLeadCounty = lead.county_id
        const thisCountyBids = thisLeadCounty?.county_bids
        setCountyBids(thisCountyBids!)
        const thisLeadInterestedBuyers = thisCountyBids?.map((bid: CountyBid) => bid.users)
        if (!thisLeadInterestedBuyers) { return }
        const thisLeadBuyerLeads = lead.buyer_leads
        if (thisLeadBuyerLeads && thisLeadBuyerLeads.length > 0) {
            const nonDeletedLeads = thisLeadBuyerLeads.find((lead: BuyerLead) => lead.deleted !== null);
            setThisLeadBuyerLead(nonDeletedLeads)
            const thisLeadBuyer = thisLeadInterestedBuyers.find((buyer: Buyer) => {
                return buyer.id.toString() === thisLeadBuyerLead!.user_id;
            });

            setSelectedBuyer(thisLeadBuyer);
        }
        setInterestedBuyers(thisLeadInterestedBuyers)
    }, [lead.buyer_leads, lead.county_id, thisLeadBuyerLead])

    const handleClose = () => {
        setOpenChangeBuyer(false)
    }

    return (
        <>
        <span
          onClick={() => {
            setOpenChangeBuyer(true)
        }}
          style={{
          cursor: "pointer",
          textDecoration: "underline"
        }}
        >
          {selectedBuyer ? selectedBuyer.name : "Not Assigned"}
        </span>
        <ChangeBuyerModal
          openChangeBuyer={openChangeBuyer}
          handleClose={handleClose}
          interestedBuyers={interestedBuyers}
          selectedBuyer={selectedBuyer}
          countyBids={countyBids}
          setSelectedBuyer={setSelectedBuyer}
          lead={lead}
          thisLeadBuyerLead={thisLeadBuyerLead}
          buyerLead={thisLeadBuyerLead}
          setBuyerLead={setThisLeadBuyerLead}
        />
        </>
    );
};

export default LeadAssignToBuyer;
