const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  addPet, getAllPets, adoptPet, getPetById, toggleLikePet, 
  updatePet, deletePet, searchPets 
} = require('../controllers/petController');
const {
  getNearbyPets,
  getRecommendedPets,
  reportPet,
  getPetStats
} = require('../controllers/petFeatures');

// Advanced search and filtering
router.get('/search', searchPets);

// Get nearby pets based on location
router.get('/nearby', getNearbyPets);

// Get personalized pet recommendations
router.get('/recommended', authMiddleware, getRecommendedPets);

// Report a pet
router.post('/:petId/report', authMiddleware, reportPet);

// Get pet statistics
router.get('/stats', getPetStats);

// Get trending pets
router.get('/trending', require('../controllers/petFeatures').getTrendingPets);
// Adoption & engagement insights
router.get('/insights', require('../controllers/petFeatures').getAdoptionInsights);

const Pet = require('../models/Pet');

// Get user's posted pets
router.get('/user/posted', authMiddleware, async (req, res, next) => {
  try {
    const pets = await Pet.find({ postedBy: req.user._id })
      .populate('postedBy', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    next(error);
  }
});

// Get user's adopted pets
router.get('/user/adopted', authMiddleware, async (req, res, next) => {
  try {
    const pets = await Pet.find({ adoptedBy: req.user._id })
      .populate('postedBy', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    next(error);
  }
});

// Get user's favorite pets
router.get('/user/favorites', authMiddleware, async (req, res, next) => {
  try {
    const pets = await Pet.find({ likes: req.user._id })
      .populate('postedBy', 'name email phone location')
      .sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    next(error);
  }
});

// Get all pets (with filters)
router.get('/', async (req, res, next) => {
  try {
    const { 
      breed, minAge, maxAge, status, search, 
      location, category, gender, size, 
      page = 1, limit = 12, sort = 'newest' 
    } = req.query;
    
    let query = {};
    // Basic filters
    if (breed) query.breed = { $regex: breed, $options: 'i' };
    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (size) query.size = size;
    
    // Age range
    if (minAge || maxAge) query.age = {};
    if (minAge) query.age.$gte = Number(minAge);
    if (maxAge) query.age.$lte = Number(maxAge);
    
    // Status filter
    if (status === 'available') query.status = 'available';
    if (status === 'adopted') query.status = 'adopted';
    
    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Location filter
    if (location) query.location = { $regex: location, $options: 'i' };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    let sortOptions = { createdAt: -1 }; // Default newest first
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    else if (sort === 'price-low') sortOptions = { adoptionFee: 1 };
    else if (sort === 'price-high') sortOptions = { adoptionFee: -1 };
    else if (sort === 'urgency') sortOptions = { urgency: -1 };

    // Count total for pagination
    const total = await Pet.countDocuments(query);
    
    // Execute query with pagination and sort
    const pets = await Pet.find(query)
      .populate('postedBy', 'name email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      pets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add new pet (protected route)
router.post('/', authMiddleware, addPet);

// Adopt a pet (protected route)
router.post('/adopt', authMiddleware, adoptPet);

// Like/Unlike pet (protected route)
router.post('/:petId/like', authMiddleware, toggleLikePet);

// Get single pet by ID
router.get('/:id', getPetById);

// Update pet (protected route)
router.put('/:id', authMiddleware, updatePet);

// Delete pet (protected route)
router.delete('/:id', authMiddleware, deletePet);

module.exports = router;
