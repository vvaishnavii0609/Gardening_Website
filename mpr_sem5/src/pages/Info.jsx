import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Chip,
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Rating,
  Tooltip,
  Pagination,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoIcon from '@mui/icons-material/Info';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#81c784',
      light: '#a5d6a7',
      dark: '#60ad5e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const ITEMS_PER_PAGE = 9;
const IMAGE_HEIGHT = 200;

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

const StyledCardMedia = styled(CardMedia)({
  height: IMAGE_HEIGHT,
  objectFit: 'cover',
});

const PlantDetailDialog = ({ open, plant, onClose }) => {
  if (!plant) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{plant.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledCardMedia
              component="img"
              image={plant.image}
              alt={plant.name}
              sx={{ borderRadius: 1, height: 300 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Care Requirements</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" display="flex" alignItems="center" gap={1}>
                <WaterDropIcon color="primary" /> Water: {plant.waterNeeds}
              </Typography>
              <Typography variant="subtitle1" display="flex" alignItems="center" gap={1}>
                <WbSunnyIcon color="primary" /> Sunlight: {plant.sunlight}
              </Typography>
              <Typography variant="subtitle1" display="flex" alignItems="center" gap={1}>
                <ThermostatIcon color="primary" /> Temperature: {plant.temperature}
              </Typography>
            </Box>
            <Typography variant="body1">{plant.description}</Typography>
            <Box sx={{ mt: 2 }}>
              {plant.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<FavoriteIcon />}
        >
          Add to Favorites
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Info = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [page, setPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filters, setFilters] = useState({
    indoor: false,
    outdoor: false,
    lowMaintenance: false,
    highMaintenance: false,
    flowering: false,
    tropical: false,
  });
  const [sortOption, setSortOption] = useState('name');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/plants');
        const data = await response.json();
        setPlants(data);
        setLoading(false);
        setSnackbarOpen(true);
      } catch (err) {
        console.error('Error fetching plants:', err);
        setError('Failed to load plants. Please try again later.');
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Reset page when filters or search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, activeTab]);

  const filterPlants = (plants) => {
    return plants.filter(plant => {
      const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilters = Object.entries(filters).every(([key, value]) => 
        !value || (plant.tags && plant.tags.includes(key))
      );
      const matchesTab = activeTab === 0 || 
        (activeTab === 1 && plant.tags?.includes('indoor')) ||
        (activeTab === 2 && plant.tags?.includes('outdoor')) ||
        (activeTab === 3 && plant.tags?.includes('lowMaintenance'));
      
      return matchesSearch && matchesFilters && matchesTab;
    });
  };

  const sortPlants = (plants) => {
    return [...plants].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.reviews || 0) - (a.reviews || 0);
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedPlants = sortPlants(filterPlants(plants));
  const totalPages = Math.ceil(filteredAndSortedPlants.length / ITEMS_PER_PAGE);
  const currentPlants = filteredAndSortedPlants.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 250 }} role="presentation">
            <List>
              <ListItem>
                <Typography variant="h6" color="primary">Filters</Typography>
              </ListItem>
              <Divider />
              {Object.entries(filters).map(([key, value]) => (
                <ListItem key={key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={() => handleFilterChange(key)}
                        color="primary"
                      />
                    }
                    label={key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, pt: 8, pb: 4 }}>
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Search Plants"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="rating">Rating</MenuItem>
                      <MenuItem value="popularity">Popularity</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
              >
                <Tab label="All Plants" />
                <Tab label="Indoor" />
                <Tab label="Outdoor" />
                <Tab label="Low Maintenance" />
              </Tabs>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
              <>
                <Grid container spacing={3}>
                  {currentPlants.map((plant, index) => (
                    <Grow
                      in={true}
                      style={{ transformOrigin: '0 0 0' }}
                      {...{ timeout: 1000 + index * 200 }}
                      key={plant._id}
                    >
                      <Grid item xs={12} sm={6} md={4}>
                        <StyledCard>
                          <StyledCardMedia
                            component="img"
                            image={plant.image}
                            alt={plant.name}
                          />
                          <CardContent>
                            <Typography gutterBottom variant="h5" component="div" color="primary">
                              {plant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {plant.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Rating value={plant.rating || 4} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({plant.reviews || 0} reviews)
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Button
                                size="small"
                                startIcon={<InfoIcon />}
                                onClick={() => setSelectedPlant(plant)}
                              >
                                Details
                              </Button>
                              <Tooltip title="Add to favorites">
                                <IconButton color="primary">
                                  <FavoriteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </StyledCard>
                      </Grid>
                    </Grow>
                  ))}
                </Grid>
                
                {filteredAndSortedPlants.length > 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mt: 4 }}>
                    No plants found matching your criteria. Try adjusting your filters or search terms.
                  </Alert>
                )}
              </>
            )}
          </Container>
        </Box>

        <PlantDetailDialog
          open={Boolean(selectedPlant)}
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="success" 
            variant="filled"
            sx={{ width: '100%' }}
          >
            Plants loaded successfully!
          </Alert>
        </Snackbar>

        {/* Filter Applied Notification */}
        <Snackbar
          open={Object.values(filters).some(v => v)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2">
              {Object.entries(filters)
                .filter(([_, value]) => value)
                .length} filters applied
            </Typography>
            <Button 
              size="small" 
              onClick={() => setFilters(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}))}
              sx={{ mt: 1 }}
            >
              Clear All
            </Button>
          </Paper>
        </Snackbar>

        {/* Loading More Plants Indicator */}
        <Snackbar
          open={loading}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Paper sx={{ p: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading plants...</Typography>
          </Paper>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

// Helper component for displaying empty state
const EmptyState = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: 8,
      px: 2,
    }}
  >
    <LocalFloristIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
    <Typography variant="h5" gutterBottom>
      No Plants Found
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Try adjusting your search or filters to find what you're looking for.
    </Typography>
  </Box>
);

// Helper component for displaying plant tags
const PlantTags = ({ tags }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
    {tags?.map((tag) => (
      <Chip
        key={tag}
        label={tag}
        size="small"
        variant="outlined"
        color="primary"
      />
    ))}
  </Box>
);

// Utility function to format plant data
const formatPlantData = (plant) => ({
  ...plant,
  rating: plant.rating || 4,
  reviews: plant.reviews || Math.floor(Math.random() * 100),
  tags: plant.tags || ['indoor'],
  waterNeeds: plant.waterNeeds || 'Moderate',
  sunlight: plant.sunlight || 'Bright indirect',
  temperature: plant.temperature || '65-80°F',
});

export default Info;