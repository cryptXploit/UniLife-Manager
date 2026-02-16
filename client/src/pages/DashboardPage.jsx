import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, markAttendance } from '../features/dashboard/dashboardSlice';
import TodaySchedule from '../components/dashboard/TodaySchedule';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import ClassAttendance from '../components/dashboard/ClassAttendance';
import './Pages.css';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { 
    dashboard, 
    loading, 
    error 
  } = useSelector(state => state.dashboard);

  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleAttendance = async (courseId, status) => {
    try {
      await dispatch(markAttendance({
        courseId,
        date: new Date().toISOString().split('T')[0],
        status,
        notes: ''
      })).unwrap();
      
      // Update local state
      setAttendanceStatus(prev => ({
        ...prev,
        [courseId]: status
      }));
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const getAttendanceStatus = (courseId) => {
    if (attendanceStatus[courseId]) {
      return attendanceStatus[courseId];
    }
    
    const existing = dashboard?.attendance?.find(a => a.course._id === courseId);
    return existing?.status || 'pending';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Today's Schedule */}
        <div className="dashboard-card large">
          <div className="card-header">
            <h2>Today's Schedule</h2>
            <span className="card-badge">
              {dashboard?.todayCourses?.length || 0} classes
            </span>
          </div>
          <TodaySchedule
            courses={dashboard?.todayCourses || []}
            onMarkAttendance={handleAttendance}
            getStatus={getAttendanceStatus}
          />
        </div>

        {/* Budget Overview */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Budget Overview</h2>
            <span className="card-badge">This Month</span>
          </div>
          <BudgetOverview budget={dashboard?.budget} />
        </div>

        {/* Today's Habits */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Today's Habits</h2>
            <span className="card-badge">
              {dashboard?.habits?.filter(h => h.isCompleted).length || 0}/
              {dashboard?.habits?.length || 0}
            </span>
          </div>
          <div className="habits-list">
            {dashboard?.habits?.slice(0, 5).map(habit => (
              <div key={habit._id} className="habit-item">
                <div className="habit-info">
                  <span className={`habit-status ${habit.isCompleted ? 'completed' : 'pending'}`}>
                    {habit.isCompleted ? '✓' : '○'}
                  </span>
                  <span className="habit-title">{habit.title}</span>
                </div>
                <span className="habit-time">{habit.time}</span>
              </div>
            ))}
            {(!dashboard?.habits || dashboard.habits.length === 0) && (
              <p className="empty-message">No habits for today</p>
            )}
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Attendance</h2>
            <span className="card-badge">Today</span>
          </div>
          <ClassAttendance
            courses={dashboard?.todayCourses || []}
            attendance={dashboard?.attendance || []}
          />
        </div>

        {/* Recent Notes */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Notes</h2>
            <span className="card-badge">Latest</span>
          </div>
          <div className="notes-list">
            {dashboard?.recentNotes?.slice(0, 5).map(note => (
              <div key={note._id} className="note-item">
                <div className="note-title">{note.title}</div>
                <div className="note-meta">
                  {note.course?.name && (
                    <span className="note-course">{note.course.name}</span>
                  )}
                  <span className="note-date">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {(!dashboard?.recentNotes || dashboard.recentNotes.length === 0) && (
              <p className="empty-message">No recent notes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;