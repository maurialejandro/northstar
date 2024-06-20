import userService from "../services/user.service.tsx";
import NSLogo from '../assets/NorthstarLogo.png';
import bgImage from '../assets/LogInPageBackground02.png';
import { useNavigate } from "react-router-dom";
import DataContext from "../context/DataContext.tsx";
import { useContext, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material";

export default function LoginPage() {
    const navigate = useNavigate();
    const [signUp , setSignUp] = useState(false);
    const { setSession, setRole } = useContext(DataContext);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const promise = signUp
            ? userService.registerUser(data.get('email') as string, data.get('password') as string)
            : userService.authenticateUser(data.get('email') as string, data.get('password') as string);
        promise.then(async (response) => {
            const { access_token } = response.data.session!
            const { id, email, name } = response.data.session!.user
            const dataSession = {
                access_token,
                user: {
                    id,
                    email,
                    name
                }
            }
            setSession(dataSession);
            setRole(response.message);
            console.log({session: response.data.session})
            if (response.message === 'buyer') {
                navigate('/b/dashboard');
            } else if (response.message === 'admin') {
                navigate('/a/leads');
            } else {
                throw Error('Invalid role: ' + response.message)
            }

        });
    };

    return (
        <Box sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        minHeight: '95vh',
        mt:0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        justifyContent: 'center',
        color: '#fff',
        '.css-binzgt':{mt:0}
        }} >

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'rgba(31, 31, 31, 0.95)',
                    width :'380px',
                    height: '556px',
                    p:2,
                    pt:6,
                    ml:'150px',
                    borderRadius: '10px',
                    boxShadow: '0px 34px 44px 0px rgba(0, 0, 0, 0.15)'
                }}
            >

                <img src={NSLogo} alt="Northstar Logo" style={{height:'50px'}} />
                <Typography sx={{
                    fontFeatureSettings:`'clig' off, 'liga' off`,
                    fontFamily: 'Rounded Mplus 1c Bold',
                    my: 2,
                    fontSize: '24px',
                    fontWeight: '700',
                    lineHeight: '123.5%',
                    letterSpacing: '0.25px'
                }}>NORTHSTAR</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width:'70%', display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    <TextField
                        margin="normal"
                        required
                        id="email"
                        fullWidth
                        label="Email"
                        variant="standard"
                        name="email"
                        autoComplete="email"
                        sx={{ color: '#fff', 'input': { color: '#fff' }, '.css-xksckw-MuiInputBase-root-MuiInput-root:before': { borderColor: '#fff' }, '.css-xksckw-MuiInputBase-root-MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before ': { borderColor: '#fff' } }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        variant={"standard"}
                        type="password"
                        sx={{ color: '#fff', 'input': { color: '#fff' }, '.css-xksckw-MuiInputBase-root-MuiInput-root:before': { borderColor: '#fff' }, '.css-xksckw-MuiInputBase-root-MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before ': { borderColor: '#fff' } }}
                    />
                    <FormControlLabel
                        sx={{ width:'100%' }}
                        control={<Checkbox value="remember"/>}
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 4, mb: 2,py:1, fontWeight: '600',letterSpacing: '0.46px',lineHeight: '26px', px:1, bgcolor:'#0143ED', color:'#fff'}}
                    >
                        { signUp ? 'Sign Up' : 'Log In' }
                    </Button>
                    <Grid container>
                        <Grid item xs={11} onClick={()=>{setSignUp(!signUp)}} sx={{ mt:3}}>
                                { signUp ? 'Sign In' : 'Sign Up'}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}
