import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  CssBaseline,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

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

const Info = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/plants');
        setPlants(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plants:', err);
        setError('Failed to load plants. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <CssBaseline />
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
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" align="center">{error}</Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredPlants.map((plant, index) => (
                  <Grow
                    in={true}
                    style={{ transformOrigin: '0 0 0' }}
                    {...{ timeout: 1000 + index * 500 }}
                    key={plant._id}
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
            )}
          </Container>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default Info;
