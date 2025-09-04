const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getAllUsers, getAllPets, deleteUser, deletePet } = require('../controllers/adminController');

// Get all users with their adoption/posting stats
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

// Get all pets
router.get('/pets', authMiddleware, adminMiddleware, getAllPets);

// Delete user
router.delete('/users/:userId', authMiddleware, adminMiddleware, deleteUser);

// Delete pet
router.delete('/pets/:petId', authMiddleware, adminMiddleware, deletePet);

// Get dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await require('../models/User').countDocuments();
    const totalPets = await require('../models/Pet').countDocuments();
    const adoptedPets = await require('../models/Pet').countDocuments({ status: 'adopted' });
    const availablePets = await require('../models/Pet').countDocuments({ status: 'available' });
    
    res.json({
      totalUsers,
      totalPets,
      adoptedPets,
      availablePets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
