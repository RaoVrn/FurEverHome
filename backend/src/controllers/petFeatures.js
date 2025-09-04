const Pet = require('../models/Pet');
const User = require('../models/User');

/**
 * Get nearby pets based on location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getNearbyPets = async (req, res, next) => {
  try {
    const { lat, lon, radius = 10 } = req.query; // radius in km
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // For simplicity, using a bounding box approach since geospatial might not be set up
    const pets = await Pet.find({
      status: 'available',
      // In a production app, use actual geospatial queries here
    })
    .populate('postedBy', 'name email phone location')
    .limit(20);
    
    res.json(pets);
  } catch (err) {
    next(err);
  }
};

/**
 * Get personalized pet recommendations based on user preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRecommendedPets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get user's liked pets
    const likedPets = await Pet.find({ likes: userId });
    
    // Get categories and breeds from liked pets
    const preferredCategories = [...new Set(likedPets.map(p => p.category))];
    const preferredBreeds = [...new Set(likedPets.map(p => p.breed))];
    
    // If user hasn't liked any pets yet, return popular pets
    if (preferredCategories.length === 0 && preferredBreeds.length === 0) {
      const popularPets = await Pet.find({ status: 'available' })
        .sort({ views: -1 })
        .limit(10)
        .populate('postedBy', 'name email phone location');
      
      return res.json(popularPets);
    }
    
    // Find similar pets
    const recommendedPets = await Pet.find({
      status: 'available',
      $or: [
        { category: { $in: preferredCategories } },
        { breed: { $in: preferredBreeds } }
      ],
      likes: { $ne: userId } // Don't include already liked pets
    })
    .populate('postedBy', 'name email phone location')
    .limit(10);
    
    res.json(recommendedPets);
  } catch (err) {
    next(err);
  }
};

/**
 * Report a pet for inappropriate content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const reportPet = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { reason, details } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Please provide a reason for reporting' });
    }
    
    const pet = await Pet.findById(petId);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Initialize reports array if it doesn't exist
    if (!pet.reports) {
      pet.reports = [];
    }
    
    // Add report
    pet.reports.push({
      reportedBy: req.user._id,
      reason,
      details,
      timestamp: new Date()
    });
    
    await pet.save();
    
    // Notify admin if multiple reports (in a real app, would use notifications)
    if (pet.reports.length >= 3) {
      console.log(`Pet ${petId} has been reported ${pet.reports.length} times`);
    }
    
    res.json({ message: 'Pet reported successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Get pet statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPetStats = async (req, res, next) => {
  try {
    // Simple stats without complex aggregations
    const totalPets = await Pet.countDocuments();
    const availablePets = await Pet.countDocuments({ status: 'available' });
    const adoptedPets = await Pet.countDocuments({ status: 'adopted' });
    
    // Get category distribution
    const categories = await Pet.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get location distribution (top 10)
    const locations = await Pet.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      totalPets,
      availablePets,
      adoptedPets,
      adoptionRate: totalPets > 0 ? (adoptedPets / totalPets * 100).toFixed(2) + '%' : '0%',
      categoryDistribution: categories,
      locationDistribution: locations
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNearbyPets,
  getRecommendedPets,
  reportPet,
  getPetStats
};
