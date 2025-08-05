const mongoose = require('mongoose');

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

const samplePlants = [
  {
    name: "Snake Plant",
    description: "A hardy indoor plant known for its air-purifying qualities and low maintenance requirements. Perfect for beginners.",
    image: "/images/snake_plant.png",
    waterNeeds: "Low",
    sunlight: "Low to bright indirect",
    temperature: "60-85°F",
    rating: 4.5,
    reviews: 127,
    tags: ["indoor", "lowMaintenance", "airPurifying"]
  },
  {
    name: "Peace Lily",
    description: "Beautiful flowering plant that helps purify indoor air. Known for its elegant white flowers and dark green leaves.",
    image: "/images/peace_lily.png",
    waterNeeds: "Moderate",
    sunlight: "Medium indirect",
    temperature: "65-80°F",
    rating: 4.3,
    reviews: 89,
    tags: ["indoor", "flowering", "airPurifying"]
  },
  {
    name: "Monstera Deliciosa",
    description: "Popular tropical plant with distinctive split leaves. Adds a dramatic touch to any indoor space.",
    image: "/images/monstera.png",
    waterNeeds: "Moderate",
    sunlight: "Bright indirect",
    temperature: "65-85°F",
    rating: 4.7,
    reviews: 156,
    tags: ["indoor", "tropical", "statement"]
  },
  {
    name: "Pothos",
    description: "Versatile trailing plant that's perfect for hanging baskets or climbing. Very easy to care for.",
    image: "/images/pothos.png",
    waterNeeds: "Low to moderate",
    sunlight: "Low to bright indirect",
    temperature: "60-85°F",
    rating: 4.4,
    reviews: 203,
    tags: ["indoor", "lowMaintenance", "trailing"]
  },
  {
    name: "Fiddle Leaf Fig",
    description: "Trendy indoor tree with large, violin-shaped leaves. Makes a stunning focal point in any room.",
    image: "/images/fiddle_leaf_fig.png",
    waterNeeds: "Moderate",
    sunlight: "Bright indirect",
    temperature: "60-75°F",
    rating: 4.2,
    reviews: 78,
    tags: ["indoor", "statement", "tree"]
  },
  {
    name: "Aloe Vera",
    description: "Succulent plant known for its medicinal properties. Easy to care for and drought-tolerant.",
    image: "/images/aloe_vera.png",
    waterNeeds: "Low",
    sunlight: "Bright direct",
    temperature: "55-80°F",
    rating: 4.6,
    reviews: 145,
    tags: ["indoor", "outdoor", "lowMaintenance", "medicinal"]
  },
  {
    name: "Lavender",
    description: "Fragrant flowering plant perfect for gardens. Attracts pollinators and has calming properties.",
    image: "https://images.unsplash.com/photo-1528722828814-77b9b83a6b5b?w=400",
    waterNeeds: "Low",
    sunlight: "Full sun",
    temperature: "60-75°F",
    rating: 4.8,
    reviews: 234,
    tags: ["outdoor", "flowering", "herb", "fragrant"]
  },
  {
    name: "Tomato Plant",
    description: "Popular vegetable plant that produces delicious fruits. Great for home gardens and containers.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
    waterNeeds: "Moderate to high",
    sunlight: "Full sun",
    temperature: "65-85°F",
    rating: 4.5,
    reviews: 189,
    tags: ["outdoor", "vegetable", "edible"]
  },
  {
    name: "Rose Bush",
    description: "Classic flowering shrub known for its beautiful blooms and fragrance. Available in many colors.",
    image: "https://images.unsplash.com/photo-1496062031456-52d2a0e4b4c0?w=400",
    waterNeeds: "Moderate",
    sunlight: "Full sun",
    temperature: "60-75°F",
    rating: 4.4,
    reviews: 167,
    tags: ["outdoor", "flowering", "fragrant"]
  }
];

async function seedPlants() {
  try {
    // Clear existing plants
    await Plant.deleteMany({});
    console.log('Cleared existing plants');

    // Insert sample plants
    const insertedPlants = await Plant.insertMany(samplePlants);
    console.log(`Successfully seeded ${insertedPlants.length} plants`);

    // Display the plants
    const allPlants = await Plant.find({});
    console.log('\nSeeded plants:');
    allPlants.forEach(plant => {
      console.log(`- ${plant.name} (${plant.tags.join(', ')})`);
    });

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding plants:', error);
    mongoose.connection.close();
  }
}

seedPlants(); 