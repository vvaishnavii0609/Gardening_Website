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

async function checkPlants() {
  try {
    const plants = await Plant.find({});
    console.log(`\nFound ${plants.length} plants in database:`);
    
    if (plants.length === 0) {
      console.log('No plants found in database!');
      console.log('You need to run: node seedPlants.js');
    } else {
      plants.forEach((plant, index) => {
        console.log(`\n${index + 1}. ${plant.name}`);
        console.log(`   Description: ${plant.description}`);
        console.log(`   Image: ${plant.image}`);
        console.log(`   Tags: ${plant.tags ? plant.tags.join(', ') : 'No tags'}`);
        console.log(`   Rating: ${plant.rating || 'No rating'}`);
      });
    }

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error checking plants:', error);
    mongoose.connection.close();
  }
}

checkPlants(); 