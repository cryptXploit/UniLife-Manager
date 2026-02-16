const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  categories: [{
    category: String,
    limit: Number,
    spent: {
      type: Number,
      default: 0
    }
  }],
  dailyLimit: Number,
  remaining: {
    type: Number,
    default: function() {
      return this.totalBudget;
    }
  },
  notifications: {
    threshold: Number, // percentage
    enabled: Boolean
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

// Ensure unique budget per month per user
BudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);