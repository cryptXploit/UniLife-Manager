import { routineAPI } from './api';

class HabitReminderService {
  constructor() {
    this.habits = [];
    this.reminderTimers = new Map();
  }

  // Load user's habits and schedule reminders
  async loadHabits() {
    try {
      const response = await routineAPI.getHabits();
      if (response.data.success) {
        this.habits = response.data.habits;
        this.scheduleAllReminders();
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
    }
  }

  // Schedule reminders for all habits
  scheduleAllReminders() {
    // Clear existing timers
    this.clearAllReminders();

    const now = new Date();
    
    this.habits.forEach(habit => {
      if (habit.reminders?.enabled && habit.time) {
        this.scheduleHabitReminder(habit, now);
      }
    });
  }

  // Schedule reminder for a specific habit
  scheduleHabitReminder(habit, referenceDate = new Date()) {
    if (!habit.time) return;

    const [hours, minutes] = habit.time.split(':').map(Number);
    let reminderTime = new Date(referenceDate);
    
    // Set reminder time (20-30 minutes before habit time)
    reminderTime.setHours(hours, minutes - 25, 0, 0); // 25 minutes before

    // If reminder time has already passed today, schedule for next occurrence
    if (reminderTime < referenceDate) {
      if (habit.frequency === 'daily') {
        reminderTime.setDate(reminderTime.getDate() + 1);
      } else if (habit.frequency === 'weekly') {
        reminderTime.setDate(reminderTime.getDate() + 7);
      } else {
        return; // Don't schedule for monthly habits if missed
      }
    }

    const timeUntilReminder = reminderTime.getTime() - referenceDate.getTime();

    if (timeUntilReminder > 0) {
      const timerId = setTimeout(() => {
        this.sendHabitReminder(habit);
        
        // Reschedule for next occurrence
        this.scheduleHabitReminder(habit, reminderTime);
      }, timeUntilReminder);

      this.reminderTimers.set(habit._id, timerId);
    }
  }

  // Send habit reminder notification
  sendHabitReminder(habit) {
    if (Notification.permission === 'granted') {
      let body = '';
      
      switch (habit.frequency) {
        case 'daily':
          body = `Time for your daily habit: ${habit.title}`;
          break;
        case 'weekly':
          body = `Time for your weekly habit: ${habit.title}`;
          break;
        default:
          body = `Time for your habit: ${habit.title}`;
      }

      if (habit.description) {
        body += `\n${habit.description}`;
      }

      new Notification("🏃 Habit Reminder", {
        body,
        icon: '/logo192.png',
        tag: `habit-${habit._id}`,
        requireInteraction: true // Keeps notification visible until dismissed
      });
    }
  }

  // Clear all scheduled reminders
  clearAllReminders() {
    this.reminderTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.reminderTimers.clear();
  }

  // Add new habit and schedule reminder
  addHabit(habit) {
    this.habits.push(habit);
    if (habit.reminders?.enabled && habit.time) {
      this.scheduleHabitReminder(habit);
    }
  }

  // Update habit and reschedule reminder
  updateHabit(updatedHabit) {
    const index = this.habits.findIndex(h => h._id === updatedHabit._id);
    if (index !== -1) {
      // Clear existing reminder
      const oldTimerId = this.reminderTimers.get(updatedHabit._id);
      if (oldTimerId) {
        clearTimeout(oldTimerId);
        this.reminderTimers.delete(updatedHabit._id);
      }
      
      // Update habit and schedule new reminder
      this.habits[index] = updatedHabit;
      if (updatedHabit.reminders?.enabled && updatedHabit.time) {
        this.scheduleHabitReminder(updatedHabit);
      }
    }
  }

  // Remove habit and cancel reminder
  removeHabit(habitId) {
    const timerId = this.reminderTimers.get(habitId);
    if (timerId) {
      clearTimeout(timerId);
      this.reminderTimers.delete(habitId);
    }
    this.habits = this.habits.filter(h => h._id !== habitId);
  }

  // Stop all reminders
  stop() {
    this.clearAllReminders();
  }
}

export const habitReminder = new HabitReminderService();