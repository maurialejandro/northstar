import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography, Box, Grid, Button } from "@mui/material";
import { useState } from "react";
import { ExtendedDispute } from "../../types/disputesTypes.ts";
import DisputeDenyModal from "./DisputeDenyModal";
import disputeService from "../../services/disputesService.tsx";

type Props = {
  disputeData: ExtendedDispute;
  fetchDisputes: () => void;
};

function DisputeCard({ disputeData, fetchDisputes }: Props) {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState(true);
  const { dispute_reason, dispute_message, dispute_date } = disputeData;
  const { price = 50, sent_date } = disputeData.buyer_leads;
  const { name, email, phone, address } = disputeData.buyer_leads.leads;
  const buyer_name = disputeData.buyer_leads.users.name;
  const dispute_rate = '??'

  return (
    <>
      <Grid
        item
        xs={12}
        sx={{
          border: "1px solid #FF9E27",
          borderRadius: "10px",
          mb: 1,
          color: "#FFF",
        }}
      >
        <Grid container >

          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', p: 3, py: 2 }} onClick={() => { setDisplay(!display); }}>
            <Typography align="left" variant="body2" sx={{ fontWeight: "600", mr: 2 }}>
              <><strong>Disputed: </strong>{dispute_date}</>
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
                <Typography key={e} align="left" variant="body2">
                  {e}
                </Typography>
              ))}
            </Grid>

            <Grid item xs={2.5} >
              {[name, phone, address, email].map((e) => (
                <Typography key={e} align="left" variant="body2">
                  {e}
                </Typography>
              ))}
            </Grid>

            {/* COL 2 */}
            <Grid item xs={0.6} >
              {['Buyer', 'Bid', 'Sent'].map((e) => (
                <Typography key={e} align="left" variant="body2">
                  {e}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={1.3}>
              {[buyer_name, '$' + price, sent_date].map((e) => (
                <Typography key={e} align="left" variant="body2">
                  {e}
                </Typography>
              ))}
            </Grid>

            {/* COL 3 */}
            <Grid item xs={1.5} >
              {['Dispute Rate', 'Dispute Reason', 'Dispute Details'].map((e) => (
                <Typography key={e} align="left" variant="body2">
                  {e}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={4.5} sx={{ mb: 4 }}>
              {[dispute_rate + '%', dispute_reason, dispute_message].map((e, i) => (
                <Typography key={e ? e : i} align="left" variant="body2" sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {e ? e : '---'}
                </Typography>
              ))}
            </Grid>
          </>
          }
          <Grid item xs={12} sx={{ borderTop: '1px solid rgba(217, 217, 217, 0.3)', p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "start" }}>
              <Button variant="contained" onClick={async () => { await disputeService.approveDispute({ id: disputeData.id, buyer_lead_id: disputeData.buyer_leads.id }).then(() => { fetchDisputes(); }); }} sx={{
                backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                color: '#000000',
                fontSize: '13px',
                mx: 0,
                height: '30px',
                fontWeight: '500',
                textTransform: 'uppercase'
              }} >
                Accept
              </Button>
              <DisputeDenyModal open={open} handleOpen={() => { setOpen(!open); }} handleReject={async (reason: string) => { await disputeService.denyDispute({ id: disputeData.id, updatedData: { admin_message: reason } }).then(() => { fetchDisputes(); }); }} />
            </Box>
          </Grid>
        </Grid>
      </Grid >
    </>
  );
}

export default DisputeCard;
