const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused', 'cancelled'],
    default: 'present'
  },
  markedBy: {
    type: String,
    enum: ['self', 'teacher', 'system'],
    default: 'self'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique attendance per course per day per user
AttendanceSchema.index({ user: 1, course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);