import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, addNote, updateNote } from '../features/notes/noteSlice';
import NoteEditor from '../components/notes/NoteEditor';
import NoteList from '../components/notes/NoteList';
import { coursesAPI } from '../services/api';
import './Pages.css';

const NotesPage = () => {
  const dispatch = useDispatch();
  const { notes, loading } = useSelector(state => state.notes);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    dispatch(fetchNotes());
    loadCourses();
  }, [dispatch]);

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getCourses();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleSubmit = async (noteData) => {
    if (editingNote) {
      await dispatch(updateNote({ id: editingNote._id, noteData }));
      setEditingNote(null);
    } else {
      await dispatch(addNote(noteData));
    }
    setShowEditor(false);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const filteredNotes = selectedCourse === 'all' 
    ? notes
    : notes.filter(note => note.course?._id === selectedCourse);

  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h1>My Notes</h1>
          <div className="filter-controls">
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Notes</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowEditor(true)}
        >
          + New Note
        </button>
      </div>

      {showEditor ? (
        <div className="editor-container">
          <NoteEditor
            initialData={editingNote}
            courses={courses}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <p>No notes found. Create your first note!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowEditor(true)}
              >
                Create Note
              </button>
            </div>
          ) : (
            <NoteList
              notes={filteredNotes}
              onEdit={handleEdit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default NotesPage;