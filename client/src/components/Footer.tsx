import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                textAlign: 'center',
                padding: '1rem',
                fontSize: '13px',
                fontFamily: 'Work Sans',
                fontWeight: '400',
            }}
        >
            <Container maxWidth="sm" sx={{ color: '#fff' }} >
                <Typography variant="body2" align="center">
                    NORTHSTAR © {new Date().getFullYear()}, All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
}