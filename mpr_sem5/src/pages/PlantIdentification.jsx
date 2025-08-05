import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CameraAlt,
  PhotoCamera,
  Upload,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import axios from 'axios';

const PlantIdentification = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [identification, setIdentification] = useState(null);
  const [healthAnalysis, setHealthAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHealthDialog, setShowHealthDialog] = useState(false);
  
  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setIdentification(null);
        setHealthAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setSelectedImage(imageData);
    setIdentification(null);
    setHealthAnalysis(null);
    setError(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const identifyPlant = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:3000/api/identify-plant', {
        image: selectedImage
      });
      
      setIdentification(response.data);
    } catch (err) {
      setError('Plant identification failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeHealth = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:3000/api/analyze-health', {
        image: selectedImage
      });
      
      setHealthAnalysis(response.data);
      setShowHealthDialog(true);
    } catch (err) {
      setError('Health analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="primary">
        Plant Identification & Health Analysis
      </Typography>
      
      <Grid container spacing={3}>
        {/* Image Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload or Capture Plant Image
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current.click()}
                  sx={{ mr: 1 }}
                >
                  Upload Image
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CameraAlt />}
                  onClick={startCamera}
                >
                  Use Camera
                </Button>
              </Box>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              {/* Camera View */}
              <Box sx={{ mb: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  style={{ width: '100%', maxWidth: 400, display: 'none' }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  onClick={captureImage}
                  sx={{ display: 'none' }}
                >
                  Capture
                </Button>
              </Box>
              
              {/* Selected Image */}
              {selectedImage && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={selectedImage}
                    alt="Selected plant"
                    style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={identifyPlant}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Identify Plant'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={analyzeHealth}
                      disabled={loading}
                    >
                      Analyze Health
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Plant Identification Results */}
          {identification && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Plant Identification Results
                </Typography>
                
                {identification.success ? (
                  <Box>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {identification.plant_name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {identification.description}
                    </Typography>
                    <Chip
                      label={`Confidence: ${(identification.confidence * 100).toFixed(1)}%`}
                      color="primary"
                      variant="outlined"
                    />
                    
                    {identification.all_predictions && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Other possibilities:
                        </Typography>
                        {identification.all_predictions.slice(1).map((pred, index) => (
                          <Chip
                            key={index}
                            label={`${pred.name} (${(pred.confidence * 100).toFixed(1)}%)`}
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="warning">
                    {identification.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Health Analysis Results */}
          {healthAnalysis && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Health Analysis
                </Typography>
                
                {healthAnalysis.success ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" sx={{ mr: 2 }}>
                        {healthAnalysis.health_score.toFixed(0)}%
                      </Typography>
                      <Chip
                        label={healthAnalysis.health_score >= 80 ? 'Healthy' : 
                               healthAnalysis.health_score >= 60 ? 'Moderate' : 'Needs Attention'}
                        color={getHealthColor(healthAnalysis.health_score)}
                        icon={healthAnalysis.health_score >= 80 ? <CheckCircle /> : <Warning />}
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {healthAnalysis.green_percentage.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2">Green Content</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {healthAnalysis.brightness.toFixed(0)}
                          </Typography>
                          <Typography variant="body2">Brightness</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    {healthAnalysis.health_issues.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Issues Detected:
                        </Typography>
                        {healthAnalysis.health_issues.map((issue, index) => (
                          <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                            {issue}
                          </Alert>
                        ))}
                      </Box>
                    )}
                    
                    {healthAnalysis.recommendations.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Recommendations:
                        </Typography>
                        {healthAnalysis.recommendations.map((rec, index) => (
                          <Alert key={index} severity="info" sx={{ mb: 1 }}>
                            {rec}
                          </Alert>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="error">
                    {healthAnalysis.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Health Analysis Dialog */}
      <Dialog
        open={showHealthDialog}
        onClose={() => setShowHealthDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detailed Health Analysis</DialogTitle>
        <DialogContent>
          {healthAnalysis && healthAnalysis.success && (
            <Box>
              <Typography variant="h4" gutterBottom>
                Health Score: {healthAnalysis.health_score.toFixed(0)}%
              </Typography>
              
              <Typography variant="body1" paragraph>
                Based on the analysis of your plant's image, here are the detailed findings:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Color Analysis</Typography>
                  <Typography variant="body2">
                    Green content: {healthAnalysis.green_percentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    Brightness level: {healthAnalysis.brightness.toFixed(0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Assessment</Typography>
                  <Typography variant="body2">
                    {healthAnalysis.health_score >= 80 ? 'Your plant appears to be in excellent health!' :
                     healthAnalysis.health_score >= 60 ? 'Your plant shows some signs of stress but is generally healthy.' :
                     'Your plant may need attention and care.'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHealthDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlantIdentification; 