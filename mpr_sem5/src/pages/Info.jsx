import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid,
  Container,
  Grow,
  Paper,
  IconButton,
  InputAdornment,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  CssBaseline,
  Link
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Assume you have a footer component

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#81c784',
    },
    background: {
      default: '#e8f5e9',
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    body2: {
      fontSize: '0.9rem',
    },
  },
});

const GreenTextField = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.primary.main,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.secondary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const plantData = [
  { id: 1, name: 'Monstera', image: 'images/monstera.png', description: 'Tropical plant with large, split leaves.' },
  { id: 2, name: 'Snake Plant', image: 'images/snake_plant.png', description: 'Hardy plant with tall, sword-like leaves.' },
  { id: 3, name: 'Pothos', image: 'images/pothos.png', description: 'Trailing vine with heart-shaped leaves.' },
  { id: 4, name: 'Fiddle Leaf Fig', image: 'images/fiddle_leaf_fig.png', description: 'Popular indoor tree with broad, violin-shaped leaves.' },
  { id: 5, name: 'Peace Lily', image: 'images/peace_lily.png', description: 'Flowering plant with glossy leaves and white blooms.' },
  { id: 6, name: 'Aloe Vera', image: 'images/aloe_vera.png', description: 'Succulent plant with thick, fleshy leaves known for its soothing gel.' },
];


const Info = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = plantData.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <CssBaseline />
      <Navbar />
      <ThemeProvider theme={theme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: 'white' }}>
              <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalFloristIcon sx={{ mr: 2 }} />
                Plant Information
              </Typography>
              <GreenTextField
                fullWidth
                label="Search Plants"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
            
            <Grid container spacing={3}>
              {filteredPlants.map((plant, index) => (
                <Grow
                  in={true}
                  style={{ transformOrigin: '0 0 0' }}
                  {...{ timeout: 1000 + index * 500 }}
                  key={plant.id}
                >
                  <Grid item xs={12} sm={6} md={4}>
                    <StyledCard>
                      <CardMedia
                        component="img"
                        height="200"
                        image={plant.image}
                        alt={plant.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div" color="primary">
                          {plant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plant.description}
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grow>
              ))}
            </Grid>
          </Container>
        </Box>
          <Footer />
      </ThemeProvider>
    </>
  );
};

export default Info;
