import { expenseAPI } from './api';

class ExpenseMonitorService {
  constructor() {
    this.monthlyLimit = 0;
    this.currentSpent = 0;
    this.notificationThreshold = 0.8; // 80% of budget
    this.hasSentWarning = false;
  }

  // Initialize with user's budget
  async initialize() {
    try {
      const response = await expenseAPI.getCurrentBudget();
      if (response.data.success && response.data.budget) {
        this.monthlyLimit = response.data.budget.totalBudget;
        this.currentSpent = response.data.totalSpent;
        this.startMonitoring();
      }
    } catch (error) {
      console.error('Failed to initialize expense monitor:', error);
    }
  }

  // Start monitoring expenses
  startMonitoring() {
    // Check every hour
    this.checkInterval = setInterval(() => {
      this.checkExpenseStatus();
    }, 60 * 60 * 1000); // 1 hour

    // Initial check
    this.checkExpenseStatus();
  }

  // Check if expenses are approaching limit
  async checkExpenseStatus() {
    try {
      const response = await expenseAPI.getCurrentBudget();
      if (response.data.success) {
        const { totalSpent, budget } = response.data;
        
        if (budget && budget.totalBudget > 0) {
          const percentageSpent = (totalSpent / budget.totalBudget) * 100;
          
          // Send warning at 80%
          if (percentageSpent >= 80 && !this.hasSentWarning) {
            this.sendExpenseWarning(percentageSpent, totalSpent, budget.totalBudget);
            this.hasSentWarning = true;
          }
          
          // Reset warning flag if below 70%
          if (percentageSpent < 70) {
            this.hasSentWarning = false;
          }
          
          // Send alert at 95%
          if (percentageSpent >= 95) {
            this.sendExpenseAlert(percentageSpent, totalSpent, budget.totalBudget);
          }
          
          this.currentSpent = totalSpent;
        }
      }
    } catch (error) {
      console.error('Error checking expense status:', error);
    }
  }

  // Send warning notification
  sendExpenseWarning(percentage, spent, limit) {
    if (Notification.permission === 'granted') {
      new Notification("💰 Budget Warning", {
        body: `You've spent ${percentage.toFixed(1)}% of your monthly budget ($${spent.toFixed(2)} of $${limit.toFixed(2)}). Consider slowing down your spending.`,
        icon: '/logo192.png',
        tag: 'budget-warning'
      });
    }
  }

  // Send alert notification
  sendExpenseAlert(percentage, spent, limit) {
    if (Notification.permission === 'granted') {
      new Notification("⚠️ Budget Alert", {
        body: `You've spent ${percentage.toFixed(1)}% of your monthly budget ($${spent.toFixed(2)} of $${limit.toFixed(2)}). You're close to exceeding your budget!`,
        icon: '/logo192.png',
        tag: 'budget-alert'
      });
    }
  }

  // Update after new expense
  onNewExpense(amount) {
    this.currentSpent += amount;
    this.checkExpenseStatus();
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

export const expenseMonitor = new ExpenseMonitorService();