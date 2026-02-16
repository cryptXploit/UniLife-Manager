import React, { useState } from 'react';
import { groupsAPI } from '../../services/api';

const JoinGroup = () => {
  const [formData, setFormData] = useState({
    groupName: '',
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

    setLoading(true);

    try {
      const response = await groupsAPI.joinRequest(formData);
      if (response.data.success) {
        setMessage(response.data.message);
        // Reset form
        setFormData({
          groupName: '',
          pin: '',
          requestedRole: 'student'
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-group">
      <h2>Join Existing Group</h2>
      <p className="subtitle">Request to join a group using group name and PIN</p>

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
          <label htmlFor="groupName">Group Name *</label>
          <input
            type="text"
            id="groupName"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
            placeholder="Enter exact group name"
            required
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
              placeholder="Enter group PIN"
              maxLength="6"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="requestedRole">Request as *</label>
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
          </div>
        </div>

        <div className="form-notes">
          <p><strong>Note:</strong> Your request will be reviewed by group admins before approval.</p>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Sending Request...' : 'Send Join Request'}
        </button>
      </form>
    </div>
  );
};

export default JoinGroup;