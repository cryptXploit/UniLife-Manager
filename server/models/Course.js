const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassScheduleSchema = new Schema({
  day: {
    type: String,
    enum: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  room: String
});

const CourseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  professor: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  books: [{
    name: String,
    author: String,
    edition: String
  }],
  references: [String],
  schedule: [ClassScheduleSchema],
  color: {
    type: String,
    default: '#4F46E5'
  },
  credits: {
    type: Number,
    min: 1,
    max: 5
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

// Index for faster queries
CourseSchema.index({ user: 1, department: 1 });

module.exports = mongoose.model('Course', CourseSchema);