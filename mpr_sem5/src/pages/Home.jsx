import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Typography, Button, Container, Grid, Card, CardContent, Box, Paper, Divider } from '@mui/material';
import { Spa, LocalFlorist, Agriculture, WbSunny, Opacity } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#e8f5e9',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const features = [
  { title: 'Sustainable Farming', icon: <Agriculture fontSize="large" />, description: 'Implement eco-friendly practices for a greener future.' },
  { title: 'Crop Diversity', icon: <LocalFlorist fontSize="large" />, description: 'Maximize your garden\'s potential with diverse plantings.' },
  { title: 'Smart Irrigation', icon: <Opacity fontSize="large" />, description: 'Optimize water usage with intelligent irrigation systems.' },
  { title: 'Climate Adaptation', icon: <WbSunny fontSize="large" />, description: 'Adapt your garden to changing climate conditions.' },
];

const Home = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        <Paper
          sx={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg?cs=srgb&dl=pexels-pixabay-158028.jpg&fm=jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Spa sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Garden of Eden
          </Typography>
          <Typography variant="h4" sx={{ mb: 4, maxWidth: '800px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Cultivate Paradise in Your Own Backyard
          </Typography>
          <Link to='/chatbot'>
          <Button variant="contained" color="primary" size="large" sx={{ fontSize: '1.2rem', py: 1.5, px: 4 }}>
            Start Your Eden
          </Button>
          </Link>
        </Paper>

        <Container maxWidth="lg" sx={{ my: 8 }}>
          <Typography variant="h2" align="center" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Discover the Garden of Eden Experience
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Unleash nature's potential with our innovative gardening solutions
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
          <Container maxWidth="md">
            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Why Choose Garden of Eden?
            </Typography>
            <Typography variant="h6" align="center" paragraph>
              Our team of horticultural experts and environmental scientists work together to provide you with the most advanced and sustainable gardening solutions. From soil management to plant selection, we've got you covered.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button variant="contained" color="secondary" size="large" sx={{ fontSize: '1.1rem', py: 1.5, px: 4 }}>
                Learn More
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ my: 8 }}>
          <Typography variant="h3" align="center" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Create Your Own Paradise?
          </Typography>
          <Typography variant="h6" align="center" paragraph sx={{ mb: 4 }}>
            Join the Garden of Eden community and transform your space into a thriving ecosystem.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined" color="primary" size="large" sx={{ fontSize: '1.1rem', py: 1.5, px: 4, mr: 2 }}>
              Get Started
            </Button>
            <Button variant="contained" color="primary" size="large" sx={{ fontSize: '1.1rem', py: 1.5, px: 4 }}>
              Contact Us
            </Button>
          </Box>
        </Container>

        <Divider />
      </Container>
    </ThemeProvider>
  );
};

export default Home;