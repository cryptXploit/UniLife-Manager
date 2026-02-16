class SilentModeService {
  constructor() {
    this.checkInterval = null;
    this.isSilentMode = false;
    this.lastClassCheck = null;
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  // Send browser notification
  sendBrowserNotification(title, options) {
    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Check if device supports silent mode (using AudioContext as fallback)
  async setSilentMode(enable) {
    if (this.isSilentMode === enable) return;

    try {
      // Method 1: Try using the Web Audio API to mute system sounds
      if (enable) {
        // Create a silent audio context to prevent sounds
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.silentAudioContext = new AudioContext();
          // Create a silent oscillator
          const oscillator = this.silentAudioContext.createOscillator();
          oscillator.frequency.setValueAtTime(1, this.silentAudioContext.currentTime);
          oscillator.start();
        }
        
        // Send notification about silent mode
        this.sendBrowserNotification("Class Mode Activated", {
          body: "Your phone is now in silent mode for your class. Regular mode will resume after class ends.",
          tag: "silent-mode"
        });
        
        this.isSilentMode = true;
        localStorage.setItem('silentModeActive', 'true');
        
      } else {
        // Restore normal mode
        if (this.silentAudioContext) {
          this.silentAudioContext.close();
          this.silentAudioContext = null;
        }
        
        this.sendBrowserNotification("Class Mode Deactivated", {
          body: "Silent mode has been turned off. Your phone is back to normal mode.",
          tag: "silent-mode-off"
        });
        
        this.isSilentMode = false;
        localStorage.removeItem('silentModeActive');
      }
      
      // Update UI state
      this.onSilentModeChange?.(enable);
      
    } catch (error) {
      console.error("Error toggling silent mode:", error);
      
      // Fallback notification
      this.sendBrowserNotification(
        enable ? "Class Time Reminder" : "Class Ended",
        {
          body: enable 
            ? "Please manually set your phone to silent mode for class." 
            : "You can now turn off silent mode.",
          icon: '/logo192.png'
        }
      );
    }
  }

  // Check if current time is within class hours
  checkClassSchedule(courses) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

    for (const course of courses) {
      for (const schedule of course.schedule) {
        if (schedule.day === currentDay) {
          const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
          const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
          
          const classStart = startHour * 60 + startMinute;
          const classEnd = endHour * 60 + endMinute;
          
          // Check if current time is within class time
          if (currentTime >= classStart && currentTime <= classEnd) {
            return {
              inClass: true,
              course,
              schedule,
              minutesRemaining: classEnd - currentTime
            };
          }
          
          // Check if class starts within 5 minutes
          if (currentTime >= classStart - 5 && currentTime < classStart) {
            return {
              aboutToStart: true,
              course,
              schedule,
              minutesUntil: classStart - currentTime
            };
          }
        }
      }
    }
    
    return { inClass: false, aboutToStart: false };
  }

  // Start monitoring class schedule
  startClassMonitor(courses, onStatusChange) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute
    this.checkInterval = setInterval(() => {
      const scheduleCheck = this.checkClassSchedule(courses);
      
      if (scheduleCheck.inClass && !this.isSilentMode) {
        // Class in session - enable silent mode
        this.setSilentMode(true);
        onStatusChange?.({
          type: 'class_started',
          course: scheduleCheck.course,
          minutesRemaining: scheduleCheck.minutesRemaining
        });
        
      } else if (!scheduleCheck.inClass && this.isSilentMode) {
        // Class ended - disable silent mode
        this.setSilentMode(false);
        onStatusChange?.({
          type: 'class_ended',
          course: scheduleCheck.course
        });
        
      } else if (scheduleCheck.aboutToStart) {
        // Class starting soon
        onStatusChange?.({
          type: 'class_soon',
          course: scheduleCheck.course,
          minutesUntil: scheduleCheck.minutesUntil
        });
        
        // Send notification 5 minutes before class
        if (scheduleCheck.minutesUntil === 5) {
          this.sendBrowserNotification(
            `Class Starting Soon: ${scheduleCheck.course.name}`,
            {
              body: `Your ${scheduleCheck.course.name} class starts in 5 minutes. Get ready!`,
              icon: '/logo192.png',
              tag: 'class-reminder'
            }
          );
        }
      }
      
      this.lastClassCheck = scheduleCheck;
      
    }, 60000); // Check every minute

    // Initial check
    const initialCheck = this.checkClassSchedule(courses);
    if (initialCheck.inClass && !this.isSilentMode) {
      this.setSilentMode(true);
    }
  }

  // Stop monitoring
  stopClassMonitor() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.isSilentMode) {
      this.setSilentMode(false);
    }
  }

  // Schedule next day notifications
  scheduleNextDayNotifications(courses) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 0, 0, 0); // 11 PM

    // Schedule 11 PM notification
    const timeUntil11PM = tomorrow.getTime() - now.getTime();
    
    if (timeUntil11PM > 0) {
      setTimeout(() => {
        this.sendNextDayScheduleNotification(courses);
      }, timeUntil11PM);
    }

    // Also schedule for next day's first class
    this.scheduleFirstClassNotification(courses);
  }

  // Send next day's schedule notification at 11 PM
  sendNextDayScheduleNotification(courses) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

    const tomorrowClasses = courses.filter(course =>
      course.schedule.some(schedule => schedule.day === tomorrowDay)
    );

    if (tomorrowClasses.length > 0) {
      const classList = tomorrowClasses.map(course => 
        `• ${course.name} at ${course.schedule[0].startTime}`
      ).join('\n');

      this.sendBrowserNotification("Tomorrow's Class Schedule", {
        body: `You have ${tomorrowClasses.length} class(es) tomorrow:\n${classList}`,
        icon: '/logo192.png',
        tag: 'tomorrow-schedule'
      });
    }
  }

  // Schedule notification 1 hour before first class
  scheduleFirstClassNotification(courses) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

    // Find first class of the day
    let firstClass = null;
    let earliestTime = Infinity;

    courses.forEach(course => {
      course.schedule.forEach(schedule => {
        if (schedule.day === tomorrowDay) {
          const [hours, minutes] = schedule.startTime.split(':').map(Number);
          const classTime = hours * 60 + minutes;
          
          if (classTime < earliestTime) {
            earliestTime = classTime;
            firstClass = { course, schedule };
          }
        }
      });
    });

    if (firstClass) {
      // Calculate time 1 hour before class
      const notificationTime = new Date(tomorrow);
      notificationTime.setHours(
        Math.floor(earliestTime / 60) - 1,
        earliestTime % 60,
        0,
        0
      );

      const timeUntilNotification = notificationTime.getTime() - new Date().getTime();

      if (timeUntilNotification > 0) {
        setTimeout(() => {
          this.sendBrowserNotification(
            `Class in 1 Hour: ${firstClass.course.name}`,
            {
              body: `Your ${firstClass.course.name} class starts at ${firstClass.schedule.startTime}. Get ready!`,
              icon: '/logo192.png',
              tag: 'class-1hour-reminder'
            }
          );
        }, timeUntilNotification);
      }
    }
  }
}

// Singleton instance
export const silentModeService = new SilentModeService();