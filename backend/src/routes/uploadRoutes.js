const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Single image upload - form data
router.post('/image', upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'Image uploaded successfully',
      url: imageUrl, // Use consistent field name
      imageUrl: imageUrl // Keep for backward compatibility
    });
  } catch (error) {
    next(error);
  }
});

// Base64 image upload
router.post('/image-base64', (req, res, next) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Handle base64 encoded image
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const fileName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Return URL path
    const imageUrl = `/uploads/${fileName}`;
    res.json({ 
      message: 'Image uploaded successfully',
      url: imageUrl,
      imageUrl: imageUrl // For backward compatibility
    });
  } catch (error) {
    next(error);
  }
});

// Multiple images upload - form data
router.post('/images', upload.array('images', 5), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ 
      message: 'Images uploaded successfully',
      urls: imageUrls, // Use consistent field name
      imageUrls: imageUrls // Keep for backward compatibility
    });
  } catch (error) {
    next(error);
  }
});

// Multiple base64 images upload
router.post('/images-base64', (req, res, next) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length === 0) {
      return res.status(400).json({ message: 'No images data provided or invalid format' });
    }

    const uploadPromises = req.body.images.map(async (imageData, index) => {
      // Skip empty strings
      if (!imageData) return null;
      
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const fileName = `img_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}.jpg`;
      const filePath = path.join(uploadsDir, fileName);

      // Write file
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${fileName}`;
    });

    Promise.all(uploadPromises)
      .then(imageUrls => {
        // Filter out any null values
        const validUrls = imageUrls.filter(url => url !== null);
        
        res.json({ 
          message: 'Images uploaded successfully',
          urls: validUrls,
          imageUrls: validUrls // For backward compatibility
        });
      })
      .catch(err => next(err));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
