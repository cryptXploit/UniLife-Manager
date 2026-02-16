const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'accommodation', 'books', 'entertainment', 'shopping', 'education', 'health', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile', 'online'],
    default: 'cash'
  },
  recurring: {
    isRecurring: Boolean,
    frequency: String, // daily, weekly, monthly
    nextDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for monthly reports
ExpenseSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);