const router = require('express').Router();
const Habit = require('../models/Routine');
const auth = require('../middleware/auth');

// Get all habits
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      habits
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get today's habits
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    
    const habits = await Habit.find({
      user: req.user.id,
      $or: [
        { frequency: 'daily' },
        { frequency: 'weekly', daysOfWeek: dayOfWeek },
        { 
          frequency: 'monthly',
          $expr: { $eq: [{ $dayOfMonth: '$createdAt' }, today.getDate()] }
        }
      ]
    }).sort({ time: 1 });

    // Check completion status
    const habitsWithStatus = habits.map(habit => {
      const isCompleted = habit.completedDates.some(date => 
        date.toDateString() === today.toDateString()
      );
      return {
        ...habit.toObject(),
        isCompleted
      };
    });

    res.json({
      success: true,
      habits: habitsWithStatus,
      today: dayOfWeek
    });
  } catch (error) {
    console.error('Get today habits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add new habit
router.post('/', auth, async (req, res) => {
  try {
    const habit = new Habit({
      user: req.user.id,
      ...req.body
    });

    await habit.save();

    res.status(201).json({
      success: true,
      message: 'Habit added successfully',
      habit
    });
  } catch (error) {
    console.error('Add habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark habit as complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Check if already completed today
    const alreadyCompleted = habit.completedDates.some(date => 
      date.toDateString() === today.toDateString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Habit already completed today'
      });
    }

    // Add today's date
    habit.completedDates.push(today);
    
    // Update streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const completedYesterday = habit.completedDates.some(date => 
      date.toDateString() === yesterday.toDateString()
    );

    if (completedYesterday) {
      habit.streak += 1;
    } else {
      habit.streak = 1;
    }

    // Update longest streak
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    habit.updatedAt = new Date();
    await habit.save();

    res.json({
      success: true,
      message: 'Habit marked as complete',
      habit
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update habit
router.put('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      message: 'Habit updated successfully',
      habit
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;