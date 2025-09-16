const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { spawn } = require('child_process');
const AdvancedRecommendationEngine = require('./ml/recommendationEngine');
const recommendationEngine = new AdvancedRecommendationEngine();
const Plant = require('./models/Plant');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const mongoURI = 'mongodb://localhost:27017/Mpr_sem5';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// const plantSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   image: String,
//   waterNeeds: String,
//   sunlight: String,
//   temperature: String,
//   rating: Number,
//   reviews: Number,
//   tags: [String]
// });

// const Plant = mongoose.model('Plant', plantSchema);

app.use(cors()); 
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}); 

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
    const { name, description, image, scientificName } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Provide sane defaults to satisfy schema requirements
    const newPlant = new Plant({
      name,
      scientificName: scientificName || `${name}-${Date.now()}`,
      description: description || '',
      image: image || '',
      isActive: true,
    });
    await newPlant.save();
    res.status(201).json({ message: 'Plant uploaded successfully', plant: newPlant });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'A plant with this scientific name already exists. Try a different name.' });
    }
    res.status(500).json({ message: 'Error uploading plant', error: error.message });
  }
});

app.get('/api/plants', async (req, res) => {
  try {
    console.log('Fetching plants from database...');
    const plants = await Plant.find();
    console.log(`Found ${plants.length} plants in database`);
    console.log('Plants:', plants.map(p => ({ name: p.name, image: p.image })));
    if (!plants || plants.length === 0) {
      // Fallback sample data so Info page is not empty
      const samplePlants = [
        {
          name: 'Snake Plant',
          scientificName: 'Dracaena trifasciata',
          description: 'A hardy indoor plant known for its air-purifying qualities and low maintenance.',
          image: '/images/snake_plant.png',
          waterNeeds: 'Low',
          sunlight: 'Low light',
          temperature: { range: '16-29°C' },
          rating: 4.5,
          reviews: 127,
          tags: ['indoor', 'lowMaintenance', 'airPurifying']
        },
        {
          name: 'Peace Lily',
          scientificName: 'Spathiphyllum',
          description: 'Beautiful flowering plant that helps purify indoor air.',
          image: '/images/peace_lily.png',
          waterNeeds: 'Moderate',
          sunlight: 'Bright indirect',
          temperature: { range: '18-27°C' },
          rating: 4.3,
          reviews: 89,
          tags: ['indoor', 'flowering', 'airPurifying']
        },
        {
          name: 'Monstera Deliciosa',
          scientificName: 'Monstera deliciosa',
          description: 'Popular tropical plant with distinctive split leaves.',
          image: '/images/monstera.png',
          waterNeeds: 'Moderate',
          sunlight: 'Bright indirect',
          temperature: { range: '18-27°C' },
          rating: 4.7,
          reviews: 156,
          tags: ['indoor', 'tropical']
        },
        {
          name: 'Pothos',
          scientificName: 'Epipremnum aureum',
          description: 'Versatile trailing plant for hanging baskets or climbing. Very easy to care for.',
          image: '/images/pothos.png',
          waterNeeds: 'Low',
          sunlight: 'Low light',
          temperature: { range: '16-29°C' },
          rating: 4.4,
          reviews: 203,
          tags: ['indoor', 'lowMaintenance', 'trailing']
        },
        {
          name: 'Fiddle Leaf Fig',
          scientificName: 'Ficus lyrata',
          description: 'Trendy indoor tree with large, violin-shaped leaves.',
          image: '/images/fiddle_leaf_fig.png',
          waterNeeds: 'Moderate',
          sunlight: 'Bright indirect',
          temperature: { range: '16-24°C' },
          rating: 4.2,
          reviews: 78,
          tags: ['indoor', 'statement', 'tree']
        },
        {
          name: 'Aloe Vera',
          scientificName: 'Aloe vera',
          description: 'Succulent known for medicinal properties. Easy and drought-tolerant.',
          image: '/images/aloe_vera.png',
          waterNeeds: 'Low',
          sunlight: 'Full sun',
          temperature: { range: '13-27°C' },
          rating: 4.6,
          reviews: 145,
          tags: ['indoor', 'outdoor', 'lowMaintenance', 'medicinal']
        }
      ];
      return res.json(samplePlants);
    }
    // Ensure essential fields for frontend
    const normalized = plants.map(p => ({
      _id: p._id,
      name: p.name,
      scientificName: p.scientificName,
      description: p.description || p.longDescription || p.scientificName || '',
      image: p.image || (p.images && p.images[0]) || '',
      rating: p.rating || 4,
      reviews: p.reviews || 0,
      tags: p.tags || [],
      waterNeeds: p.waterNeeds || 'Moderate',
      sunlight: p.sunlight || 'Bright indirect',
      temperature: p.temperature?.range || `${p.temperature?.min ?? ''}-${p.temperature?.max ?? ''}°C`
    }));
    res.json(normalized);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ message: 'Error fetching plants', error: error.message });
  }
});

// Plant identification endpoint - handles both file uploads and base64 images
app.post('/api/identify-plant', upload.single("image"), async (req, res) => {
  try {
    let imageData;
    
    // Handle file upload (from main branch)
    if (req.file) {
      console.log("Uploaded file:", req.file);
      imageData = req.file.path; // Use file path for uploaded files
    } 
    // Handle base64 image (from request body)
    else if (req.body.image) {
      imageData = req.body.image; // Use base64 data directly
    } 
    else {
      return res.status(400).json({ 
        success: false, 
        message: "No image uploaded or provided" 
      });
    }
    
    // Call Python plant identification service
    const pythonProcess = spawn('python', ['ml/plantIdentification.py']);
    
    // Send appropriate data based on input type
    const inputData = req.file 
      ? { imagePath: imageData }  // File path for uploaded files
      : { image: imageData };     // Base64 for direct image data
    
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
    
    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const identification = JSON.parse(result);
          res.json(identification);
        } catch (parseError) {
          console.error('Failed to parse Python response:', result);
          res.status(500).json({ 
            success: false, 
            message: "Invalid response from identification service" 
          });
        }
      } else {
        console.error('Python process exited with code:', code);
        res.status(500).json({ 
          success: false, 
          message: "Plant identification failed" 
        });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Python process error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to start identification service" 
      });
    });
  } catch (error) {
    console.error("Plant identification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Plant health analysis endpoint - handles both file uploads and base64 images
app.post('/api/analyze-health', upload.single("image"), async (req, res) => {
  try {
    let imageData;
    
    // Handle file upload
    if (req.file) {
      console.log("Uploaded file for health analysis:", req.file);
      imageData = req.file.path;
    } 
    // Handle base64 image
    else if (req.body.image) {
      imageData = req.body.image;
    } 
    else {
      return res.status(400).json({ 
        success: false, 
        message: "No image uploaded or provided" 
      });
    }
    
    // Call Python health analysis service
    const pythonProcess = spawn('python', ['ml/plantIdentification.py']);
    
    // Send appropriate data based on input type
    const inputData = {
      action: 'analyze_health',
      ...(req.file ? { imagePath: imageData } : { image: imageData })
    };
    
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
    
    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const analysis = JSON.parse(result);
          res.json(analysis);
        } catch (parseError) {
          console.error('Failed to parse Python response:', result);
          res.status(500).json({ error: 'Invalid response from health analysis service' });
        }
      } else {
        console.error('Python process exited with code:', code);
        res.status(500).json({ error: 'Health analysis failed' });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Python process error:', error);
      res.status(500).json({ error: 'Failed to start health analysis service' });
    });
  } catch (error) {
    console.error('Health analysis error:', error);
    res.status(500).json({ error: 'Health analysis failed' });
  }
});

// Advanced recommendations endpoint
// Get dynamic recommendations from DB based on climate
app.get('/api/recommendations', async (req, res) => {
  try {
// ...existing code...
const limit = parseInt(req.query.limit) || 5;
// ...existing code...
const latitude = parseFloat(req.query.latitude || req.query['location[latitude]']);
const longitude = parseFloat(req.query.longitude || req.query['location[longitude]']);
const temperature = parseFloat(req.query.temperature || req.query['location[temperature]']);
const humidity = parseFloat(req.query.humidity || req.query['location[humidity]']) || 50;
const climateZone = req.query.climateZone || req.query['location[climateZone]'] || null;

    const matchQuery = {
      "temperature.min": { $lte: temperature },
      "temperature.max": { $gte: temperature },
      $or: [
        { humidity: humidity < 40 ? "Low" : humidity > 60 ? "High" : "Moderate" },
        { humidity: { $exists: false } }
      ],
      ...(climateZone ? { climateZones: { $in: [climateZone] } } : {})
    };

    console.log("🔍 DB Query:", matchQuery);
if (isNaN(latitude) || isNaN(longitude) || isNaN(temperature)) {
  return res.status(400).json({ error: "Latitude, longitude, and temperature are required" });
}


    let humidityCategory = 'Moderate';
    if (humidity < 40) humidityCategory = 'Low';
    else if (humidity > 60) humidityCategory = 'High';

    // Query your Plant collection
    const plants = await Plant.find({
      "temperature.min": { $lte: temperature },
      "temperature.max": { $gte: temperature },
      $or: [
        { humidity: humidityCategory },
        { humidity: { $exists: false } }
      ],
      //  ...(climateZone ? { climateZones: { $in: [climateZone] } } : {})
    })
    .limit(limit);

    res.json({
      success: true,
      recommendations: plants,
      count: plants.length
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
    
    // Using Open-Meteo API (free weather service) - include humidity
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
    
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

// Climate-based plant recommendations endpoint
app.post('/api/recommendations/climate', async (req, res) => {
  try {
    const { temperature, humidity, climateZone } = req.body;

    if (temperature === undefined) {
      return res.status(400).json({ error: 'Temperature is required' });
    }

    console.log(`Fetching plants suitable for ${temperature}°C, ${humidity || 'N/A'}% humidity`);

    // Find plants matching temperature range (stored in DB)
    const plants = await Plant.find({
      isActive: true,
      'temperature.min': { $lte: temperature },
      'temperature.max': { $gte: temperature }
    });

    // Optional: Filter further by climate zone if provided
    let filteredPlants = plants;
    if (climateZone) {
      filteredPlants = plants.filter(p => 
        p.climateZones && p.climateZones.includes(climateZone)
      );
    }

    // Prepare response
    const recommendations = filteredPlants.map(p => ({
      name: p.name,
      description: p.description,
      image: p.image,
      reason: `Suitable for ${temperature}°C${climateZone ? ` and ${climateZone} zone` : ''}`
    }));

    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });

  } catch (error) {
    console.error('Climate recommendation error:', error);
    res.status(500).json({ error: 'Failed to get climate recommendations' });
  }
});

// // Climate-based recommendations API
// app.post('/api/recommendations/climate', async (req, res) => {
//   try {
//     const { latitude, longitude, temperature, humidity, climateZone } = req.body;

//     if (!latitude || !longitude || temperature === undefined || !climateZone) {
//       return res.status(400).json({ error: 'Latitude, longitude, temperature, and climateZone are required' });
//     }

//     const recommendations = await recommendationEngine.getClimateBasedRecommendations(
//       { latitude, longitude, temperature, humidity, climateZone },
//       10 // limit
//     );

//     res.json({
//       success: true,
//       count: recommendations.length,
//       recommendations
//     });
//   } catch (error) {
//     console.error('Climate recommendations error:', error);
//     res.status(500).json({ error: 'Failed to get climate recommendations' });
//   }
// });


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
function getClimateZoneFromLat(lat) {
  if (lat >= -23.5 && lat <= 23.5) {
    return "Tropical"; // Equator region
  } else if ((lat > 23.5 && lat <= 40) || (lat < -23.5 && lat >= -40)) {
    return "Subtropical";
  } else if ((lat > 40 && lat <= 60) || (lat < -40 && lat >= -60)) {
    return "Temperate";
  } else {
    return "Polar";
  }
}

