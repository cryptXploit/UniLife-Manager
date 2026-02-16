const router = require('express').Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all courses for user
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get today's courses
router.get('/today', auth, async (req, res) => {
  try {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = days[new Date().getDay()];
    
    const courses = await Course.find({
      user: req.user.id,
      'schedule.day': today
    }).sort({ 'schedule.startTime': 1 });
    
    res.json({
      success: true,
      courses,
      today
    });
  } catch (error) {
    console.error('Get today courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add new course
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      code,
      professor,
      department,
      books,
      references,
      schedule,
      color,
      credits
    } = req.body;

    // Validate schedule
    if (!schedule || schedule.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one class schedule is required'
      });
    }

    const course = new Course({
      user: req.user.id,
      name,
      code,
      professor,
      department,
      books: books || [],
      references: references || [],
      schedule,
      color: color || '#4F46E5',
      credits: credits || 3
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course added successfully',
      course
    });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update course
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update course fields
    Object.keys(req.body).forEach(key => {
      course[key] = req.body[key];
    });
    
    course.updatedAt = new Date();
    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete course
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;