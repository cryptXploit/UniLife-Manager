import { silentModeService } from './silentModeService';
import { expenseMonitor } from './expenseMonitor';
import { habitReminder } from './habitReminder';
import { coursesAPI } from './api';

class BackgroundTaskManager {
  constructor() {
    this.initialized = false;
  }

  // Initialize all background services
  async initialize() {
    if (this.initialized) return;

    try {
      // Request notification permission
      await silentModeService.requestNotificationPermission();

      // Load user courses for silent mode monitoring
      const coursesResponse = await coursesAPI.getCourses();
      if (coursesResponse.data.success) {
        silentModeService.startClassMonitor(coursesResponse.data.courses);
        
        // Schedule next day notifications
        silentModeService.scheduleNextDayNotifications(coursesResponse.data.courses);
      }

      // Initialize expense monitoring
      await expenseMonitor.initialize();

      // Initialize habit reminders
      await habitReminder.loadHabits();

      this.initialized = true;
      console.log('Background tasks initialized successfully');
    } catch (error) {
      console.error('Failed to initialize background tasks:', error);
    }
  }

  // Update when new course is added
  async onCourseAdded(course) {
    // Reload courses for silent mode service
    const coursesResponse = await coursesAPI.getCourses();
    if (coursesResponse.data.success) {
      silentModeService.stopClassMonitor();
      silentModeService.startClassMonitor(coursesResponse.data.courses);
    }
  }

  // Update when new habit is added
  onHabitAdded(habit) {
    habitReminder.addHabit(habit);
  }

  // Update when habit is updated
  onHabitUpdated(habit) {
    habitReminder.updateHabit(habit);
  }

  // Update when habit is removed
  onHabitRemoved(habitId) {
    habitReminder.removeHabit(habitId);
  }

  // Update when new expense is added
  onExpenseAdded(amount) {
    expenseMonitor.onNewExpense(amount);
  }

  // Stop all background services
  stop() {
    silentModeService.stopClassMonitor();
    expenseMonitor.stopMonitoring();
    habitReminder.stop();
    this.initialized = false;
  }
}

// Singleton instance
export const backgroundTaskManager = new BackgroundTaskManager();