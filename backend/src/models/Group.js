const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxLength: 100
  },
  description: { 
    type: String, 
    required: true,
    maxLength: 500
  },
  type: { 
    type: String, 
    enum: ['individual', 'community', 'ngo', 'shelter', 'rescue'], 
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['general', 'adoption', 'rescue', 'training', 'health', 'breed-specific', 'local'],
    default: 'general',
    index: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  avatar: { type: String }, // Group profile picture
  coverImage: { type: String }, // Group cover image
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  admins: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  moderators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  members: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
    status: { type: String, enum: ['active', 'pending', 'banned'], default: 'active' }
  }],
  memberCount: { type: Number, default: 0 },
  tags: [{ type: String, lowercase: true }],
  rules: [{ 
    title: String,
    description: String
  }],
  settings: {
    allowMemberPosts: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowInvites: { type: Boolean, default: true },
    allowFileUploads: { type: Boolean, default: true },
    maxMembersLimit: { type: Number, default: 0 } // 0 means no limit
  },
  stats: {
    totalPosts: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 0 },
    totalPetsHelped: { type: Number, default: 0 },
    successfulAdoptions: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false }, // For verified NGOs/organizations
  contactInfo: {
    email: String,
    phone: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  }
}, { timestamps: true });

// Indexes for better performance
groupSchema.index({ type: 1, category: 1 });
groupSchema.index({ 'location.city': 1, 'location.state': 1 });
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });
groupSchema.index({ memberCount: -1 });
groupSchema.index({ createdAt: -1 });

// Virtual for member count
groupSchema.virtual('activeMemberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Pre-save middleware to update member count
groupSchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.memberCount = this.members.filter(member => member.status === 'active').length;
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);
