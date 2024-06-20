import { Box, Button, FormControl, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { useState } from "react";
import disputeService from "../../services/disputesService.tsx";

type Props = { id: string, updateRow: () => void };

function DisputeModal({ id, updateRow }: Props) {
    const [open, setOpen] = useState(false);
    const [dispute, setDispute] = useState({
        buyer_lead_id: id,
        dispute_reason: '',
        dispute_message: ''
    })

    function handleOpen(): void {
        setOpen(!open);
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: '#353535',
        color: '#fff',
        border: '0px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
    }

    const handleDispute = async () => {
        const disputeData = await disputeService.create(dispute)
        if (disputeData) {
            setOpen(false)
            updateRow()
        } else {
            alert('Could not complete action. Please try again.')
        }
        setOpen(false)
    }

    const handleChange = (e: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setDispute({ ...dispute, [e.target.name]: e.target.value })
    }

    const reasons = ['Unimproved Land', 'Listed on MLS or FSBO.com', 'Mobile Home in park', 'Wholesaler', 'Not the owner', 'Not Selling', 'No Contact', 'Wants Retail Value']

    return (
        <>
            <Typography onClick={handleOpen} component="div" variant="body2" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>Dispute</Typography>
            <Modal
                open={open}
                onClose={handleOpen}
            >
                <Box sx={style}>
                    <Typography sx={{ mx: 2, mb: 1 }} component="div">
                        Dispute
                    </Typography>
                    <FormControl sx={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Select
                            value={dispute.dispute_reason}
                            size="small"
                            displayEmpty
                            name="dispute_reason"
                            onChange={handleChange}
                            renderValue={(selected) => {
                                if (!selected) {
                                    return '- select reason -';
                                }
                                return selected
                            }}
                            sx={{ width: 350, mx: 2, color: '#fff', border: 'solid 1px #fff', borderRadius: '4px', 'svg': { color: '#fff' } }}
                        >
                            <MenuItem disabled value="">
                                - select reason -
                            </MenuItem>
                            {reasons.map((reason) => <MenuItem key={reason} value={reason}>{reason}</MenuItem>)}
                        </Select>
                        <TextField onChange={handleChange} placeholder="message (optional)" name="dispute_message" value={dispute.dispute_message} variant="outlined" multiline maxRows={3} sx={{ mt: 1, mx: 2, width: 350, color: '#fff', border: 'solid 1px #fff', borderRadius: '5px', '& > :not(style)': { color: '#fff' } }} />
                        <Box sx={{ mt: 3, }}>
                            <Button variant="contained" onClick={handleDispute} sx={{
                                backgroundImage: dispute.dispute_reason === '' ? 'linear-gradient(180deg, #CCCCCC 0%, #AAAAAA 100%)' : 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                                color: '#000000',
                                fontSize: '13px',
                                px: '25px',
                                py: '6px',
                                height: '30px',
                                ml: 2
                            }} disabled={dispute.dispute_reason === ''} >dispute</Button>
                            <Button variant="outlined" onClick={() => { setOpen(false); }} sx={{
                                ml: 1,
                                color: '#fff',
                                border: 'solid 1px #fff',
                                fontSize: '13px',
                                height: '30px',
                                px: '20px',
                                py: '6px'
                            }}>Cancel</Button>
                        </Box>
                    </FormControl>
                </Box>
            </Modal>
        </>);
}

export default DisputeModal;
