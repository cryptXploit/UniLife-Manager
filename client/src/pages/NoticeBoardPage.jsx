import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotices, addNotice, updateNotice, deleteNotice } from '../features/noticeboard/noticeSlice';
import NoticeForm from '../components/noticeboard/NoticeForm';
import NoticeCard from '../components/noticeboard/NoticeCard';
import { groupsAPI } from '../services/api';
import './Pages.css';

const NoticeBoardPage = () => {
  const dispatch = useDispatch();
  const { notices, loading, error } = useSelector(state => state.notices);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  useEffect(() => {
    loadUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      dispatch(fetchNotices(selectedGroup));
    }
  }, [selectedGroup, dispatch]);

  const loadUserGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups();
      if (response.data.success) {
        setUserGroups(response.data.groups);
        if (response.data.groups.length > 0) {
          setSelectedGroup(response.data.groups[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingNotice) {
        await dispatch(updateNotice({ id: editingNotice._id, formData }));
        setEditingNotice(null);
      } else {
        await dispatch(addNotice(formData));
      }
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save notice:', error);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await dispatch(deleteNotice(noticeId));
    }
  };

  const currentGroup = userGroups.find(g => g.id === selectedGroup);

  if (loading) {
    return <div className="loading">Loading notices...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h1>Notice Board</h1>
          <div className="group-selector">
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="group-select"
            >
              <option value="">Select a group</option>
              {userGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.role})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedGroup && currentGroup && ['admin', 'teacher', 'cr'].includes(currentGroup.role) && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + New Notice
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {!selectedGroup ? (
        <div className="empty-state">
          <p>Please select a group to view notices.</p>
        </div>
      ) : showForm ? (
        <div className="form-container">
          <NoticeForm
            groups={userGroups}
            initialData={editingNotice}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingNotice(null);
            }}
          />
        </div>
      ) : (
        <>
          {notices.length === 0 ? (
            <div className="empty-state">
              <p>No notices in this group yet.</p>
              {['admin', 'teacher', 'cr'].includes(currentGroup?.role) && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Create First Notice
                </button>
              )}
            </div>
          ) : (
            <div className="notices-container">
              {/* Pinned notices */}
              {notices.filter(n => n.pinned).length > 0 && (
                <div className="pinned-section">
                  <h2 className="section-title">📌 Pinned Notices</h2>
                  <div className="notices-grid">
                    {notices
                      .filter(n => n.pinned)
                      .map(notice => (
                        <NoticeCard
                          key={notice._id}
                          notice={notice}
                          currentGroup={currentGroup}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All notices */}
              <div className="all-notices">
                <h2 className="section-title">All Notices</h2>
                <div className="notices-grid">
                  {notices
                    .filter(n => !n.pinned)
                    .map(notice => (
                      <NoticeCard
                        key={notice._id}
                        notice={notice}
                        currentGroup={currentGroup}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NoticeBoardPage;