require('dotenv').config();
const mongoose = require('mongoose');
delete mongoose.connection.models['Plant'];
const axios = require('axios');
const mongoURI = 'mongodb://localhost:27017/Mpr_sem5';

const TREFLE_API_KEY = process.env.TREFLE_API_KEY;
const TREFLE_BASE_URL = 'https://trefle.io/api/v1/plants';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const Plant = require('./models/Plant');

console.log("Schema path for careInstructions.fertilizing:",
  require('./models/Plant').schema.path('careInstructions.fertilizing')?.instance
);


// const samplePlants = [
//   {
//     name: "Snake Plant",
//     description: "A hardy indoor plant known for its air-purifying qualities and low maintenance requirements. Perfect for beginners.",
//     image: "/images/snake_plant.png",
//     waterNeeds: "Low",
//     sunlight: "Low to bright indirect",
//     temperature: "60-85°F",
//     rating: 4.5,
//     reviews: 127,
//     tags: ["indoor", "lowMaintenance", "airPurifying"]
//   },
//   {
//     name: "Peace Lily",
//     description: "Beautiful flowering plant that helps purify indoor air. Known for its elegant white flowers and dark green leaves.",
//     image: "/images/peace_lily.png",
//     waterNeeds: "Moderate",
//     sunlight: "Medium indirect",
//     temperature: "65-80°F",
//     rating: 4.3,
//     reviews: 89,
//     tags: ["indoor", "flowering", "airPurifying"]
//   },
//   {
//     name: "Monstera Deliciosa",
//     description: "Popular tropical plant with distinctive split leaves. Adds a dramatic touch to any indoor space.",
//     image: "/images/monstera.png",
//     waterNeeds: "Moderate",
//     sunlight: "Bright indirect",
//     temperature: "65-85°F",
//     rating: 4.7,
//     reviews: 156,
//     tags: ["indoor", "tropical", "statement"]
//   },
//   {
//     name: "Pothos",
//     description: "Versatile trailing plant that's perfect for hanging baskets or climbing. Very easy to care for.",
//     image: "/images/pothos.png",
//     waterNeeds: "Low to moderate",
//     sunlight: "Low to bright indirect",
//     temperature: "60-85°F",
//     rating: 4.4,
//     reviews: 203,
//     tags: ["indoor", "lowMaintenance", "trailing"]
//   },
//   {
//     name: "Fiddle Leaf Fig",
//     description: "Trendy indoor tree with large, violin-shaped leaves. Makes a stunning focal point in any room.",
//     image: "/images/fiddle_leaf_fig.png",
//     waterNeeds: "Moderate",
//     sunlight: "Bright indirect",
//     temperature: "60-75°F",
//     rating: 4.2,
//     reviews: 78,
//     tags: ["indoor", "statement", "tree"]
//   },
//   {
//     name: "Aloe Vera",
//     description: "Succulent plant known for its medicinal properties. Easy to care for and drought-tolerant.",
//     image: "/images/aloe_vera.png",
//     waterNeeds: "Low",
//     sunlight: "Bright direct",
//     temperature: "55-80°F",
//     rating: 4.6,
//     reviews: 145,
//     tags: ["indoor", "outdoor", "lowMaintenance", "medicinal"]
//   },
//   {
//     name: "Lavender",
//     description: "Fragrant flowering plant perfect for gardens. Attracts pollinators and has calming properties.",
//     image: "https://images.unsplash.com/photo-1528722828814-77b9b83a6b5b?w=400",
//     waterNeeds: "Low",
//     sunlight: "Full sun",
//     temperature: "60-75°F",
//     rating: 4.8,
//     reviews: 234,
//     tags: ["outdoor", "flowering", "herb", "fragrant"]
//   },
//   {
//     name: "Tomato Plant",
//     description: "Popular vegetable plant that produces delicious fruits. Great for home gardens and containers.",
//     image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
//     waterNeeds: "Moderate to high",
//     sunlight: "Full sun",
//     temperature: "65-85°F",
//     rating: 4.5,
//     reviews: 189,
//     tags: ["outdoor", "vegetable", "edible"]
//   },
//   {
//     name: "Rose Bush",
//     description: "Classic flowering shrub known for its beautiful blooms and fragrance. Available in many colors.",
//     image: "https://images.unsplash.com/photo-1496062031456-52d2a0e4b4c0?w=400",
//     waterNeeds: "Moderate",
//     sunlight: "Full sun",
//     temperature: "60-75°F",
//     rating: 4.4,
//     reviews: 167,
//     tags: ["outdoor", "flowering", "fragrant"]
//   }
// ];

// async function seedPlants() {
//   try {
//     // Clear existing plants
//     await Plant.deleteMany({});
//     console.log('Cleared existing plants');

//     // Insert sample plants
//     const insertedPlants = await Plant.insertMany(samplePlants);
//     console.log(`Successfully seeded ${insertedPlants.length} plants`);

//     // Display the plants
//     const allPlants = await Plant.find({});
//     console.log('\nSeeded plants:');
//     allPlants.forEach(plant => {
//       console.log(`- ${plant.name} (${plant.tags.join(', ')})`);
//     });

//     mongoose.connection.close();
//     console.log('\nDatabase connection closed');
//   } catch (error) {
//     console.error('Error seeding plants:', error);
//     mongoose.connection.close();
//   }
// }

// seedPlants(); 

async function fetchPlantsFromAPI(page = 1, perPage = 50) {
  try {
    const response = await axios.get(TREFLE_BASE_URL, {
      params: {
        token: TREFLE_API_KEY,
        page: page,
        per_page: perPage
      }
    });

// ...existing code...
return response.data.data.map(plant => ({
  name: plant.common_name || plant.scientific_name || "Unknown",
  scientificName: plant.scientific_name || "Unknown",
  commonNames: plant.common_name ? [plant.common_name] : [],
  family: plant.family || "",
  genus: plant.genus || "",
  species: plant.species || "",
  image: plant.image_url || "https://via.placeholder.com/300x200.png?text=No+Image",
  images: [plant.image_url || "https://via.placeholder.com/300x200.png?text=No+Image"],
  thumbnail: plant.image_url || "https://via.placeholder.com/300x200.png?text=No+Image",
  waterNeeds: ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)],
  sunlight: ["Low light", "Bright indirect", "Full sun", "Partial shade"][Math.floor(Math.random() * 4)],
  temperature: {
    min: Math.floor(Math.random() * 10) + 10,
    max: Math.floor(Math.random() * 10) + 25,
    range: "10-35°C"
  },
  humidity: ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)],
  growthRate: ["Slow", "Moderate", "Fast"][Math.floor(Math.random() * 3)],
  maxHeight: { value: Math.floor(Math.random() * 100) + 20, unit: "cm" },
  maxWidth: { value: Math.floor(Math.random() * 50) + 10, unit: "cm" },
  lifecycle: ["Annual", "Perennial", "Biennial"][Math.floor(Math.random() * 3)],
  bloomTime: ["Spring", "Summer", "Autumn", "Winter"].filter(() => Math.random() > 0.7),
  bloomColor: ["Red", "Yellow", "White", "Pink", "Purple"].filter(() => Math.random() > 0.7),
  hardinessZones: [Math.floor(Math.random() * 10) + 1],
  climateZones: ["Tropical", "Temperate", "Subtropical"].filter(() => Math.random() > 0.5),
  careLevel: ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)],
  features: {
    flowering: Math.random() > 0.5,
    fruiting: Math.random() > 0.5,
    edible: Math.random() > 0.5,
    medicinal: Math.random() > 0.5,
    airPurifying: Math.random() > 0.5,
    petFriendly: Math.random() > 0.5,
    droughtTolerant: Math.random() > 0.5,
    frostTolerant: Math.random() > 0.5
  },
  careInstructions: {
    watering: {
      frequency: "Weekly",
      method: "Soil check",
      tips: ["Let soil dry between waterings"]
    },
    fertilizing: {
      frequency: "Monthly",
      type: "Balanced",
      tips: ["Use liquid fertilizer"]
    },
    pruning: {
      frequency: "Seasonal",
      method: "Trim dead leaves",
      tips: ["Sterilize tools"]
    },
    repotting: {
      frequency: "Yearly",
      method: "Change pot",
      tips: ["Use fresh soil"]
    }
  },
  commonProblems: [],
  propagation: {
    methods: ["Cuttings", "Division", "Seeds"].filter(() => Math.random() > 0.5),
    difficulty: ["Easy", "Moderate", "Difficult"][Math.floor(Math.random() * 3)],
    instructions: ["Use healthy stems", "Keep moist"]
  },
  rating: Math.floor(Math.random() * 5) + 1,
  reviews: Math.floor(Math.random() * 500),
  userRatings: [],
  tags: ["indoor", "outdoor", "flowering", "lowMaintenance"].filter(() => Math.random() > 0.5),
  categories: ["houseplant", "garden"].filter(() => Math.random() > 0.5),
  description: plant.scientific_name || "No description available",
  longDescription: "",
  searchKeywords: [],
  source: "Trefle",
  lastUpdated: new Date(),
  isActive: true
}));
// ...existing code...
// ...existing code...

  } catch (error) {
    console.error("❌ Error fetching plants from API:", error.message);
    return [];
  }
}

async function seedPlants() {
  try {
    await Plant.deleteMany({});
    console.log("🗑 Old plant data deleted.");

    let allPlants = [];
    let totalPages = 20; // 20 pages × 50 = 1000 plants

    for (let page = 1; page <= totalPages; page++) {
      console.log(`📥 Fetching page ${page}...`);
      const plants = await fetchPlantsFromAPI(page, 50);
      allPlants = [...allPlants, ...plants];
    }

    await Plant.insertMany(allPlants);
    console.log(`✅ ${allPlants.length} plants inserted successfully!`);

  } catch (error) {
    console.error("❌ Error seeding plants:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedPlants();