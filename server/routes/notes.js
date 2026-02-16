const router = require('express').Router();
const Note = require('../models/Note');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all notes (private + shared)
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id },
        { isPublic: true }
      ]
    })
    .populate('course', 'name code')
    .sort({ isPinned: -1, updatedAt: -1 });

    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get notes by course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    // Check if user has access to the course
    const course = await Course.findOne({
      _id: req.params.courseId,
      user: req.user.id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or access denied'
      });
    }

    const notes = await Note.find({
      course: req.params.courseId,
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Get course notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add new note
router.post('/', auth, async (req, res) => {
  try {
    const note = new Note({
      user: req.user.id,
      ...req.body
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    Object.keys(req.body).forEach(key => {
      note[key] = req.body[key];
    });
    
    note.updatedAt = new Date();
    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Share note
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { userIds, makePublic } = req.body;
    
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (makePublic) {
      note.isPublic = true;
      note.sharedWith = [];
    } else if (userIds && userIds.length > 0) {
      note.isPublic = false;
      note.sharedWith = userIds;
    }

    note.updatedAt = new Date();
    await note.save();

    res.json({
      success: true,
      message: 'Note shared successfully',
      note
    });
  } catch (error) {
    console.error('Share note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;