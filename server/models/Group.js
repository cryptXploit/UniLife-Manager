const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  pin: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 6
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['member', 'admin', 'teacher'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowRequests: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 100 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster search
GroupSchema.index({ name: 1, pin: 1 });

module.exports = mongoose.model('Group', GroupSchema);