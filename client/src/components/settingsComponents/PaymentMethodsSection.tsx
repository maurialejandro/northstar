import { Box, Button, Grid, Menu, MenuItem, Modal, Typography } from "@mui/material";
import paymentService from "../../services/payment.service.tsx";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import DataContext from "../../context/DataContext.tsx";
import { PaymentMethod } from "../../types/paymentType.ts";

type Props = {
    getLoggedInUser: () => void
}

function PaymentMethodsSection({getLoggedInUser}: Props) {
    const [pm, setPm] = useState<PaymentMethod[]>([]);
    const {loggedInUser} = useContext(DataContext);
    const [open, setOpen] = useState(false);
    const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<PaymentMethod | null>(null);

    const attachPaymentMethod = async () => {
        const { data } = await paymentService.setUpCheckout(loggedInUser);
        window.location.assign(data.url)
    }

    const getLoggedInUserRef = useRef(getLoggedInUser);

    useEffect(() => {
        getLoggedInUserRef.current = getLoggedInUser;
    }, [getLoggedInUser, pm]);

    const getPaymentMethods = useCallback(() => {
        paymentService.getPaymentMethods().then((data) => {
            setPm(data);
            setDefaultPaymentMethod(data.find(e=>e.default) ?? null);
            getLoggedInUserRef.current(); // Invoking the function from ref
        });
    }, []);

    useEffect(() => {
        getPaymentMethods();
    }, [getPaymentMethods]);

    const handleSelectDefaultPaymentMethod = async (paymentMethodId:string) => {
        const response = await paymentService.updateDefaultPaymentMethod(paymentMethodId, loggedInUser?.id as string);
        if (response.status === 200) {
            setOpen(false)
            handleClose()
            getPaymentMethods()
        }
    }

    const detachPaymentMethod = async (paymentMethodId:string) => {
        const response = await paymentService.detachPaymentMethod(paymentMethodId, loggedInUser?.id as string);
        if (response.status === 200){
            getPaymentMethods()
        }
    }

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Grid
            item
            sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backgroundImage:'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                borderRadius: "0.4rem",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb:'1rem'
            }}
            xs={12}
        >
            <Grid container sx={{p:'24px', display: 'flex' }} >
                <Grid item xs={11} sx={{display: 'flex', alignItems:'center', gap:1, mb:2}}>
                    <Typography gutterBottom variant="h5" component="div" >Credit Card  </Typography>
                    <Typography gutterBottom > - </Typography>
                    <Typography gutterBottom >for subscriptions and leads</Typography>
                </Grid>
                <Grid item xs={1} sx={{display:'flex', justifyContent:'end', height: '32px'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        id="basic-button"
                        aria-controls={openMenu ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        Edit
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem onClick={()=> {attachPaymentMethod()}}>Attach new card</MenuItem>
                        { pm.length ? <MenuItem onClick={ () => { setOpen(true) } }>Set new default card</MenuItem> : null }
                    </Menu>
                </Grid>
                <Grid item xs={12}>
                    <Typography><strong>Card on file:</strong> {defaultPaymentMethod ? defaultPaymentMethod.brand + ', ending in ' + defaultPaymentMethod.last4 : 'No payment method selected'}</Typography>
                </Grid>

                <Modal
                    open={open}
                    onClose={()=>{
                      setOpen(false)
                    }}
                >
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 400,
                      bgcolor: '#12151f',
                      boxShadow: 24,
                      p: 4,
                        }}>
                        <Typography variant="h6" component="h2">
                            Payment Methods
                        </Typography>
                        {pm?.map((card) => <Box
                            key={card.id}
                            sx={{display:'flex', justifyContent:'space-between', border:card.default ? '1px solid rgb(18, 151, 75)' : '1px solid black' , p:1, my:1 , bgcolor:'#000', borderRadius:'0.4rem' }}
                            >   <Box sx={{display:'flex',flexDirection: 'column', justifyContent:'center', alignItems:'start'}} >
                            <Typography>**** **** **** {card.last4}</Typography>
                            <Typography>{card.brand}</Typography>
                            </Box>
                                <Box sx={{display:'flex', flexDirection: 'column', gap: 1}} >
                                <Button size="small" variant="outlined" color="error" onClick={()=>{
                                  detachPaymentMethod(card.id)
                                }}
                                >Delete
                                </Button>
                                <Button size="small" variant="outlined" disabled={card.default}
                                 onClick={()=>{handleSelectDefaultPaymentMethod(card.id)}}
                                 >set as Default
                                 </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Modal>
            </Grid>
        </Grid>
    );
}

export default PaymentMethodsSection;