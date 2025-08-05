const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const mongoURI = 'mongodb://localhost:27017/Mpr_sem5';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const plantSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  waterNeeds: String,
  sunlight: String,
  temperature: String,
  rating: Number,
  reviews: Number,
  tags: [String]
});

const Plant = mongoose.model('Plant', plantSchema);

app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 

// Load chatbot responses
const responsesPath = path.join(__dirname, 'responses.json');
const responses = JSON.parse(fs.readFileSync(responsesPath, 'utf8'));

// Enhanced chatbot function with Gemini AI
async function generateResponse(inputText) {
  try {
    // Check if the question is plant-related
    const plantKeywords = [
      'plant', 'garden', 'flower', 'tree', 'vegetable', 'herb', 'soil', 'water', 'fertilizer',
      'prune', 'grow', 'seed', 'leaf', 'root', 'stem', 'pest', 'disease', 'sunlight', 'shade',
      'compost', 'mulch', 'transplant', 'harvest', 'bloom', 'bud', 'fruit', 'vegetable',
      'indoor plant', 'outdoor plant', 'succulent', 'cactus', 'orchid', 'rose', 'tomato',
      'watering', 'gardening', 'horticulture', 'botany', 'greenhouse', 'pot', 'container'
    ];
    
    const lowerInput = inputText.toLowerCase();
    const isPlantRelated = plantKeywords.some(keyword => lowerInput.includes(keyword));
    
    if (!isPlantRelated) {
      return "I'm a gardening assistant! I can help you with questions about plants, gardening, soil, watering, and other plant-related topics. Please ask me something about plants or gardening.";
    }
    
    // Use Gemini AI for plant-related questions
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a helpful gardening assistant. Answer the following question about plants, gardening, or horticulture. Keep your response concise, informative, and friendly. Focus only on plant-related topics.

FORMATTING REQUIREMENTS:
- Use **bold text** for important terms and headings
- Use bullet points (•) for lists and steps
- Add line breaks between sections for better readability
- Structure your response in a clear, organized manner
- Use numbered lists (1., 2., 3.) for step-by-step instructions

Question: ${inputText}

Please provide a helpful response:`;
    
    console.log('Sending prompt to Gemini:', prompt);
    
    const result = await model.generateContent(prompt);
    console.log('Gemini result:', result);
    
    const response = await result.response;
    console.log('Gemini response:', response);
    
    const responseText = response.text();
    console.log('Response text:', responseText);
    
    // Ensure we return a string, not an object
    if (typeof responseText === 'string' && responseText.trim() !== '') {
      return responseText;
    } else {
      console.log('Response is not a valid string, using fallback');
      throw new Error('Invalid response from Gemini API');
    }
    
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    // Fallback to local responses if Gemini fails
    const lowerInput = inputText.toLowerCase();
    
    if (lowerInput.includes('garden') || lowerInput.includes('gardening')) {
      return responses.what_garden;
    } else if (lowerInput.includes('soil')) {
      return responses.what_soil;
    } else if (lowerInput.includes('plant')) {
      return responses.what_plant;
    } else if (lowerInput.includes('flower')) {
      return responses.what_flower;
    } else if (lowerInput.includes('vegetable')) {
      return responses.what_vegetable;
    } else if (lowerInput.includes('herb')) {
      return responses.what_herb;
    } else if (lowerInput.includes('tree')) {
      return responses.what_tree;
    } else if (lowerInput.includes('water') || lowerInput.includes('watering')) {
      return responses.how_water;
    } else if (lowerInput.includes('prune') || lowerInput.includes('pruning')) {
      return responses.how_prune;
    } else if (lowerInput.includes('grow') || lowerInput.includes('growing')) {
      return responses.how_grow;
    } else if (lowerInput.includes('fertilize') || lowerInput.includes('fertilizer')) {
      return responses.how_fertilize;
    } else if (lowerInput.includes('mulch') || lowerInput.includes('mulching')) {
      return responses.how_mulch;
    } else if (lowerInput.includes('transplant')) {
      return responses.how_transplant;
    } else if (lowerInput.includes('pest') || lowerInput.includes('pests')) {
      return responses.how_control_pests;
    } else if (lowerInput.includes('when')) {
      if (lowerInput.includes('plant')) return responses.when_plant;
      if (lowerInput.includes('harvest')) return responses.when_harvest;
      if (lowerInput.includes('prune')) return responses.when_prune;
      if (lowerInput.includes('water')) return responses.when_water;
      return responses.when_plant;
    } else if (lowerInput.includes('why')) {
      if (lowerInput.includes('compost')) return responses.why_compost;
      if (lowerInput.includes('mulch')) return responses.why_mulch;
      if (lowerInput.includes('fertilize')) return responses.why_fertilize;
      if (lowerInput.includes('pest')) return responses.why_pest_control;
      if (lowerInput.includes('weed')) return responses.why_weeding;
      if (lowerInput.includes('sunlight')) return responses.why_sunlight;
      return responses.why_compost;
    } else {
      return responses.unknown;
    }
  }
}

// Chatbot endpoint
app.post('/generate_response', async (req, res) => {
  try {
    const { input_text } = req.body;
    
    if (!input_text) {
      return res.status(400).json({ error: 'Input text is required' });
    }
    
    console.log('API Key check:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('Input text:', input_text);
    
    const response = await generateResponse(input_text);
    console.log('Generated response:', response);
    
    res.json({ response });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Error generating response' });
  }
});

app.post('/api/plants', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const newPlant = new Plant({ name, description, image });
    await newPlant.save();
    res.status(201).json({ message: 'Plant uploaded successfully', plant: newPlant });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading plant', error: error.message });
  }
});

app.get('/api/plants', async (req, res) => {
  try {
    console.log('Fetching plants from database...');
    const plants = await Plant.find();
    console.log(`Found ${plants.length} plants in database`);
    console.log('Plants:', plants.map(p => ({ name: p.name, image: p.image })));
    res.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ message: 'Error fetching plants', error: error.message });
  }
});

// Plant identification endpoint
app.post('/api/identify-plant', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    // Call Python plant identification service
    const pythonProcess = spawn('python', ['ml/plantIdentification.py']);
    
    pythonProcess.stdin.write(JSON.stringify({ image }));
    pythonProcess.stdin.end();
    
    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        const identification = JSON.parse(result);
        res.json(identification);
      } else {
        res.status(500).json({ error: 'Plant identification failed' });
      }
    });
  } catch (error) {
    console.error('Plant identification error:', error);
    res.status(500).json({ error: 'Plant identification failed' });
  }
});

// Plant health analysis endpoint
app.post('/api/analyze-health', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    // Call Python health analysis service
    const pythonProcess = spawn('python', ['ml/plantIdentification.py']);
    
    pythonProcess.stdin.write(JSON.stringify({ 
      action: 'analyze_health',
      image 
    }));
    pythonProcess.stdin.end();
    
    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        const healthAnalysis = JSON.parse(result);
        res.json(healthAnalysis);
      } else {
        res.status(500).json({ error: 'Health analysis failed' });
      }
    });
  } catch (error) {
    console.error('Health analysis error:', error);
    res.status(500).json({ error: 'Health analysis failed' });
  }
});

// Advanced recommendations endpoint
app.get('/api/recommendations', async (req, res) => {
  try {
    const { 
      userId, 
      type = 'hybrid', 
      limit = 10,
      location,
      experience,
      season 
    } = req.query;
    
    // Assuming AdvancedRecommendationEngine is defined elsewhere or will be added
    // For now, a placeholder response
    res.json({
      success: true,
      recommendations: [], // Placeholder
      type,
      count: 0
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Enhanced plant search with AI
app.get('/api/plants/search', async (req, res) => {
  try {
    const { 
      query, 
      filters, 
      sort = 'relevance',
      page = 1,
      limit = 20 
    } = req.query;
    
    let searchQuery = { isActive: true };
    
    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    // Apply filters
    if (filters) {
      const filterObj = JSON.parse(filters);
      Object.keys(filterObj).forEach(key => {
        if (filterObj[key]) {
          searchQuery[key] = filterObj[key];
        }
      });
    }
    
    // Execute search
    const plants = await Plant.find(searchQuery)
      .sort(getSortCriteria(sort))
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Plant.countDocuments(searchQuery);
    
    res.json({
      success: true,
      plants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Plant search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Bulk plant import endpoint
app.post('/api/plants/bulk-import', async (req, res) => {
  try {
    const { plants } = req.body;
    
    if (!plants || !Array.isArray(plants)) {
      return res.status(400).json({ error: 'Plants array is required' });
    }
    
    const results = await Plant.insertMany(plants, { 
      ordered: false,
      rawResult: true 
    });
    
    res.json({
      success: true,
      imported: results.insertedCount,
      total: plants.length,
      errors: results.writeErrors || []
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Bulk import failed' });
  }
});

// Plant statistics endpoint
app.get('/api/plants/stats', async (req, res) => {
  try {
    const stats = await Plant.aggregate([
      {
        $group: {
          _id: null,
          totalPlants: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: '$reviews' }
        }
      }
    ]);
    
    const careLevelStats = await Plant.aggregate([
      {
        $group: {
          _id: '$careLevel',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const familyStats = await Plant.aggregate([
      {
        $group: {
          _id: '$family',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || {},
      careLevelDistribution: careLevelStats,
      topFamilies: familyStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Weather API endpoint
app.post('/api/weather', async (req, res) => {
  try {
    console.log('Weather API called with:', req.body);
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      console.log('Missing latitude or longitude');
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    console.log(`Fetching weather for lat: ${latitude}, lng: ${longitude}`);
    
    // Using Open-Meteo API (free weather service)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,wind_speed_10m&timezone=auto`;
    
    console.log('Weather URL:', weatherUrl);
    
    const response = await fetch(weatherUrl);
    console.log('Weather API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Weather API request failed with status: ${response.status}`);
    }
    
    const weatherData = await response.json();
    console.log('Weather data received successfully');
    
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
});

// Test endpoint to check if Gemini API is working
app.get('/test-gemini', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not found in environment variables' });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say 'Hello, Gemini is working!'");
    const response = await result.response;
    const text = response.text();
    
    res.json({ 
      success: true, 
      message: 'Gemini API is working!',
      response: text 
    });
  } catch (error) {
    console.error('Gemini test error:', error);
    res.status(500).json({ 
      error: 'Gemini API test failed', 
      details: error.message 
    });
  }
});

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Present' : 'Missing'}`);
  console.log(`Test the server: http://localhost:${PORT}/test`);
  console.log(`Weather API: POST http://localhost:${PORT}/api/weather`);
});

// Helper method for sorting
function getSortCriteria(sort) {
  switch (sort) {
    case 'name':
      return { name: 1 };
    case 'rating':
      return { rating: -1 };
    case 'reviews':
      return { reviews: -1 };
    case 'careLevel':
      return { careLevel: 1 };
    case 'relevance':
    default:
      return { score: { $meta: 'textScore' } };
  }
}
