import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#ffffff',
    },
  },
});

const Footer = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'secondary.main',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5} justifyContent="space-between">
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" mb={2}>
                <LocalFloristIcon sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  Gardening Website
                </Typography>
              </Box>
              <Typography variant="body2">
                Your one-stop solution for all gardening needs. We provide expert advice, quality products, and a supportive community for garden enthusiasts.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Contact Us
              </Typography>
              <Typography variant="body2">
                123 Garden Street, Green City, 12345
              </Typography>
              <Typography variant="body2">
                Email: info@gardenofeden.com
              </Typography>
              <Typography variant="body2">
                Phone: +1 (123) 456-7890
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Follow Us
              </Typography>
              <Box>
                <IconButton color="secondary" aria-label="Facebook">
                  <FacebookIcon />
                </IconButton>
                <IconButton color="secondary" aria-label="Twitter">
                  <TwitterIcon />
                </IconButton>
                <IconButton color="secondary" aria-label="Instagram">
                  <InstagramIcon />
                </IconButton>
                <IconButton color="secondary" aria-label="LinkedIn">
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              © {new Date().getFullYear()} Garden of Eden. All rights reserved.
            </Typography>
            <Box>
              <Link href="#" color="inherit" sx={{ mr: 2 }}>
                Privacy Policy
              </Link>
              <Link href="#" color="inherit">
                Terms of Service
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Footer;