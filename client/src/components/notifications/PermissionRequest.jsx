import React, { useState, useEffect } from 'react';
import './Notification.css';

const PermissionRequest = () => {
  const [showRequest, setShowRequest] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      setPermissionStatus('unsupported');
      return;
    }

    const status = Notification.permission;
    setPermissionStatus(status);

    if (status === 'default') {
      // Show request after a delay
      setTimeout(() => {
        setShowRequest(true);
      }, 3000);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      setShowRequest(false);
      
      if (permission === 'granted') {
        // Show welcome notification
        new Notification('Welcome to UniLife Manager!', {
          body: 'You will now receive important notifications for classes, budgets, and habits.',
          icon: '/logo192.png',
          tag: 'welcome'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  if (!showRequest || permissionStatus !== 'default') {
    return null;
  }

  return (
    <div className="permission-request">
      <div className="permission-card">
        <div className="permission-header">
          <div className="permission-icon">🔔</div>
          <h3>Enable Notifications</h3>
        </div>
        
        <div className="permission-body">
          <p>Get notified about:</p>
          <ul>
            <li>📚 Upcoming classes & silent mode alerts</li>
            <li>💰 Budget warnings & expense alerts</li>
            <li>🏃 Habit reminders</li>
            <li>📢 Important group notices</li>
          </ul>
          <p className="permission-note">
            Notifications include our app logo for easy identification.
          </p>
        </div>

        <div className="permission-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setShowRequest(false)}
          >
            Maybe Later
          </button>
          <button 
            className="btn btn-primary"
            onClick={requestPermission}
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequest;