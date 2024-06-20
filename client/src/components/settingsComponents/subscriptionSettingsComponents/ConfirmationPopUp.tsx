/* eslint-disable multiline-ternary */
import { TransitionProps } from '@mui/material/transitions';
import {forwardRef, ReactElement, Ref, useState} from "react";
import {Button, Dialog, DialogContent, DialogContentText, DialogTitle, Slide} from "@mui/material";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement;
    },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
    title: string
    goldBtn: boolean;
    openButtonText: string;
    confirmText: string;
    bodyText: string[];
    handleConfirm: () => void;
}

export default function ConfirmationPopUp({openButtonText, handleConfirm, goldBtn, confirmText, bodyText, title}: Props) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const btnStyle = goldBtn ? {
        backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)',
        color: '#000000',
        fontSize: '13px',
        px: '16px',
        py: '6px',
        height: '30px'
    } : {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: 'solid 1px #fff',
        color: '#fff',
        fontSize: '13px',
        px: '16px',
        py: '6px',
        height: '30px'
    }
    return (
        <>
            <Button variant="contained" onClick={handleClickOpen}
                    sx={btnStyle}
            >
                {openButtonText}
            </Button>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent sx={{display:'flex', flexDirection:'column', gap:0}}>
                    {bodyText.map(text=>(<DialogContentText key={text}>{text}</DialogContentText>))}
                    <DialogContent sx={{display:'flex', gap:2, justifyContent:'end'}}>
                        <Button onClick={()=>{handleConfirm(); handleClose()}} sx={btnStyle}>{confirmText}</Button>
                        <Button onClick={handleClose} sx={{...btnStyle, backgroundImage: 'transparent', color: '#fff', border: 'solid 1px #fff'}}>Cancel</Button>
                    </DialogContent>
                </DialogContent>
            </Dialog>
        </>
    );
}