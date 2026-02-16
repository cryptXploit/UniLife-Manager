const router = require('express').Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const GroupRequest = require('../models/GroupRequest');

// Create Group
router.post('/create', auth, async (req, res) => {
  try {
    const { name, description, pin, requestedRole } = req.body;
    const userId = req.user.id;

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'Group name already exists'
      });
    }

    // Create group
    const group = new Group({
      name,
      description,
      pin,
      createdBy: userId,
      members: [{
        user: userId,
        role: requestedRole === 'teacher' ? 'teacher' : 'admin',
        joinedAt: new Date()
      }]
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        role: requestedRole === 'teacher' ? 'teacher' : 'admin'
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Join Group Request
router.post('/join-request', auth, async (req, res) => {
  try {
    const { groupName, pin, requestedRole } = req.body;
    const userId = req.user.id;

    // Find group
    const group = await Group.findOne({ name: groupName, pin });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or invalid PIN'
      });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === userId
    );
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Check if request already exists
    const existingRequest = await GroupRequest.findOne({
      user: userId,
      group: group._id,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this group'
      });
    }

    // Create join request
    const groupRequest = new GroupRequest({
      user: userId,
      group: group._id,
      requestedRole,
      status: 'pending'
    });

    await groupRequest.save();

    res.json({
      success: true,
      message: 'Join request sent successfully',
      requestId: groupRequest._id
    });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get My Groups
router.get('/my-groups', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user.id
    }).populate('members.user', 'name email');

    res.json({
      success: true,
      groups: groups.map(group => ({
        id: group._id,
        name: group.name,
        description: group.description,
        role: group.members.find(m => m.user._id.toString() === req.user.id).role,
        totalMembers: group.members.length,
        createdBy: group.createdBy
      }))
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get Pending Requests (for admins)
router.get('/:groupId/requests', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    // Check if user is admin/teacher in this group
    const userRole = group.members.find(m => 
      m.user.toString() === req.user.id
    )?.role;

    if (!['admin', 'teacher'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin/Teacher privileges required'
      });
    }

    const requests = await GroupRequest.find({
      group: req.params.groupId,
      status: 'pending'
    }).populate('user', 'name email');

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Approve/Reject Request
router.post('/requests/:requestId/review', auth, async (req, res) => {
  try {
    const { action, reviewNotes } = req.body;
    const requestId = req.params.requestId;

    const groupRequest = await GroupRequest.findById(requestId)
      .populate('group')
      .populate('user');

    if (!groupRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user is admin/teacher in the group
    const group = groupRequest.group;
    const userRole = group.members.find(m => 
      m.user.toString() === req.user.id
    )?.role;

    if (!['admin', 'teacher'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (action === 'approve') {
      // Add user to group
      group.members.push({
        user: groupRequest.user._id,
        role: groupRequest.requestedRole === 'cr' ? 'admin' : groupRequest.requestedRole,
        joinedAt: new Date()
      });
      await group.save();

      groupRequest.status = 'approved';
      groupRequest.reviewedBy = req.user.id;
      groupRequest.reviewNotes = reviewNotes;
      await groupRequest.save();

      res.json({
        success: true,
        message: 'Request approved successfully'
      });
    } else if (action === 'reject') {
      groupRequest.status = 'rejected';
      groupRequest.reviewedBy = req.user.id;
      groupRequest.reviewNotes = reviewNotes;
      await groupRequest.save();

      res.json({
        success: true,
        message: 'Request rejected'
      });
    }
  } catch (error) {
    console.error('Review request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;