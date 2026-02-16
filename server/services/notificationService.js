const Notification = require('../models/Notification');
const Group = require('../models/Group');
const User = require('../models/User');

class NotificationService {
  // Send notification to a single user
  async sendUserNotification(userId, notificationData) {
    try {
      const notification = new Notification({
        user: userId,
        ...notificationData,
        sentAt: new Date()
      });
      
      await notification.save();
      
      // TODO: Implement WebSocket or push notification here
      // For now, we'll just store it in DB
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send notification to all group members
  async sendGroupNotification(groupId, notificationData, excludeUserId = null) {
    try {
      const group = await Group.findById(groupId).populate('members.user');
      
      if (!group) {
        throw new Error('Group not found');
      }

      const notifications = [];
      
      for (const member of group.members) {
        // Skip excluded user
        if (excludeUserId && member.user._id.toString() === excludeUserId) {
          continue;
        }

        const notification = new Notification({
          user: member.user._id,
          ...notificationData,
          data: {
            ...notificationData.data,
            groupId
          }
        });
        
        notifications.push(notification.save());
      }

      await Promise.all(notifications);
      
      // TODO: Send real-time updates via WebSocket
      
      return notifications.length;
    } catch (error) {
      console.error('Error sending group notification:', error);
      throw error;
    }
  }

  // Send class reminder notifications
  async sendClassReminder(userId, courseData) {
    const notification = {
      title: `Class Reminder: ${courseData.name}`,
      message: `Your ${courseData.name} class starts at ${courseData.startTime} in room ${courseData.room}`,
      type: 'class_reminder',
      data: {
        courseId: courseData._id,
        startTime: courseData.startTime,
        room: courseData.room
      },
      priority: 'high'
    };

    return this.sendUserNotification(userId, notification);
  }

  // Send budget alert
  async sendBudgetAlert(userId, budgetData) {
    const percentage = (budgetData.spent / budgetData.total) * 100;
    
    let title, message;
    if (percentage >= 95) {
      title = '⚠️ Budget Exceeded!';
      message = `You've spent ${percentage.toFixed(1)}% of your monthly budget ($${budgetData.spent} of $${budgetData.total}).`;
    } else if (percentage >= 80) {
      title = '💰 Budget Warning';
      message = `You've spent ${percentage.toFixed(1)}% of your monthly budget. Consider slowing down.`;
    } else {
      return null;
    }

    const notification = {
      title,
      message,
      type: 'budget_alert',
      data: {
        spent: budgetData.spent,
        total: budgetData.total,
        percentage
      },
      priority: percentage >= 95 ? 'urgent' : 'high'
    };

    return this.sendUserNotification(userId, notification);
  }

  // Send habit reminder
  async sendHabitReminder(userId, habitData) {
    const notification = {
      title: '🏃 Habit Reminder',
      message: `Time for: ${habitData.title}`,
      type: 'habit_reminder',
      data: {
        habitId: habitData._id,
        title: habitData.title
      },
      priority: 'medium'
    };

    return this.sendUserNotification(userId, notification);
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    return Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 20, skip = 0) {
    return Notification.find({ user: userId })
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  // Get unread count
  async getUnreadCount(userId) {
    return Notification.countDocuments({ 
      user: userId, 
      read: false 
    });
  }
}

module.exports = new NotificationService();