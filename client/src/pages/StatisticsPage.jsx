import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatistics } from '../features/statistics/statisticsSlice';
import CourseStats from '../components/statistics/CourseStats';
import HabitStats from '../components/statistics/HabitStats';
import ExpenseStats from '../components/statistics/ExpenseStats';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Pages.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsPage = () => {
  const dispatch = useDispatch();
  const { statistics, loading, error } = useSelector(state => state.statistics);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchStatistics());
  }, [dispatch]);

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
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

  const expenseChartData = {
    labels: Object.keys(statistics?.expenseStats?.byCategory || {}),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(statistics?.expenseStats?.byCategory || {}),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
        ]
      }
    ]
  };

  const attendanceChartData = {
    labels: statistics?.courseStats?.map(c => c.course) || [],
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: statistics?.courseStats?.map(c => c.attendanceRate) || [],
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Statistics & Analytics</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
          <button 
            className={`tab ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            Habits
          </button>
          <button 
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </button>
        </div>
      </div>

      <div className="statistics-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            {/* Expense Chart */}
            <div className="stat-card">
              <h3>Expense Distribution</h3>
              <div className="chart-container">
                <Pie data={expenseChartData} />
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="stat-card">
              <h3>Course Attendance</h3>
              <div className="chart-container">
                <Bar 
                  data={attendanceChartData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="stat-card">
              <h3>Summary</h3>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="label">Total Notes:</span>
                  <span className="value">{statistics?.noteStats?.total || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Monthly Expenses:</span>
                  <span className="value">
                    ${statistics?.expenseStats?.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Daily Avg Expense:</span>
                  <span className="value">
                    ${statistics?.expenseStats?.dailyAverage || '0.00'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Courses:</span>
                  <span className="value">{statistics?.courseStats?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <CourseStats data={statistics?.courseStats || []} />
        )}

        {activeTab === 'habits' && (
          <HabitStats data={statistics?.habitStats || []} />
        )}

        {activeTab === 'expenses' && (
          <ExpenseStats data={statistics?.expenseStats} />
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;