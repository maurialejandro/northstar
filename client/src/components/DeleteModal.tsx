import { Box, Button, Modal, Typography } from "@mui/material";

type DeleteModalProps = {
    open: boolean,
    handleClose: () => void
    handleDelete: () => void
    titleText: string
    messageText: string
}

export default function DeleteModal({ open, handleClose, handleDelete, titleText, messageText }: DeleteModalProps) {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                borderRadius: "0.4rem",
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" align="center">
                    {titleText}
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }} align="center">
                    {messageText}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, fontWeight: '1000' }}>
                    <Button sx={{ fontWeight: '800' }} onClick={handleClose} variant="contained">Cancel</Button>
                    <Button sx={{ fontWeight: '800' }} onClick={() => { handleDelete(); handleClose() }} variant="contained" color="error" >Delete</Button>
                </Box>
            </Box>
        </Modal>
    );
}