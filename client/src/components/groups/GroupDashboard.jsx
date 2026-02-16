import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { groupsAPI } from '../../services/api';
import CreateGroup from './CreateGroup';
import JoinGroup from './JoinGroup';
import GroupRequests from './GroupRequests';
import './Groups.css';

const GroupDashboard = () => {
  const [activeTab, setActiveTab] = useState('my-groups');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (activeTab === 'my-groups') {
      fetchMyGroups();
    }
  }, [activeTab]);

  const fetchMyGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups();
      if (response.data.success) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="groups-dashboard">
      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome, {user?.name} 👋</h1>
          <p className="user-email">
            {user?.email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) => 
              p1 + '*'.repeat(p2.length)
            )}
          </p>
        </div>
        <div className="role-badge">
          <span className={`badge ${user?.role}`}>
            {user?.role.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'my-groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-groups')}
        >
          My Groups
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Group
        </button>
        <button 
          className={`tab ${activeTab === 'join' ? 'active' : ''}`}
          onClick={() => setActiveTab('join')}
        >
          Join Group
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'my-groups' && (
          <div className="my-groups">
            <h2>Your Groups</h2>
            {loading ? (
              <div className="loading">Loading groups...</div>
            ) : groups.length === 0 ? (
              <div className="empty-state">
                <p>You haven't joined any groups yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('join')}
                >
                  Join a Group
                </button>
              </div>
            ) : (
              <div className="groups-grid">
                {groups.map(group => (
                  <div key={group.id} className="group-card">
                    <div className="group-header">
                      <h3>{group.name}</h3>
                      <span className={`role-badge ${group.role}`}>
                        {group.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="group-description">{group.description}</p>
                    <div className="group-stats">
                      <span>👥 {group.totalMembers} members</span>
                    </div>
                    <div className="group-actions">
                      <button className="btn btn-outline">Enter Group</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && <CreateGroup />}
        {activeTab === 'join' && <JoinGroup />}
        {activeTab === 'requests' && <GroupRequests />}
      </div>
    </div>
  );
};

export default GroupDashboard;