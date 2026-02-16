const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'class_reminder',
      'silent_mode',
      'budget_alert',
      'habit_reminder',
      'group_notice',
      'system'
    ],
    default: 'system'
  },
  data: {
    courseId: Schema.Types.ObjectId,
    habitId: Schema.Types.ObjectId,
    noticeId: Schema.Types.ObjectId,
    groupId: Schema.Types.ObjectId,
    metadata: Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  scheduledFor: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
});

// Index for efficient queries
NotificationSchema.index({ user: 1, read: 1, sentAt: -1 });
NotificationSchema.index({ scheduledFor: 1, sent: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);