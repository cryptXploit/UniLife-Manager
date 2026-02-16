import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHabits, completeHabit, addHabit } from '../features/routine/habitSlice';
import HabitForm from '../components/routine/HabitForm';
import HabitTracker from '../components/routine/HabitTracker';
import './Pages.css';

const RoutinePage = () => {
  const dispatch = useDispatch();
  const { habits, todayHabits, loading } = useSelector(state => state.routine);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  const handleComplete = async (habitId) => {
    await dispatch(completeHabit(habitId));
  };

  const handleAddHabit = async (habitData) => {
    await dispatch(addHabit(habitData));
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading habits...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Habit & Routine Tracker</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New Habit
        </button>
      </div>

      {showForm ? (
        <div className="form-container">
          <HabitForm
            onSubmit={handleAddHabit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <>
          <div className="today-habits">
            <h2>Today's Habits</h2>
            {todayHabits.length === 0 ? (
              <p>No habits scheduled for today. Add some habits to get started!</p>
            ) : (
              <div className="habits-list">
                {todayHabits.map(habit => (
                  <div key={habit._id} className="habit-item">
                    <div className="habit-info">
                      <h3>{habit.title}</h3>
                      <p>{habit.description}</p>
                      <span className="habit-time">{habit.time}</span>
                      <span className={`habit-category ${habit.category}`}>
                        {habit.category}
                      </span>
                    </div>
                    <div className="habit-actions">
                      <button
                        className={`btn ${habit.isCompleted ? 'btn-success' : 'btn-outline'}`}
                        onClick={() => handleComplete(habit._id)}
                        disabled={habit.isCompleted}
                      >
                        {habit.isCompleted ? 'Completed ✓' : 'Mark Complete'}
                      </button>
                      <span className="streak">🔥 {habit.streak} day streak</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="all-habits">
            <h2>All Habits</h2>
            <HabitTracker habits={habits} />
          </div>
        </>
      )}
    </div>
  );
};

export default RoutinePage;