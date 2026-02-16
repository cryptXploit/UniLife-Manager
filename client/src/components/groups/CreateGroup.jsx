import React, { useState } from 'react';
import { groupsAPI } from '../../services/api';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pin: '',
    requestedRole: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate PIN
    if (formData.pin.length < 4 || formData.pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    // Validate group name
    if (formData.name.length < 3) {
      setError('Group name must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await groupsAPI.createGroup(formData);
      if (response.data.success) {
        setMessage(response.data.message);
        // Reset form
        setFormData({
          name: '',
          description: '',
          pin: '',
          requestedRole: 'student'
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group">
      <h2>Create New Group</h2>
      <p className="subtitle">Create a group for your class, club, or study session</p>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="group-form">
        <div className="form-group">
          <label htmlFor="name">Group Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Computer Science 2024"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the purpose of this group..."
            rows="3"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pin">Group PIN *</label>
            <input
              type="text"
              id="pin"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              placeholder="4-6 digits"
              maxLength="6"
              required
              disabled={loading}
            />
            <small>Members will need this PIN to join</small>
          </div>

          <div className="form-group">
            <label htmlFor="requestedRole">Your Role *</label>
            <select
              id="requestedRole"
              name="requestedRole"
              value={formData.requestedRole}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="cr">Class Representative</option>
            </select>
            <small>You will be the group admin</small>
          </div>
        </div>

        <div className="form-notes">
          <p><strong>Note:</strong> As the creator, you will automatically become an admin of the group.</p>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating Group...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;