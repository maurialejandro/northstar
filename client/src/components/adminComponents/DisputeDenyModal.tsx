import { Box, Button, Checkbox, FormControl, Modal, TextField, Typography } from "@mui/material";
import { useState } from "react";

type Props = {
    handleReject: (reason: string) => Promise<void>
    handleOpen: () => void
    open: boolean
}

export default function DisputeDenyModal({ handleReject, open, handleOpen }: Props) {
    const [dispute, setDispute] = useState({
        admin_message: ''
    })
    const [checked, setChecked] = useState(false);

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
        handleReject(dispute.admin_message)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDispute({ ...dispute, [e.target.name]: e.target.value })
    }

    return (
        <>
            <Button variant="outlined" color={"inherit"} onClick={handleOpen} sx={{
                fontSize: '13px',
                mx: 3,
                height: '30px',
                fontWeight: '500',
                textTransform: 'uppercase'
                                              }}>
                Deny
            </Button>
            <Modal
                open={open}
                onClose={handleOpen}
            >
                <Box sx={style}>
                    <Typography sx={{ mx: 2, mb: 1 }} component="h5">
                        Deny Dispute
                    </Typography>
                    <FormControl sx={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}>

                        <TextField onChange={handleChange} placeholder="Reason for denial" name="admin_message" value={dispute.admin_message} variant="outlined" multiline maxRows={3} sx={{ mt: 1, mx: 2, width: 350, color: '#fff', border: 'solid 1px #fff', borderRadius: '5px', '& > :not(style)': { color: '#fff' } }} />
                        <Box sx={{ display: "flex", alignItems: 'center', ml: 1 }}><Checkbox checked={checked} onChange={() => { setChecked(!checked); }} /> <Typography variant='body2' >Charge Deny</Typography></Box>
                        <Box sx={{ mt: 3, }}>
                            <Button variant="contained" onClick={handleDispute} sx={{
                                backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
                                color: '#000000',
                                fontSize: '13px',
                                px: '35px',
                                py: '6px',
                                height: '30px',
                                ml: 2
                            }} >Deny</Button>
                            <Button variant="outlined" onClick={handleOpen} sx={{
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