import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCertificate } from '@fortawesome/free-solid-svg-icons';
import userService from "../../services/user.service.tsx";
import DataContext from "../../context/DataContext.tsx";

const pages = ['Dashboard', 'Leads', 'Transactions'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, setRole, setLoggedInUser } = useContext(DataContext);
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
    if (page === 'Dashboard') {
      navigate('/b/dashboard')
    }
    // TODO think how we handle these
    if (page === 'Leads') {
      navigate('/b/leads')
    }
    if (page === 'Transactions') {
      navigate('/b/transactions')
    }
    setDisplayNavMenu(null);
  }
  const handleSettingItemClick = (setting: string) => {
    if (setting === 'Dashboard') {
      navigate('/b/dashboard')
    }
    if (setting === 'Logout') {
      // Todo these can be refactored into a single logOut function inside context
      userService.signOut();
      setLoggedInUser(null);
      setSession(null);
      setRole('')
      navigate("/login");
    }
    setDisplayUserMenu(null)
    // TODO think how we handle these 'Profile', 'Account',???
    if (setting === 'Profile') {
      navigate('/settings')
    }
  }

  // useEffect to get user role and set current page

  useEffect(() => {

    if (location.pathname.includes('dashboard')) {
      setCurrentPage('Dashboard')
    }
    if (location.pathname.includes('leads')) {
      setCurrentPage('Leads')
    }
    if (location.pathname.includes('transactions')) {
      setCurrentPage('Transactions')
    }
    if (location.pathname.includes('login')) {
      setCurrentPage('Login')
    }

  }, [location.pathname])

  return (
    <AppBar position="static" sx={{ backgroundImage: 'linear-gradient(270deg, #8C01F9 0%, #0042ED 98.99%)', height: '3rem', minHeight: '2rem' }}>
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
          <Box sx={{ fontSize: 24, mr: 1, display: { xs: 'none', md: 'flex', color: '#F60177' } }}><FontAwesomeIcon icon={faCertificate} /></Box>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
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

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="primary"
              sx={{ fontSize: 24 }}
            >
              <FontAwesomeIcon icon={faBars} />
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

                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => { handleNavItemClick(page); }}>
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
          <Box sx={{ fontSize: 24, mr: 1, display: { xs: 'flex', md: 'none', color: '#F60177' } }}><FontAwesomeIcon icon={faCertificate} /></Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            onClick={() => { handleNavItemClick('Dashboard') }}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
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
              ml: 3, flexGrow: 1, display: { xs: 'none', md: 'flex' }
            }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => { handleNavItemClick(page); }}
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

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ width: 32, height: 32 }} alt="Avatar" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '40px' }}
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
                  <MenuItem key={setting} onClick={() => { handleSettingItemClick(setting); }}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
              {/* <Button sx={{
                my: 0, color: '#ffffff',
                marginTop: '5px',
                display: 'block',
                transition: '0.3s',
                borderBottom: currentPage === 'Login' ? 'solid 2px blue' : 'solid 2px transparent',
                borderBottomLeftRadius: '0', borderBottomRightRadius: '0',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderBottom: 'solid 2px blue',
                },
              }} onClick={() => navigate('/login')}>
                Login
              </Button> */}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;