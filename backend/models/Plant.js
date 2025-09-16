console.log("✅ Loaded Plant schema from:", __filename);

const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, index: true },
  scientificName: { type: String, required: true, unique: true },
  commonNames: [String],
  family: { type: String, index: true },
  genus: { type: String, index: true },
  species: String,
  
  // Visual Information
  image: String,
  images: [String], // Multiple images
  thumbnail: String,
  
  // Care Requirements
  waterNeeds: { 
    type: String, 
    enum: ['Low', 'Moderate', 'High'], 
    default: 'Moderate',
    index: true 
  },
sunlight: { 
  type: String, 
  enum: ['Low light', 'Bright indirect', 'Full sun', 'Partial shade'],
  default: 'Bright indirect',
  index: true 
},

  temperature: {
    min: Number,
    max: Number,
    range: { type: String, index: true }
},
  humidity: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    default: 'Moderate'
  },
  
  // Growth Information
  growthRate: {
    type: String,
    enum: ['Slow', 'Moderate', 'Fast'],
    default: 'Moderate'
  },
  maxHeight: {
    value: Number,
    unit: { type: String, enum: ['cm', 'm', 'ft'], default: 'cm' }
  },
  maxWidth: {
    value: Number,
    unit: { type: String, enum: ['cm', 'm', 'ft'], default: 'cm' }
  },
  
  // Lifecycle
  lifecycle: {
    type: String,
    enum: ['Annual', 'Perennial', 'Biennial'],
    default: 'Perennial'
  },
  bloomTime: [String], // ['Spring', 'Summer']
  bloomColor: [String], // ['Red', 'Yellow', 'White']
  
  // Hardiness & Climate
  hardinessZones: [Number], // USDA zones
  climateZones: [String], // Tropical, Temperate, etc.
  
  // Care Level
  careLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    default: 'Moderate',
    index: true
  },
  
  // Special Features
  features: {
    flowering: { type: Boolean, default: false },
    fruiting: { type: Boolean, default: false },
    edible: { type: Boolean, default: false },
    medicinal: { type: Boolean, default: false },
    airPurifying: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: true },
    droughtTolerant: { type: Boolean, default: false },
    frostTolerant: { type: Boolean, default: false }
  },
  
careInstructions: {
  watering: {
    frequency: String,
    method: String,
    tips: [String]
  },
  sunlight: String,
  fertilizing: {
    frequency: String,
    type: String,
    tips: [String]
  }
},
  pruning: {
    frequency: String,
    method: String,
    tips: [String]
  },
  repotting: {
    frequency: String,
    method: String,
    tips: [String]
  },
  // Problems & Solutions
  commonProblems: [{
    problem: String,
    symptoms: [String],
    causes: [String],
    solutions: [String]
  }],
  
  // Propagation
  propagation: {
    methods: [String], // ['Seed', 'Cutting', 'Division']
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Difficult'],
      default: 'Moderate'
    },
    instructions: [String]
  },
  
  // Ratings & Reviews
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  userRatings: [{
    userId: String,
    rating: Number,
    review: String,
    date: { type: Date, default: Date.now }
  }],
  
  // Tags & Categories
  tags: [String],
  categories: [String],
  
  // SEO & Search
  description: String,
  longDescription: String,
  searchKeywords: [String],
  
  // Metadata
  source: String, // API source
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for better search performance
plantSchema.index({ name: 'text', scientificName: 'text', description: 'text' });
plantSchema.index({ tags: 1 });
plantSchema.index({ categories: 1 });
plantSchema.index({ 'features.airPurifying': 1 });
plantSchema.index({ 'features.petFriendly': 1 });

// Virtual for full name
plantSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.scientificName})`;
});

// Method to calculate care score
plantSchema.methods.getCareScore = function() {
  const scores = {
    waterNeeds: { 'Low': 1, 'Moderate': 2, 'High': 3 },
    careLevel: { 'Low': 1, 'Moderate': 2, 'High': 3 },
    growthRate: { 'Slow': 1, 'Moderate': 2, 'Fast': 3 }
  };
  
  return (
    scores.waterNeeds[this.waterNeeds] +
    scores.careLevel[this.careLevel] +
    scores.growthRate[this.growthRate]
  ) / 3;
};

// Static method to find plants by care level
plantSchema.statics.findByCareLevel = function(level) {
  return this.find({ careLevel: level });
};

// Static method to find plants suitable for climate
plantSchema.statics.findByClimate = function(temperature, humidity) {
  return this.find({
    'temperature.min': { $lte: temperature },
    'temperature.max': { $gte: temperature },
    humidity: humidity
  });
};

module.exports = mongoose.model('Plant', plantSchema); 