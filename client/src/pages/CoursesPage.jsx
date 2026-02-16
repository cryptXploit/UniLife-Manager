import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, addCourse, updateCourse } from '../features/courses/courseSlice';
import CourseForm from '../components/courses/CourseForm';
import CourseCard from '../components/courses/CourseCard';
import './Pages.css';

const CoursesPage = () => {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector(state => state.courses);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleSubmit = async (courseData) => {
    if (editingCourse) {
      await dispatch(updateCourse({ id: editingCourse._id, courseData }));
      setEditingCourse(null);
    } else {
      await dispatch(addCourse(courseData));
    }
    setShowForm(false);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Courses</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Course
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {showForm ? (
        <div className="form-container">
          <CourseForm
            initialData={editingCourse}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          {courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses added yet. Add your first course to get started!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Add Course
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesPage;