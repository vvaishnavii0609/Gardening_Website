import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { Card, CardHeader, Typography, CardContent, Grid, Paper } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// // Predefined list of recommended plants based on temperature
// const plantRecommendations = [
//   { name: "Cactus", minTemp: 20, maxTemp: 35 },
//   { name: "Basil", minTemp: 15, maxTemp: 30 },
//   { name: "Mint", minTemp: 10, maxTemp: 25 },
//   { name: "Aloe Vera", minTemp: 15, maxTemp: 30 },
//   { name: "Snake Plant", minTemp: 15, maxTemp: 40 },
//   { name: "Fiddle Leaf Fig", minTemp: 18, maxTemp: 30 },
//   { name: "Rosemary", minTemp: 15, maxTemp: 30 },
// ];

const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const WeatherDisplay = ({ weatherData ,recommendations}) => {
  if (!weatherData || !weatherData.current || !weatherData.hourly) {
    return (
      <Card className="absolute right-4 top-4 z-[1000] w-64 bg-white shadow-lg">
        <CardHeader>
          <Typography variant="h6">Weather Information</Typography>
        </CardHeader>
        <CardContent>
          <Typography variant="body1">No weather data available.</Typography>
        </CardContent>
      </Card>
    );
  }

  // Get the first hourly forecast data
  const firstHour = weatherData.hourly.time[0];
  const firstTemperature = weatherData.hourly.temperature_2m[0];
  const firstWindSpeed = weatherData.hourly.wind_speed_10m[0];

  // Recommend plants based on temperature
  // const recommendedPlants = plantRecommendations.filter(plant =>
  //   firstTemperature >= plant.minTemp && firstTemperature <= plant.maxTemp
  // );

  return (
    <Card className="absolute right-4 top-4 z-[1000] w-64 bg-white shadow-lg">
      <CardHeader>
        <Typography variant="h6">Weather Information</Typography>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Typography variant="body1">
            Temperature: {weatherData.current.temperature_2m.toFixed(1)}°C
          </Typography>
          <Typography variant="body1">
            Wind Speed: {weatherData.current.wind_speed_10m.toFixed(1)} km/h
          </Typography>
          <Typography variant="body1">
            Time: {new Date(weatherData.current.time).toLocaleString()}
          </Typography>
        </div>
        <Typography variant="h6" className="mt-4">Next Hour Forecast</Typography>
        <Paper elevation={1} className="p-2 mt-2">
          <Typography variant="body2">{new Date(firstHour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
          <Typography variant="body2">Temp: {firstTemperature.toFixed(1)}°C</Typography>
          <Typography variant="body2">Wind: {firstWindSpeed.toFixed(1)} km/h</Typography>
        </Paper>

<Typography variant="h6" className="mt-4">Recommended Plants</Typography>
{recommendations && recommendations.length > 0 ? (
  recommendations.map((plant, index) => (
    <Paper key={index} elevation={1} className="p-2 mt-2">
      <Typography variant="body2"><strong>{plant.name}</strong></Typography>
      {plant.image && (
        <img src={plant.image} alt={plant.name} style={{ width: '100%', borderRadius: 4, marginTop: 4 }} />
      )}
      {plant.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {plant.description}
        </Typography>
      )}
    </Paper>
  ))
) : (
  <Typography variant="body2">No recommended plants for this region.</Typography>
)}

      </CardContent>
    </Card>
  );
};

const Services = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const handleLocationSelect = async (lat, lng) => {
    try {
      const response = await fetch('http://localhost:3000/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      const data = await response.json();
      setWeatherData(data);
      console.log('Weather data:', data);
      
      const temp = data.current.temperature_2m;
      const humidity = data.current.relative_humidity_2m || 50; // fallback
      const climateZone = "Tropical"; //u can map from lat/lng later

      console.log("📍 Fetching recommendations with:", {
  lat,
  lng,
  temp,
  humidity,
  climateZone
});

      // Step 2: Fetch backend recommendations
// Example for fetch:
  
const recRes = await fetch(
  `http://localhost:3000/api/recommendations?type=climate&latitude=${lat}&longitude=${lng}&temperature=${temp}&humidity=${humidity}&climateZone=${climateZone}&limit=5`
);
// ...existing code...
      
      const recData = await recRes.json();
      console.log('Recommendations data:', recData);
      setRecommendations(recData.recommendations || []);
    }
    catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className="h-screen w-full relative">
      <MapContainer
        center={[20.5937, 78.9629]} // Centering the map over India
        zoom={5} // Zoom level adjusted for India
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onLocationSelect={handleLocationSelect} />
      </MapContainer>
      <WeatherDisplay weatherData={weatherData} recommendations={recommendations}/>
    </div>
  );
};

export default Services;
