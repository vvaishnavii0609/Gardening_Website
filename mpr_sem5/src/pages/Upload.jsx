import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import axios from 'axios';

const Upload = () => {
  const [plantData, setPlantData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const handleInputChange = (e) => {
    setPlantData({ ...plantData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPlantData({ ...plantData, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/plants', plantData);
      console.log('Plant uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading plant:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Plant Data
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Plant Name"
          name="name"
          autoFocus
          value={plantData.name}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="description"
          label="Description"
          name="description"
          multiline
          rows={4}
          value={plantData.description}
          onChange={handleInputChange}
        />
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleImageUpload}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" sx={{ mt: 2, mb: 2 }}>
            Upload Image
          </Button>
        </label>
        {plantData.image && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <img src={plantData.image} alt="Uploaded plant" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </Box>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Upload Plant Data
        </Button>
      </Box>
    </Container>
  );
};

export default Upload;
