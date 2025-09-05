const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  adoptedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  postedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  loginHistory: [
    {
      time: { type: Date, default: Date.now },
      ip: { type: String }
    }
  ],
  loginCount: { type: Number, default: 0 },
  lastLogin: { type: Date },
  avatar: { type: String }, // URL for profile picture
  isActive: { type: Boolean, default: true },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    adoptionUpdates: { type: Boolean, default: true },
    newMessages: { type: Boolean, default: true },
    communityUpdates: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
