import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, setBudget, addExpense } from '../features/cost/expenseSlice';
import BudgetSetup from '../components/cost/BudgetSetup';
import ExpenseTracker from '../components/cost/ExpenseTracker';
import ExpenseForm from '../components/cost/ExpenseForm';
import './Pages.css';

const CostPage = () => {
  const dispatch = useDispatch();
  const { expenses, budget, totalSpent, remaining, loading } = useSelector(state => state.expenses);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleSetBudget = async (budgetData) => {
    await dispatch(setBudget(budgetData));
    setShowBudgetForm(false);
  };

  const handleAddExpense = async (expenseData) => {
    await dispatch(addExpense(expenseData));
    setShowExpenseForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading expense data...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Expense Tracker</h1>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setShowBudgetForm(true)}
          >
            {budget ? 'Update Budget' : 'Set Budget'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowExpenseForm(true)}
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="budget-overview">
        <div className="budget-card">
          <h3>Monthly Budget</h3>
          <div className="budget-amount">
            {budget ? formatCurrency(budget.totalBudget) : 'Not Set'}
          </div>
          {budget && (
            <div className="budget-details">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(totalSpent / budget.totalBudget) * 100}%` }}
                ></div>
              </div>
              <div className="budget-stats">
                <div className="stat">
                  <span className="label">Spent:</span>
                  <span className="value spent">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="stat">
                  <span className="label">Remaining:</span>
                  <span className="value remaining">{formatCurrency(remaining)}</span>
                </div>
                <div className="stat">
                  <span className="label">Daily Limit:</span>
                  <span className="value">{formatCurrency(budget.dailyLimit || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBudgetForm && (
        <div className="form-modal">
          <BudgetSetup
            initialData={budget}
            onSubmit={handleSetBudget}
            onCancel={() => setShowBudgetForm(false)}
          />
        </div>
      )}

      {showExpenseForm && (
        <div className="form-modal">
          <ExpenseForm
            onSubmit={handleAddExpense}
            onCancel={() => setShowExpenseForm(false)}
          />
        </div>
      )}

      <div className="expense-section">
        <h2>Recent Expenses</h2>
        <ExpenseTracker expenses={expenses} />
      </div>
    </div>
  );
};

export default CostPage;