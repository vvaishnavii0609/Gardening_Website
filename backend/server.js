const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = 'mongodb://localhost:27017/Mpr_sem5';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const plantSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String, 
});

const Plant = mongoose.model('Plant', plantSchema);

app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
