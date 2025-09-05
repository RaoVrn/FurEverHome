const User = require('../models/User');
const Pet = require('../models/Pet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      loginCount: 0
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.isActive) return res.status(400).json({ message: 'Account is deactivated' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Update login stats
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date();
    user.loginHistory.push({
      time: new Date(),
      ip: req.ip || req.connection.remoteAddress
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('adoptedPets postedPets');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, location, avatar } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, location, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete (deactivate) account
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = false;
    await user.save();
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get account statistics
const getAccountStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's posted pets
    const postedPets = await Pet.find({ owner: userId });
    const adoptedPets = postedPets.filter(pet => pet.status === 'adopted');
    
    // Get user data for login stats
    const user = await User.findById(userId);
    
    const stats = {
      totalPetsPosted: postedPets.length,
      successfulAdoptions: adoptedPets.length,
      loginCount: user.loginCount || 0,
      lastLogin: user.lastLogin || null,
      accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const settings = req.body;
    
    await User.findByIdAndUpdate(userId, {
      notificationSettings: settings
    });
    
    res.json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Export user data
const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data
    const user = await User.findById(userId).select('-password');
    const pets = await Pet.find({ owner: userId });
    
    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt,
        role: user.role
      },
      pets: pets.map(pet => ({
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        description: pet.description,
        status: pet.status,
        createdAt: pet.createdAt
      })),
      statistics: {
        totalPetsPosted: pets.length,
        successfulAdoptions: pets.filter(pet => pet.status === 'adopted').length,
        loginCount: user.loginCount || 0,
        lastLogin: user.lastLogin
      },
      exportDate: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="fureverhome-data-${user.name}-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, deleteAccount, getAccountStats, updateNotificationSettings, exportUserData };
