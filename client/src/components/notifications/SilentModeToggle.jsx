import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { silentModeService } from '../../services/silentModeService';
import './Notification.css';

const SilentModeToggle = () => {
  const [isSilent, setIsSilent] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const { courses } = useSelector(state => state.courses);

  useEffect(() => {
    // Check current silent mode status
    const silentActive = localStorage.getItem('silentModeActive') === 'true';
    setIsSilent(silentActive);

    // Start monitoring if user has courses
    if (courses && courses.length > 0) {
      silentModeService.startClassMonitor(courses, (status) => {
        switch (status.type) {
          case 'class_started':
            setIsSilent(true);
            setCurrentClass(status.course);
            break;
          case 'class_ended':
            setIsSilent(false);
            setCurrentClass(null);
            break;
          case 'class_soon':
            // Show notification in UI
            console.log(`Class starting in ${status.minutesUntil} minutes`);
            break;
        }
      });

      // Schedule next day notifications
      silentModeService.scheduleNextDayNotifications(courses);
    }

    return () => {
      silentModeService.stopClassMonitor();
    };
  }, [courses]);

  const toggleSilentMode = () => {
    if (isSilent) {
      silentModeService.setSilentMode(false);
      setIsSilent(false);
    } else {
      silentModeService.setSilentMode(true);
      setIsSilent(true);
    }
  };

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="silent-mode-toggle">
      <div className={`silent-mode-card ${isSilent ? 'active' : ''}`}>
        <div className="silent-mode-header">
          <div className="silent-mode-icon">
            {isSilent ? '🔇' : '🔊'}
          </div>
          <div className="silent-mode-info">
            <h4>Class Mode</h4>
            <p>
              {isSilent 
                ? currentClass 
                  ? `Active for ${currentClass.name}`
                  : 'Phone is in silent mode'
                : 'Normal mode'}
            </p>
          </div>
        </div>
        
        {isSilent && currentClass && (
          <div className="current-class-info">
            <span className="class-name">{currentClass.name}</span>
            <span className="class-time">
              {currentClass.schedule?.[0]?.startTime} - {currentClass.schedule?.[0]?.endTime}
            </span>
          </div>
        )}

        <button 
          className={`silent-mode-btn ${isSilent ? 'active' : ''}`}
          onClick={toggleSilentMode}
        >
          {isSilent ? 'End Class Mode' : 'Start Class Mode'}
        </button>
      </div>
    </div>
  );
};

export default SilentModeToggle;