import {
    AppBar,
    Avatar,
    Box,
    Button,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCertificate } from '@fortawesome/free-solid-svg-icons';
import userService from "../../services/user.service.tsx";
import DataContext from "../../context/DataContext.tsx";

const adminPages = ['Buyers', 'Leads', 'Disputes'];
const buyerPages = ['Dashboard', 'Leads', 'Transactions'];
const settings = ['Settings', 'Account', 'Dashboard', 'Logout'];

export default function NavBar() {
    const { role } = useContext(DataContext)
    const navigate = useNavigate();
    const location = useLocation();
    const { setSession, setRole } = useContext(DataContext)

    const [isAdmin, setIsAdmin] = useState(false)
    const [displayNavMenu, setDisplayNavMenu] = useState<null | HTMLElement>(null);
    const [displayUserMenu, setDisplayUserMenu] = useState<null | HTMLElement>(null);
    const [currentPage, setCurrentPage] = useState<string>('');

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setDisplayNavMenu(event.currentTarget);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setDisplayUserMenu(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setDisplayNavMenu(null);
    };

    const handleCloseUserMenu = () => {
        setDisplayUserMenu(null);
    };

    const handleNavItemClick = (page: string) => {
        switch (page) {
            case 'Buyers':
                navigate('/a/buyers');
                break;
            case 'Dashboard':
                navigate('/b/dashboard');
                break;
            case 'Leads':
                isAdmin ? navigate('/a/leads') : navigate('/b/leads');
                break;
            case 'Disputes':
                navigate('/a/disputes');
                break;
            case 'Transactions':
                navigate('/b/transactions');
                break;
            default:
            // Handle other cases or do nothing
        }
        setDisplayNavMenu(null);
    }

    const handleSettingItemClick = (setting: string) => {
        switch (setting) {
            case 'Dashboard':
                navigate(role === 'admin' ? '/a/leads' : '/b/dashboard');
                break;
            case 'Logout':
                // Todo these can be refactored into a single logOut function inside context
                userService.signOut();
                setRole('');
                setSession(null);
                navigate('/login');
                break;
            case 'Settings':
                // TODO think how we handle these 'Profile', 'Account',???
                navigate('/settings');
                break;
        }
        setDisplayUserMenu(null)
    }

    // useEffect to get user role and set current page
    useEffect(() => {
        role === 'admin' ? setIsAdmin(true) : setIsAdmin(false);
        switch (true) {
            case location.pathname.includes('buyers'):
                setCurrentPage('Buyers');
                break;
            case location.pathname.includes('dashboard'):
                setCurrentPage('Dashboard');
                break;
            case location.pathname.includes('leads'):
                setCurrentPage('Leads');
                break;
            case location.pathname.includes('disputes'):
                setCurrentPage('Disputes');
                break;
            case location.pathname.includes('transactions'):
                setCurrentPage('Transactions');
                break;
            case location.pathname.includes('login'):
                setCurrentPage('Login');
                break;
            default:
                setCurrentPage('');
        }
    }, [location.pathname, role])

    return !role
        ? null
        : (
            <AppBar position="static" sx={{
                backgroundImage: 'linear-gradient(270deg, #8C01F9 0%, #0042ED 98.99%)',
                height: '3rem',
                minHeight: '2rem'
            }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{
                        height: '2rem',
                        p: 0,
                        m: 0,
                        minHeight: '2rem',
                        marginTop: '-6px',
                        '@media (max-width: 600px)': {
                            marginTop: 1,
                        },
                    }}>
                        <Box sx={{
                            fontSize: 24,
                            mr: 1,
                            display: {xs: 'none', md: 'flex', color: '#F60177'}
                        }}><FontAwesomeIcon icon={faCertificate}/></Box>
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: {xs: 'none', md: 'flex'},
                                fontFamily: 'Rounded Mplus 1c Bold',
                                fontWeight: 700,
                                letterSpacing: '.25px',
                                fontSize: 14,
                                color: '#ffffff',
                                textDecoration: 'none',
                            }}
                        >
                            NORTHSTAR
                        </Typography>

                        <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                            <IconButton
                                size="small"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="primary"
                                sx={{fontSize: 24}}
                            >
                                <FontAwesomeIcon icon={faBars}/>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={displayNavMenu}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(displayNavMenu)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    color: '#010101',

                                    display: {xs: 'block', md: 'none'},
                                }}
                            >
                                {(isAdmin ? adminPages : buyerPages).map((page) => (
                                    <MenuItem key={page} onClick={() => {
                                        handleNavItemClick(page);
                                    }}>
                                        <Typography sx={{
                                            fontWeight: 700,
                                            letterSpacing: '.25px',
                                            fontSize: 14,
                                            color: '#010101',
                                        }} textAlign="center">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <Box sx={{
                            fontSize: 24,
                            mr: 1,
                            display: {xs: 'flex', md: 'none', color: '#F60177'}
                        }}><FontAwesomeIcon icon={faCertificate}/></Box>
                        <Typography
                            variant="h5"
                            noWrap
                            component="a"
                            onClick={() => {
                                handleNavItemClick('Dashboard');
                            }}
                            sx={{
                                mr: 2,
                                display: {xs: 'flex', md: 'none'},
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: '#ffffff',
                                textDecoration: 'none',
                            }}
                        >
                            NORTHSTAR
                        </Typography>

                        <Box sx={{
                            ml: 3, flexGrow: 1, display: {xs: 'none', md: 'flex'}
                        }}>
                            {(isAdmin ? adminPages : buyerPages).map((page) => (
                                <Button
                                    key={page}
                                    onClick={() => {
                                        handleNavItemClick(page);
                                    }}
                                    sx={{
                                        my: 0,
                                        color: '#ffffff',
                                        marginTop: '5px',
                                        display: 'block',
                                        transition: '0.3s',
                                        borderBottomLeftRadius: '0',
                                        borderBottomRightRadius: '0',
                                        cursor: 'pointer',
                                        borderBottom: currentPage === page ? 'solid 2px #BD01FF' : 'solid 2px transparent',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                            borderBottom: 'solid 2px #BD01FF',
                                        },
                                    }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{flexGrow: 0}}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                    <Avatar sx={{width: 32, height: 32}} alt="Avatar"/>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{mt: '40px'}}
                                id="menu-appbar"
                                anchorEl={displayUserMenu}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(displayUserMenu)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={() => {
                                        handleSettingItemClick(setting);
                                    }}>
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        );
}