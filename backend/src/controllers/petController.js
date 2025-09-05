const Pet = require('../models/Pet');
const User = require('../models/User');

// Helper function to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Simple in-memory cache for view debouncing (petId+ip => timestamp)
const petViewCache = new Map();

// Post a pet
exports.addPet = async (req, res, next) => {
  try {
    const raw = req.body || {};
    // Accept both photos / images arrays
    let {
      name, age, breed, category, gender, size, color, description,
      healthDetails, vaccinated, neutered, location, coordinates,
      temperament, goodWith, activityLevel, specialNeeds,
      photos, images, videos, adoptionFee, urgency, weight, dietaryNeeds,
      currency, originType, foundLocation, foundDate
    } = raw;

    // Backward compatibility alias
    if (!photos && Array.isArray(images)) photos = images;
    if (!Array.isArray(photos)) photos = photos ? [photos] : [];

    // Coerce numeric fields
    if (age !== undefined) age = Number(age);
    if (adoptionFee !== undefined) adoptionFee = Number(adoptionFee) || 0;

    // Normalize currency (default USD) & originType
    currency = (currency || 'USD').toString().toUpperCase().slice(0,3);
    originType = originType === 'stray' ? 'stray' : 'owned';

    // Stray pets are always free
    if (originType === 'stray') {
      adoptionFee = 0;
    }

    // Enhanced validation
    // NOTE: size was causing frequent user errors; treat as optional and default to 'medium'
    const requiredFields = ['name', 'age', 'breed', 'category', 'gender', 'location', 'description'];
    const missingFields = requiredFields.filter(field => !raw[field]);
    
    if (missingFields.length > 0) {
      console.warn('AddPet validation failed. Incoming body:', JSON.stringify({ ...raw, photosLength: photos.length }, null, 2));
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Create pet with enhanced fields
    const pet = new Pet({
      name,
      age,
      breed,
      category,
      gender,
  size: size || 'medium',
      color,
      description,
      healthDetails,
      vaccinated: vaccinated || false,
      neutered: neutered || false,
      location,
      coordinates: coordinates || {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      },
      weight,
      dietaryNeeds,
  photos: photos.length ? photos : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'],
  image: (photos && photos[0]) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K', // For backward compatibility
      videos: videos || [],
  adoptionFee: adoptionFee || 0,
  currency,
  originType,
  foundLocation: originType === 'stray' ? (foundLocation || location) : undefined,
  foundDate: originType === 'stray' && foundDate ? new Date(foundDate) : undefined,
      urgency: urgency || 'medium',
      temperament: temperament || [],
      goodWith: goodWith || {
        children: false,
        dogs: false,
        cats: false
      },
      activityLevel: activityLevel || 'medium',
      specialNeeds: specialNeeds || '',
      postedBy: req.user._id
    });

    await pet.save();

    // Add to user's postedPets list
    await User.findByIdAndUpdate(req.user._id, { $push: { postedPets: pet._id } });

    res.status(201).json({ message: 'Pet added successfully', pet });
  } catch (err) {
    console.error('Add pet error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all pets (available only)
exports.getAllPets = async (req, res) => {
  try {
    const query = { status: 'available' };
    if (req.query.originType && ['owned','stray'].includes(req.query.originType)) {
      query.originType = req.query.originType;
    }
    const pets = await Pet.find(query)
      .populate('postedBy', 'name email phone location')
      .sort({ urgency: -1, createdAt: -1 });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single pet
exports.getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('postedBy', 'name email phone location avatar')
      .populate('adoptedBy', 'name');
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Debounce duplicate view increments (React StrictMode or fast reloads)
    const viewKey = `${pet._id}_${req.ip}`;
    const now = Date.now();
    const last = petViewCache.get(viewKey);
    if (!last || (now - last) > 5000) { // 5s window
      pet.views = (pet.views || 0) + 1;
      await pet.save();
      petViewCache.set(viewKey, now);
    }

    // Ensure photo property exists for backward compatibility
    if (!pet.photos && pet.image) {
      pet.photos = [pet.image];
    } else if (!pet.photos) {
      pet.photos = ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'];
    }

    // Ensure image property exists for backward compatibility
    if (!pet.image && pet.photos && pet.photos.length > 0) {
      pet.image = pet.photos[0];
    } else if (!pet.image) {
      pet.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
    }

    // Get similar pets
    const similarPets = await Pet.find({
      _id: { $ne: pet._id },
      $or: [
        { breed: pet.breed },
        { category: pet.category }
      ],
      status: 'available'
    })
    .limit(4)
    .select('name image photos breed age gender');

    res.json({
      pet: {
        ...pet.toObject(),
        isLiked: req.user ? pet.likes.includes(req.user._id) : false,
        likeCount: pet.likes.length
      },
      similarPets
    });
  } catch (err) {
    next(err);
  }
};

// Adopt a pet
exports.adoptPet = async (req, res) => {
  try {
    const { petId } = req.body;
    const pet = await Pet.findById(petId);
    
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (pet.status === 'adopted') return res.status(400).json({ message: 'Pet already adopted' });
    if (pet.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot adopt your own pet' });
    }

    pet.status = 'adopted';
    pet.adoptedBy = req.user._id;
    pet.adoptedAt = new Date();
    await pet.save();

    // Add to user's adoptedPets list
    await User.findByIdAndUpdate(req.user._id, { $push: { adoptedPets: pet._id } });

    res.json({ message: 'Pet adopted successfully', pet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like/Unlike a pet
exports.toggleLikePet = async (req, res) => {
  try {
  const petId = req.params.id || req.params.petId; // support both :id and :petId
  const pet = await Pet.findById(petId);
    
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

  const likeIndex = pet.likes.findIndex(id => id.toString() === req.user._id.toString());
    if (likeIndex > -1) {
      pet.likes.splice(likeIndex, 1);
    } else {
      pet.likes.push(req.user._id);
    }

    await pet.save();
  res.json({ message: 'Pet like status updated', likes: pet.likes.length, liked: likeIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a pet
exports.updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if user is owner or admin
    if (pet.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this pet' });
    }
    
    // Handle image/photo changes
    const {
      photos, // new field for multiple photos
      image, // legacy field for single image
      ...updateData
    } = req.body;

    // Convert legacy image field to photos array if needed
    if (image && (!photos || photos.length === 0)) {
      updateData.photos = [image];
      updateData.image = image; // Keep for backward compatibility
    } else if (photos && photos.length > 0) {
      updateData.photos = photos;
      updateData.image = photos[0]; // Set first photo as main image for backward compatibility
    }

    // Normalize currency/originType if provided
    if (updateData.currency) {
      updateData.currency = updateData.currency.toString().toUpperCase().slice(0,3);
    }
    if (updateData.originType) {
      updateData.originType = updateData.originType === 'stray' ? 'stray' : 'owned';
      if (updateData.originType === 'stray') {
        updateData.adoptionFee = 0; // enforce free
        if (!updateData.foundLocation) updateData.foundLocation = pet.location;
        if (updateData.foundDate) updateData.foundDate = new Date(updateData.foundDate);
      } else {
        // If switching back to owned and fee not provided keep existing
        if (updateData.adoptionFee === undefined) updateData.adoptionFee = pet.adoptionFee;
      }
    }

    Object.assign(pet, updateData);
    await pet.save();

    // Fetch the updated pet with populated fields
    const updatedPet = await Pet.findById(pet._id).populate('postedBy', 'name email phone location');
    
    res.json({ message: 'Pet updated successfully', pet: updatedPet });
  } catch (err) {
    next(err);
  }
};

// Delete a pet
exports.deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Allow admins to delete any pet
    if (pet.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this pet' });
    }

    // Remove from user's postedPets list
    await User.findByIdAndUpdate(
      pet.postedBy, 
      { $pull: { postedPets: pet._id } }
    );
    
    // If adopted, remove from adoptedPets list
    if (pet.adoptedBy) {
      await User.findByIdAndUpdate(
        pet.adoptedBy,
        { $pull: { adoptedPets: pet._id } }
      );
    }

    // Delete the pet
    await Pet.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Pet deleted successfully',
      petId: req.params.id
    });
  } catch (err) {
    next(err);
  }
};

// Search pets
exports.searchPets = async (req, res) => {
  try {
  const { name, breed, category, originType } = req.query;
  const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (breed) query.breed = { $regex: breed, $options: 'i' };
  if (category) query.category = category;
  if (originType && ['owned','stray'].includes(originType)) query.originType = originType;

    const pets = await Pet.find(query).populate('postedBy', 'name email phone location');

    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
