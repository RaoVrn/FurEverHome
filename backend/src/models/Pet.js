const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  breed: { type: String, required: true, index: true },
  category: { type: String, enum: ['dog','cat','bird','rabbit','other'], required: true, index: true },
  age: { type: Number, required: true, min: 0 },
  size: { type: String, enum: ['small','medium','large'], default: 'medium' },
  color: { type: String },
  gender: { type: String, enum: ['male','female'], required: true },
  weight: { type: Number, min: 0 },
  vaccinated: { type: Boolean, default: false },
  neutered: { type: Boolean, default: false },
  healthDetails: String,
  dietaryNeeds: String,
  status: { type: String, enum: ['available','pending','adopted'], default: 'available', index: true },
  adoptionFee: { type: Number, default: 0, min: 0 },
  urgency: { type: String, enum: ['low','medium','high'], default: 'medium' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adoptedAt: { type: Date },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  photos: [{ type: String }],
  videos: [{ type: String }],
  location: { type: String, index: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0,0] }
  },
  temperament: [{ type: String }],
  goodWith: {
    children: { type: Boolean, default: false },
    dogs: { type: Boolean, default: false },
    cats: { type: Boolean, default: false }
  },
  activityLevel: { type: String, enum: ['low','medium','high'], default: 'medium' },
  specialNeeds: String,
  description: { type: String, required: true },
  medicalHistory: String,
  contactPhone: String,
  contactEmail: String,
  image: { type: String },
  images: [{ type: String }],
  views: { type: Number, default: 0 }
},{ timestamps: true });

// Create text index for search
petSchema.index({
  name: 'text',
  breed: 'text',
  description: 'text',
  location: 'text'
});

// Create geospatial index for location-based queries
petSchema.index({ coordinates: '2dsphere' });

// Create compound indexes for common queries
petSchema.index({ status: 1, category: 1 });
petSchema.index({ postedBy: 1, createdAt: -1 });
petSchema.index({ adoptedBy: 1, adoptedAt: -1 });

  // Add middleware to handle adoption status changes
petSchema.pre('save', function(next) {
  if (this.isModified('adoptedBy')) {
    this.adoptedAt = this.adoptedBy ? new Date() : null;
    this.status = this.adoptedBy ? 'adopted' : 'available';
  }
  next();
});

// Add reports field if it doesn't exist
if (!petSchema.obj.reports) {
  petSchema.add({
    reports: [{
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String, required: true },
      details: { type: String },
      timestamp: { type: Date, default: Date.now }
    }]
  });
}

// Make sure we have the image field for backward compatibility
if (!petSchema.obj.image) {
  petSchema.add({
    image: { 
      type: String,
      default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
    }
  });
}

// Virtual primaryImage to consistently access main photo
petSchema.virtual('primaryImage').get(function(){
  return this.image || (this.photos && this.photos[0]) || null;
});

module.exports = mongoose.model('Pet', petSchema);