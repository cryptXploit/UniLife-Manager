const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HabitSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  daysOfWeek: [{
    type: String,
    enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  }],
  time: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number, // in minutes
    min: 1
  },
  category: {
    type: String,
    enum: ['study', 'exercise', 'health', 'work', 'leisure', 'other'],
    default: 'other'
  },
  color: {
    type: String,
    default: '#10B981'
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  completedDates: [Date],
  reminders: {
    enabled: Boolean,
    times: [String]
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

// Index for date queries
HabitSchema.index({ user: 1, 'completedDates': 1 });

module.exports = mongoose.model('Habit', HabitSchema);