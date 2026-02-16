const router = require('express').Router();
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// Get current month's expenses
router.get('/current-month', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: -1 });

    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add expense
router.post('/', auth, async (req, res) => {
  try {
    const expense = new Expense({
      user: req.user.id,
      ...req.body
    });

    await expense.save();

    // Update budget if exists
    const expenseDate = new Date(req.body.date || Date.now());
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    const budget = await Budget.findOne({
      user: req.user.id,
      month,
      year
    });

    if (budget) {
      budget.remaining -= expense.amount;
      
      // Update category spent
      const category = budget.categories.find(c => c.category === req.body.category);
      if (category) {
        category.spent += expense.amount;
      }
      
      budget.updatedAt = new Date();
      await budget.save();
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Set/Update budget
router.post('/budget', auth, async (req, res) => {
  try {
    const { month, year, totalBudget, categories, dailyLimit } = req.body;
    
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    let budget = await Budget.findOne({
      user: req.user.id,
      month: currentMonth,
      year: currentYear
    });

    if (budget) {
      // Update existing budget
      budget.totalBudget = totalBudget;
      budget.categories = categories;
      budget.dailyLimit = dailyLimit;
      budget.remaining = totalBudget - budget.totalBudget + budget.remaining;
      budget.updatedAt = new Date();
    } else {
      // Create new budget
      budget = new Budget({
        user: req.user.id,
        month: currentMonth,
        year: currentYear,
        totalBudget,
        categories,
        dailyLimit,
        remaining: totalBudget
      });
    }

    await budget.save();

    res.json({
      success: true,
      message: 'Budget set successfully',
      budget
    });
  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current budget
router.get('/budget/current', auth, async (req, res) => {
  try {
    const now = new Date();
    const budget = await Budget.findOne({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    // Calculate total spent this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({
      success: true,
      budget,
      totalSpent,
      remaining: budget ? budget.remaining : 0
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update budget
    const expenseDate = new Date(expense.date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    const budget = await Budget.findOne({
      user: req.user.id,
      month,
      year
    });

    if (budget) {
      budget.remaining += expense.amount;
      
      const category = budget.categories.find(c => c.category === expense.category);
      if (category) {
        category.spent = Math.max(0, category.spent - expense.amount);
      }
      
      budget.updatedAt = new Date();
      await budget.save();
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;