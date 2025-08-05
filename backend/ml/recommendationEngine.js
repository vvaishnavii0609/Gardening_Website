const mongoose = require('mongoose');
const Plant = require('../models/Plant');

class AdvancedRecommendationEngine {
  constructor() {
    this.userPreferences = new Map();
    this.plantFeatures = new Map();
    this.similarityMatrix = new Map();
  }

  // Content-based filtering
  async getContentBasedRecommendations(userId, limit = 10) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const allPlants = await Plant.find({ isActive: true });
      
      // Calculate similarity scores
      const recommendations = allPlants.map(plant => {
        const score = this.calculateContentSimilarity(userProfile, plant);
        return { plant, score };
      });
      
      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(rec => ({
          ...rec.plant.toObject(),
          recommendationScore: rec.score,
          reason: this.getRecommendationReason(userProfile, rec.plant)
        }));
    } catch (error) {
      console.error('Content-based recommendation error:', error);
      return [];
    }
  }

  // Collaborative filtering
  async getCollaborativeRecommendations(userId, limit = 10) {
    try {
      const similarUsers = await this.findSimilarUsers(userId);
      const userRatings = await this.getUserRatings(similarUsers);
      
      // Calculate weighted average ratings
      const recommendations = new Map();
      
      for (const [plantId, ratings] of userRatings) {
        const weightedScore = this.calculateWeightedScore(ratings, similarUsers);
        recommendations.set(plantId, weightedScore);
      }
      
      // Get plant details and sort
      const plantIds = Array.from(recommendations.keys());
      const plants = await Plant.find({ _id: { $in: plantIds } });
      
      return plants
        .map(plant => ({
          ...plant.toObject(),
          recommendationScore: recommendations.get(plant._id.toString()),
          reason: 'Recommended by users with similar preferences'
        }))
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Collaborative recommendation error:', error);
      return [];
    }
  }

  // Hybrid recommendations
  async getHybridRecommendations(userId, limit = 10) {
    try {
      const [contentRecs, collaborativeRecs] = await Promise.all([
        this.getContentBasedRecommendations(userId, limit),
        this.getCollaborativeRecommendations(userId, limit)
      ]);
      
      // Combine and re-rank
      const combinedRecs = this.combineRecommendations(contentRecs, collaborativeRecs);
      
      return combinedRecs.slice(0, limit);
    } catch (error) {
      console.error('Hybrid recommendation error:', error);
      return [];
    }
  }

  // Climate-based recommendations
  async getClimateBasedRecommendations(location, limit = 10) {
    try {
      const { latitude, longitude, temperature, humidity, climateZone } = location;
      
      // Find plants suitable for the climate
      const climatePlants = await Plant.find({
        isActive: true,
        $or: [
          { 'temperature.min': { $lte: temperature }, 'temperature.max': { $gte: temperature } },
          { climateZones: climateZone },
          { hardinessZones: { $in: this.getHardinessZone(latitude) } }
        ]
      });
      
      // Score based on climate suitability
      const scoredPlants = climatePlants.map(plant => {
        const climateScore = this.calculateClimateScore(plant, location);
        return {
          ...plant.toObject(),
          recommendationScore: climateScore,
          reason: `Suitable for ${climateZone} climate (${temperature}°C)`
        };
      });
      
      return scoredPlants
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Climate-based recommendation error:', error);
      return [];
    }
  }

  // Experience-based recommendations
  async getExperienceBasedRecommendations(userExperience, limit = 10) {
    try {
      const careLevel = this.mapExperienceToCareLevel(userExperience);
      
      const plants = await Plant.find({
        isActive: true,
        careLevel: careLevel
      });
      
      return plants
        .map(plant => ({
          ...plant.toObject(),
          recommendationScore: 1.0,
          reason: `Perfect for ${userExperience} gardeners`
        }))
        .slice(0, limit);
    } catch (error) {
      console.error('Experience-based recommendation error:', error);
      return [];
    }
  }

  // Seasonal recommendations
  async getSeasonalRecommendations(season, location, limit = 10) {
    try {
      const seasonalPlants = await Plant.find({
        isActive: true,
        bloomTime: { $in: [season] }
      });
      
      // Filter by climate suitability
      const climateSuitable = seasonalPlants.filter(plant => 
        this.isClimateSuitable(plant, location)
      );
      
      return climateSuitable
        .map(plant => ({
          ...plant.toObject(),
          recommendationScore: 1.0,
          reason: `Perfect for ${season} planting in your area`
        }))
        .slice(0, limit);
    } catch (error) {
      console.error('Seasonal recommendation error:', error);
      return [];
    }
  }

  // Helper methods
  async getUserProfile(userId) {
    // This would typically come from user preferences and history
    return {
      preferredCareLevel: 'Moderate',
      preferredWaterNeeds: 'Moderate',
      preferredSunlight: 'Bright indirect',
      preferredFeatures: ['flowering', 'airPurifying'],
      experienceLevel: 'Intermediate'
    };
  }

  calculateContentSimilarity(userProfile, plant) {
    let score = 0;
    
    // Care level match
    if (userProfile.preferredCareLevel === plant.careLevel) score += 0.3;
    
    // Water needs match
    if (userProfile.preferredWaterNeeds === plant.waterNeeds) score += 0.2;
    
    // Sunlight match
    if (userProfile.preferredSunlight === plant.sunlight) score += 0.2;
    
    // Feature preferences
    const featureMatches = userProfile.preferredFeatures.filter(feature => 
      plant.features[feature]
    ).length;
    score += (featureMatches / userProfile.preferredFeatures.length) * 0.3;
    
    return score;
  }

  async findSimilarUsers(userId) {
    // This would implement user similarity calculation
    // For now, return a mock list
    return ['user1', 'user2', 'user3'];
  }

  async getUserRatings(userIds) {
    // This would fetch actual user ratings
    // For now, return mock data
    return new Map([
      ['plant1', [{ userId: 'user1', rating: 4.5 }, { userId: 'user2', rating: 4.0 }]],
      ['plant2', [{ userId: 'user1', rating: 3.5 }, { userId: 'user3', rating: 4.5 }]]
    ]);
  }

  calculateWeightedScore(ratings, similarUsers) {
    const totalWeight = ratings.length;
    const weightedSum = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return weightedSum / totalWeight;
  }

  combineRecommendations(contentRecs, collaborativeRecs) {
    const combined = new Map();
    
    // Add content-based recommendations
    contentRecs.forEach(rec => {
      combined.set(rec._id.toString(), {
        ...rec,
        finalScore: rec.recommendationScore * 0.6
      });
    });
    
    // Add collaborative recommendations
    collaborativeRecs.forEach(rec => {
      const existing = combined.get(rec._id.toString());
      if (existing) {
        existing.finalScore += rec.recommendationScore * 0.4;
      } else {
        combined.set(rec._id.toString(), {
          ...rec,
          finalScore: rec.recommendationScore * 0.4
        });
      }
    });
    
    return Array.from(combined.values())
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  calculateClimateScore(plant, location) {
    let score = 0;
    
    // Temperature suitability
    if (plant.temperature.min <= location.temperature && 
        plant.temperature.max >= location.temperature) {
      score += 0.5;
    }
    
    // Climate zone match
    if (plant.climateZones.includes(location.climateZone)) {
      score += 0.3;
    }
    
    // Hardiness zone match
    const userHardinessZone = this.getHardinessZone(location.latitude);
    if (plant.hardinessZones.includes(userHardinessZone)) {
      score += 0.2;
    }
    
    return score;
  }

  getHardinessZone(latitude) {
    // Simplified hardiness zone calculation
    if (latitude > 60) return 1;
    if (latitude > 50) return 3;
    if (latitude > 40) return 5;
    if (latitude > 30) return 7;
    if (latitude > 20) return 9;
    return 11;
  }

  mapExperienceToCareLevel(experience) {
    const mapping = {
      'beginner': 'Low',
      'intermediate': 'Moderate',
      'advanced': 'High'
    };
    return mapping[experience] || 'Moderate';
  }

  isClimateSuitable(plant, location) {
    return plant.temperature.min <= location.temperature && 
           plant.temperature.max >= location.temperature;
  }

  getRecommendationReason(userProfile, plant) {
    const reasons = [];
    
    if (userProfile.preferredCareLevel === plant.careLevel) {
      reasons.push('Matches your preferred care level');
    }
    
    if (plant.features.airPurifying) {
      reasons.push('Air purifying plant');
    }
    
    if (plant.features.flowering) {
      reasons.push('Beautiful flowering plant');
    }
    
    return reasons.join(', ') || 'Great addition to your collection';
  }
}

module.exports = AdvancedRecommendationEngine; 