const router = require('express').Router();
const Course = require('../models/Course');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Habit = require('../models/Routine');
const Attendance = require('../models/Attendance');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// Get dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

    // 1. Today's courses
    const todayCourses = await Course.find({
      user: req.user.id,
      'schedule.day': dayOfWeek
    }).sort({ 'schedule.startTime': 1 });

    // 2. Budget overview
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const budget = await Budget.findOne({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const dailySpent = expenses
      .filter(e => e.date.toDateString() === now.toDateString())
      .reduce((sum, expense) => sum + expense.amount, 0);

    // 3. Today's habits
    const habits = await Habit.find({
      user: req.user.id,
      $or: [
        { frequency: 'daily' },
        { frequency: 'weekly', daysOfWeek: dayOfWeek },
        { 
          frequency: 'monthly',
          $expr: { $eq: [{ $dayOfMonth: '$createdAt' }, now.getDate()] }
        }
      ]
    }).sort({ time: 1 });

    const habitsWithStatus = habits.map(habit => {
      const isCompleted = habit.completedDates.some(date => 
        date.toDateString() === now.toDateString()
      );
      return {
        ...habit.toObject(),
        isCompleted
      };
    });

    // 4. Today's attendance
    const attendance = await Attendance.find({
      user: req.user.id,
      date: { $gte: new Date(today) }
    }).populate('course', 'name color');

    // 5. Recent notes
    const recentNotes = await Note.find({
      user: req.user.id
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('course', 'name');

    // 6. Upcoming assignments (simplified for now)
    const upcomingAssignments = [];

    res.json({
      success: true,
      dashboard: {
        date: now,
        todayCourses,
        budget: {
          total: budget?.totalBudget || 0,
          spent: totalSpent,
          remaining: budget ? budget.remaining : 0,
          dailySpent,
          dailyLimit: budget?.dailyLimit || 0
        },
        habits: habitsWithStatus,
        attendance,
        recentNotes,
        upcomingAssignments
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark attendance
router.post('/attendance', auth, async (req, res) => {
  try {
    const { courseId, date, status, notes } = req.body;
    
    const attendance = await Attendance.findOneAndUpdate(
      {
        user: req.user.id,
        course: courseId,
        date: new Date(date)
      },
      {
        status,
        notes,
        markedBy: 'self'
      },
      {
        new: true,
        upsert: true
      }
    ).populate('course', 'name');

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 1. Course Statistics
    const courses = await Course.find({ user: req.user.id });
    
    const courseStats = await Promise.all(courses.map(async (course) => {
      const attendance = await Attendance.find({
        user: req.user.id,
        course: course._id,
        date: { $gte: startOfMonth }
      });
      
      const totalClasses = attendance.length;
      const presentClasses = attendance.filter(a => a.status === 'present').length;
      const attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses * 100) : 0;
      
      const notes = await Note.find({
        user: req.user.id,
        course: course._id
      });
      
      return {
        course: course.name,
        color: course.color,
        totalClasses,
        presentClasses,
        attendanceRate: attendanceRate.toFixed(1),
        totalNotes: notes.length
      };
    }));

    // 2. Habit Statistics
    const habits = await Habit.find({ user: req.user.id });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const habitStats = await Promise.all(habits.map(async (habit) => {
      const recentCompletions = habit.completedDates.filter(date => 
        date >= thirtyDaysAgo
      );
      
      const completionRate = habits.length > 0 ? 
        (recentCompletions.length / 30 * 100) : 0;
      
      return {
        name: habit.title,
        streak: habit.streak,
        longestStreak: habit.longestStreak,
        completionRate: completionRate.toFixed(1),
        recentCompletions: recentCompletions.length
      };
    }));

    // 3. Expense Statistics
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth }
    });

    const expenseByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // 4. Note Statistics
    const notes = await Note.find({ user: req.user.id });
    const notesByCourse = notes.reduce((acc, note) => {
      const courseName = note.course ? 'With Course' : 'General';
      acc[courseName] = (acc[courseName] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      statistics: {
        courseStats,
        habitStats,
        expenseStats: {
          total: totalExpenses,
          byCategory: expenseByCategory,
          dailyAverage: (totalExpenses / now.getDate()).toFixed(2)
        },
        noteStats: {
          total: notes.length,
          byCourse: notesByCourse,
          pinned: notes.filter(n => n.isPinned).length
        }
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;