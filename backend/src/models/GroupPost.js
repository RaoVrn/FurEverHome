const mongoose = require('mongoose');

const groupPostSchema = new mongoose.Schema({
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true,
    index: true
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: {
    type: String,
    enum: ['text', 'pet-share', 'adoption-success', 'help-request', 'event', 'resource'],
    default: 'text',
    index: true
  },
  title: { 
    type: String, 
    trim: true,
    maxLength: 200
  },
  content: { 
    type: String, 
    required: true,
    maxLength: 2000
  },
  images: [{ type: String }],
  videos: [{ type: String }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  relatedPet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet' 
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  tags: [{ type: String, lowercase: true }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  eventDetails: {
    date: Date,
    time: String,
    venue: String,
    registrationRequired: { type: Boolean, default: false },
    maxAttendees: Number,
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  helpRequest: {
    helpType: {
      type: String,
      enum: ['medical', 'transport', 'foster', 'donation', 'volunteer', 'other']
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    isResolved: { type: Boolean, default: false },
    deadline: Date
  },
  likes: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxLength: 500 },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true, maxLength: 300 },
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  shares: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedTo: {
      type: String,
      enum: ['profile', 'group', 'external']
    },
    targetGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    createdAt: { type: Date, default: Date.now }
  }],
  visibility: {
    type: String,
    enum: ['public', 'members-only', 'admins-only'],
    default: 'members-only'
  },
  status: {
    type: String,
    enum: ['active', 'pending-approval', 'archived', 'removed'],
    default: 'active',
    index: true
  },
  isPinned: { type: Boolean, default: false },
  isAnnouncement: { type: Boolean, default: false },
  moderationFlags: [{
    flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    flaggedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }
  }],
  engagement: {
    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Indexes for better performance
groupPostSchema.index({ group: 1, createdAt: -1 });
groupPostSchema.index({ author: 1, createdAt: -1 });
groupPostSchema.index({ type: 1, priority: 1 });
groupPostSchema.index({ status: 1, isPinned: -1 });
groupPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Pre-save middleware to update engagement counts
groupPostSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.engagement.likesCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.engagement.commentsCount = this.comments.length;
  }
  if (this.isModified('shares')) {
    this.engagement.sharesCount = this.shares.length;
  }
  next();
});

module.exports = mongoose.model('GroupPost', groupPostSchema);
