import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import './Courses.css';

const CourseForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    professor: '',
    department: '',
    books: [{ name: '', author: '', edition: '' }],
    references: [''],
    schedule: [{ day: 'mon', startTime: '09:00', endTime: '10:00', room: '' }],
    color: '#4F46E5',
    credits: 3
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookChange = (index, field, value) => {
    const newBooks = [...formData.books];
    newBooks[index][field] = value;
    setFormData(prev => ({
      ...prev,
      books: newBooks
    }));
  };

  const addBook = () => {
    setFormData(prev => ({
      ...prev,
      books: [...prev.books, { name: '', author: '', edition: '' }]
    }));
  };

  const removeBook = (index) => {
    const newBooks = [...formData.books];
    newBooks.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      books: newBooks
    }));
  };

  const handleReferenceChange = (index, value) => {
    const newReferences = [...formData.references];
    newReferences[index] = value;
    setFormData(prev => ({
      ...prev,
      references: newReferences
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, '']
    }));
  };

  const removeReference = (index) => {
    const newReferences = [...formData.references];
    newReferences.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      references: newReferences
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'mon', startTime: '09:00', endTime: '10:00', room: '' }]
    }));
  };

  const removeSchedule = (index) => {
    const newSchedule = [...formData.schedule];
    newSchedule.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Course name is required';
    if (!formData.professor.trim()) newErrors.professor = 'Professor name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    
    if (formData.schedule.length === 0) {
      newErrors.schedule = 'At least one class schedule is required';
    }

    formData.schedule.forEach((item, index) => {
      if (!item.startTime || !item.endTime) {
        newErrors[`schedule_${index}`] = 'Start and end time are required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const days = [
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' },
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' }
  ];

  return (
    <form onSubmit={handleSubmit} className="course-form">
      <div className="form-section">
        <h3>Basic Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Course Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Data Structures"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Course Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., CSE-201"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Professor *</label>
            <input
              type="text"
              name="professor"
              value={formData.professor}
              onChange={handleChange}
              placeholder="Professor's name"
              className={errors.professor ? 'error' : ''}
            />
            {errors.professor && <span className="error-text">{errors.professor}</span>}
          </div>

          <div className="form-group">
            <label>Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              className={errors.department ? 'error' : ''}
            />
            {errors.department && <span className="error-text">{errors.department}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Course Color</label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{ width: '60px', height: '40px' }}
            />
          </div>

          <div className="form-group">
            <label>Credits</label>
            <select
              name="credits"
              value={formData.credits}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map(credit => (
                <option key={credit} value={credit}>{credit}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Books & References</h3>
        
        <div className="books-section">
          <div className="section-header">
            <h4>Text Books</h4>
            <button type="button" className="btn-small" onClick={addBook}>
              + Add Book
            </button>
          </div>
          
          {formData.books.map((book, index) => (
            <div key={index} className="book-item">
              <input
                type="text"
                placeholder="Book Name"
                value={book.name}
                onChange={(e) => handleBookChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Author"
                value={book.author}
                onChange={(e) => handleBookChange(index, 'author', e.target.value)}
              />
              <input
                type="text"
                placeholder="Edition"
                value={book.edition}
                onChange={(e) => handleBookChange(index, 'edition', e.target.value)}
              />
              {formData.books.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeBook(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="references-section">
          <div className="section-header">
            <h4>References</h4>
            <button type="button" className="btn-small" onClick={addReference}>
              + Add Reference
            </button>
          </div>
          
          {formData.references.map((ref, index) => (
            <div key={index} className="reference-item">
              <input
                type="text"
                placeholder="Reference URL or Name"
                value={ref}
                onChange={(e) => handleReferenceChange(index, e.target.value)}
              />
              {formData.references.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeReference(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Class Schedule *</h3>
          <button type="button" className="btn-small" onClick={addSchedule}>
            + Add Schedule
          </button>
        </div>
        
        {errors.schedule && <span className="error-text">{errors.schedule}</span>}
        
        {formData.schedule.map((schedule, index) => (
          <div key={index} className="schedule-item">
            <div className="schedule-row">
              <div className="form-group">
                <label>Day</label>
                <select
                  value={schedule.day}
                  onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                >
                  {days.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <TimePicker
                  onChange={(value) => handleScheduleChange(index, 'startTime', value)}
                  value={schedule.startTime}
                  format="HH:mm"
                  clearIcon={null}
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <TimePicker
                  onChange={(value) => handleScheduleChange(index, 'endTime', value)}
                  value={schedule.endTime}
                  format="HH:mm"
                  clearIcon={null}
                />
              </div>

              <div className="form-group">
                <label>Room</label>
                <input
                  type="text"
                  value={schedule.room}
                  onChange={(e) => handleScheduleChange(index, 'room', e.target.value)}
                  placeholder="e.g., Room 301"
                />
              </div>

              {formData.schedule.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeSchedule(index)}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Course' : 'Add Course'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;