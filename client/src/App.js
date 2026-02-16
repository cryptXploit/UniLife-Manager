import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './components/layout/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ResetPassword from './components/auth/ResetPassword';
import EmailVerification from './components/auth/EmailVerification';
import GroupDashboard from './components/groups/GroupDashboard';
import CoursesPage from './pages/CoursesPage';
import RoutinePage from './pages/RoutinePage';
import CostPage from './pages/CostPage';
import NotesPage from './pages/NotesPage';
import DashboardPage from './pages/DashboardPage';
import StatisticsPage from './pages/StatisticsPage';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { backgroundTaskManager } from './services/backgroundTasks';
import PermissionRequest from './components/notifications/PermissionRequest';
import './App.css';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  ) : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          
          {/* Private Routes with Sidebar */}
          <Route path="/" element={
            <PrivateRoute>
              <Navigate to="/dashboard" />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          <Route path="/groups" element={
            <PrivateRoute>
              <GroupDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/courses" element={
            <PrivateRoute>
              <CoursesPage />
            </PrivateRoute>
          } />
          
          <Route path="/routine" element={
            <PrivateRoute>
              <RoutinePage />
            </PrivateRoute>
          } />
          
          <Route path="/cost" element={
            <PrivateRoute>
              <CostPage />
            </PrivateRoute>
          } />
          
          <Route path="/notes" element={
            <PrivateRoute>
              <NotesPage />
            </PrivateRoute>
          } />
          
          <Route path="/statistics" element={
            <PrivateRoute>
              <StatisticsPage />
            </PrivateRoute>
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>

  );
}



function App() {
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize background tasks when user logs in
      backgroundTaskManager.initialize();
    } else {
      // Stop background tasks when user logs out
      backgroundTaskManager.stop();
    }

    return () => {
      backgroundTaskManager.stop();
    };
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="App">
        {/* Notification permission request */}
        <PermissionRequest />
        
        {/* Rest of the routes */}
        {/* ... */}
      </div>
    </Router>
  );
}


export default App;