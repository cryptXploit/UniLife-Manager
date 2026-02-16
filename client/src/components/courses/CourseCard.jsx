import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteCourse } from '../../features/courses/courseSlice';
import { coursesAPI } from '../../services/api';
import './Courses.css';

const CourseCard = ({ course, onEdit }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await coursesAPI.deleteCourse(course._id);
      dispatch(deleteCourse(course._id));
    } catch (error) {
      console.error('Failed to delete course:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const dayNames = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  };

  return (
    <>
      <div className="course-card" style={{ borderLeft: `5px solid ${course.color}` }}>
        <div className="course-header">
          <div className="course-title">
            <h3>{course.name}</h3>
            {course.code && <span className="course-code">{course.code}</span>}
          </div>
          <div className="course-actions">
            <button className="btn-icon" onClick={() => onEdit(course)} title="Edit">
              ✏️
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="course-details">
          <div className="detail-row">
            <span className="label">Professor:</span>
            <span className="value">{course.professor}</span>
          </div>
          <div className="detail-row">
            <span className="label">Department:</span>
            <span className="value">{course.department}</span>
          </div>
          {course.credits && (
            <div className="detail-row">
              <span className="label">Credits:</span>
              <span className="value">{course.credits}</span>
            </div>
          )}
        </div>

        <div className="course-schedule">
          <h4>Class Schedule:</h4>
          {course.schedule.map((item, index) => (
            <div key={index} className="schedule-item">
              <span className="day">{dayNames[item.day]}</span>
              <span className="time">
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </span>
              {item.room && <span className="room">({item.room})</span>}
            </div>
          ))}
        </div>

        {course.books && course.books.length > 0 && (
          <div className="course-books">
            <h4>Text Books:</h4>
            <ul>
              {course.books.map((book, index) => (
                <li key={index}>
                  {book.name} {book.author && `by ${book.author}`}
                  {book.edition && ` (${book.edition})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {course.references && course.references.length > 0 && (
          <div className="course-references">
            <h4>References:</h4>
            <ul>
              {course.references.map((ref, index) => (
                <li key={index}>{ref}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{course.name}</strong>?</p>
            <p className="warning">This action cannot be undone.</p>
            
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseCard;