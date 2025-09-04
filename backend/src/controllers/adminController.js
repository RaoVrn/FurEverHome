const User = require('../models/User');
const Pet = require('../models/Pet');

// Get all users with adoption stats
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('adoptedPets postedPets', 'name breed status');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find().populate('postedBy adoptedBy', 'name email');
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a pet
exports.deletePet = async (req, res) => {
  try {
    const { petId } = req.params;
    await Pet.findByIdAndDelete(petId);
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
