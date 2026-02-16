const cron = require('node-cron');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Habit = require('../models/Routine');
const notificationService = require('./notificationService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  // Initialize all scheduled jobs
  async initialize() {
    console.log('Initializing scheduler service...');

    // Schedule 11 PM daily notifications
    this.scheduleDailyNotifications();

    // Schedule hourly budget checks
    this.scheduleBudgetChecks();

    // Schedule class reminders
    this.scheduleClassReminders();

    // Schedule habit reminders
    this.scheduleHabitReminders();
  }

  // Schedule daily 11 PM notifications
  scheduleDailyNotifications() {
    // Run at 11 PM every day
    const job = cron.schedule('0 23 * * *', async () => {
      console.log('Running daily 11 PM notifications...');
      await this.sendNextDayClassReminders();
    });

    this.jobs.set('daily_notifications', job);
  }

  // Schedule hourly budget checks
  scheduleBudgetChecks() {
    // Run every hour
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Running hourly budget checks...');
      await this.checkUserBudgets();
    });

    this.jobs.set('budget_checks', job);
  }

  // Schedule class reminders
  scheduleClassReminders() {
    // Check every 5 minutes for upcoming classes
    const job = cron.schedule('*/5 * * * *', async () => {
      await this.checkUpcomingClasses();
    });

    this.jobs.set('class_reminders', job);
  }

  // Schedule habit reminders
  scheduleHabitReminders() {
    // Check every minute for habit reminders
    const job = cron.schedule('* * * * *', async () => {
      await this.checkHabitReminders();
    });

    this.jobs.set('habit_reminders', job);
  }

  // Send next day class reminders at 11 PM
  async sendNextDayClassReminders() {
    try {
      const users = await User.find({});
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

      for (const user of users) {
        const courses = await Course.find({ 
          user: user._id,
          'schedule.day': tomorrowDay 
        });

        if (courses.length > 0) {
          const classList = courses.map(course => 
            `• ${course.name} at ${course.schedule.find(s => s.day === tomorrowDay).startTime}`
          ).join('\n');

          await notificationService.sendUserNotification(user._id, {
            title: "Tomorrow's Class Schedule",
            message: `You have ${courses.length} class(es) tomorrow:\n${classList}`,
            type: 'class_reminder',
            priority: 'medium'
          });
        }
      }
    } catch (error) {
      console.error('Error sending next day reminders:', error);
    }
  }

  // Check user budgets hourly
  async checkUserBudgets() {
    try {
      const users = await User.find({});
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      for (const user of users) {
        const budget = await Budget.findOne({
          user: user._id,
          month,
          year
        });

        if (budget) {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          const expenses = await Expense.find({
            user: user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
          });

          const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
          const percentage = (totalSpent / budget.totalBudget) * 100;

          // Send notification if over 80%
          if (percentage >= 80) {
            await notificationService.sendBudgetAlert(user._id, {
              spent: totalSpent,
              total: budget.totalBudget,
              percentage
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking budgets:', error);
    }
  }

  // Check for upcoming classes
  async checkUpcomingClasses() {
    try {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // Find classes starting in the next 60 minutes
      const courses = await Course.find({
        'schedule.day': currentDay
      }).populate('user');

      for (const course of courses) {
        for (const schedule of course.schedule) {
          if (schedule.day === currentDay) {
            const [hours, minutes] = schedule.startTime.split(':').map(Number);
            const classStart = hours * 60 + minutes;
            
            // Check if class starts in exactly 60 minutes
            if (classStart - currentTime === 60) {
              await notificationService.sendClassReminder(course.user._id, {
                _id: course._id,
                name: course.name,
                startTime: schedule.startTime,
                room: schedule.room
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking upcoming classes:', error);
    }
  }

  // Check for habit reminders
  async checkHabitReminders() {
    try {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // Find habits due in the next 30 minutes
      const habits = await Habit.find({
        $or: [
          { frequency: 'daily' },
          { frequency: 'weekly', daysOfWeek: currentDay }
        ],
        'reminders.enabled': true
      }).populate('user');

      for (const habit of habits) {
        if (habit.time) {
          const [hours, minutes] = habit.time.split(':').map(Number);
          const habitTime = hours * 60 + minutes;
          
          // Check if habit is due in 25-30 minutes (for reminder)
          const timeUntilHabit = habitTime - currentTime;
          if (timeUntilHabit >= 25 && timeUntilHabit <= 30) {
            await notificationService.sendHabitReminder(habit.user._id, {
              _id: habit._id,
              title: habit.title
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking habit reminders:', error);
    }
  }

  // Stop all scheduled jobs
  stopAll() {
    this.jobs.forEach(job => job.stop());
    this.jobs.clear();
  }
}

module.exports = new SchedulerService();