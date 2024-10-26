import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { Card, CardHeader, Typography, CardContent, Grid, Paper } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Predefined list of recommended plants based on temperature
const plantRecommendations = [
  { name: "Cactus", minTemp: 20, maxTemp: 35 },
  { name: "Basil", minTemp: 15, maxTemp: 30 },
  { name: "Mint", minTemp: 10, maxTemp: 25 },
  { name: "Aloe Vera", minTemp: 15, maxTemp: 30 },
  { name: "Snake Plant", minTemp: 15, maxTemp: 40 },
  { name: "Fiddle Leaf Fig", minTemp: 18, maxTemp: 30 },
  { name: "Rosemary", minTemp: 15, maxTemp: 30 },
];

const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const WeatherDisplay = ({ weatherData }) => {
  if (!weatherData) return null;

  // Get the first hourly forecast data
  const firstHour = weatherData.hourly.time[0];
  const firstTemperature = weatherData.hourly.temperature_2m[0];
  const firstWindSpeed = weatherData.hourly.wind_speed_10m[0];

  // Recommend plants based on temperature
  const recommendedPlants = plantRecommendations.filter(plant =>
    firstTemperature >= plant.minTemp && firstTemperature <= plant.maxTemp
  );

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

        {/* Recommended Plants Section */}
        <Typography variant="h6" className="mt-4">Recommended Plants</Typography>
        {recommendedPlants.length > 0 ? (
          recommendedPlants.map((plant, index) => (
            <Paper key={index} elevation={1} className="p-2 mt-2">
              <Typography variant="body2">{plant.name}</Typography>
            </Paper>
          ))
        ) : (
          <Typography variant="body2">No recommended plants for this temperature.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Services = () => {
  const [weatherData, setWeatherData] = useState(null);

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
    } catch (error) {
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
      <WeatherDisplay weatherData={weatherData} />
    </div>
  );
};

export default Services;
