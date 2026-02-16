import React, { useState, useEffect } from 'react';
import { groupsAPI } from '../../services/api';

const GroupRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // In real app, you would need to know which groups the user is admin of
      // For now, let's assume we're checking the first group
      if (userGroups.length > 0) {
        const response = await groupsAPI.getGroupRequests(userGroups[0].id);
        if (response.data.success) {
          setRequests(response.data.requests);
        }
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, action) => {
    setReviewing(requestId);
    try {
      const response = await groupsAPI.reviewRequest(requestId, action, '');
      if (response.data.success) {
        // Remove the reviewed request from list
        setRequests(requests.filter(req => req._id !== requestId));
      }
    } catch (error) {
      console.error('Failed to review request:', error);
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <p>No pending requests to review.</p>
      </div>
    );
  }

  return (
    <div className="group-requests">
      <h2>Pending Requests</h2>
      <p className="subtitle">Review join requests for your groups</p>

      <div className="requests-list">
        {requests.map(request => (
          <div key={request._id} className="request-card">
            <div className="request-info">
              <div className="user-info">
                <h4>{request.user.name}</h4>
                <p className="user-email">
                  {request.user.email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) => 
                    p1 + '*'.repeat(p2.length)
                  )}
                </p>
              </div>
              <div className="request-details">
                <span className="badge role-badge">
                  Requesting as: {request.requestedRole.toUpperCase()}
                </span>
                <span className="request-date">
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="request-actions">
              <button
                className="btn btn-success"
                onClick={() => handleReview(request._id, 'approve')}
                disabled={reviewing === request._id}
              >
                {reviewing === request._id ? 'Approving...' : 'Approve'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleReview(request._id, 'reject')}
                disabled={reviewing === request._id}
              >
                {reviewing === request._id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupRequests;