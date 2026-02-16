import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './NoticeBoard.css';

const NoticeForm = ({ groups, onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    groupId: initialData?.group?._id || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: initialData?.type || 'message',
    priority: initialData?.priority || 'normal',
    tags: initialData?.tags?.join(',') || '',
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().split('T')[0] : '',
    attachments: initialData?.attachments || []
  });

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const user = useSelector(state => state.auth.user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const removeAttachment = (index) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.groupId) {
      alert('Please select a group');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    const formDataToSend = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      if (key !== 'attachments' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Add files
    files.forEach(file => {
      formDataToSend.append('attachments', file);
    });

    // Add existing attachments
    formData.attachments.forEach(attachment => {
      formDataToSend.append('existingAttachments', JSON.stringify(attachment));
    });

    setUploading(true);
    try {
      await onSubmit(formDataToSend);
      // Reset form
      if (!initialData) {
        setFormData({
          groupId: '',
          title: '',
          content: '',
          type: 'message',
          priority: 'normal',
          tags: '',
          expiresAt: '',
          attachments: []
        });
        setFiles([]);
      }
    } catch (error) {
      console.error('Error submitting notice:', error);
    } finally {
      setUploading(false);
    }
  };

  const userGroups = groups.filter(group => {
    const userRole = group.members?.find(m => m.user?._id === user?.id)?.role;
    return ['admin', 'teacher', 'cr'].includes(userRole);
  });

  if (userGroups.length === 0 && !initialData) {
    return (
      <div className="no-permission">
        <p>You don't have permission to post notices in any groups.</p>
        <p>Only admins, teachers, and CRs can post notices.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="notice-form">
      <div className="form-section">
        <h3>Notice Details</h3>
        
        <div className="form-group">
          <label>Select Group *</label>
          <select
            name="groupId"
            value={formData.groupId}
            onChange={handleChange}
            required
            disabled={!!initialData}
          >
            <option value="">Select a group</option>
            {userGroups.map(group => (
              <option key={group._id} value={group._id}>
                {group.name} ({group.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notice title"
            required
          />
        </div>

        <div className="form-group">
          <label>Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter notice content..."
            rows="6"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="message">Message</option>
              <option value="announcement">Announcement</option>
              <option value="assignment">Assignment</option>
              <option value="pdf">PDF Document</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., exam, important, assignment"
            />
          </div>

          <div className="form-group">
            <label>Expiry Date (optional)</label>
            <input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Attachments</h3>
        
        {formData.attachments.length > 0 && (
          <div className="existing-attachments">
            <h4>Existing Attachments:</h4>
            {formData.attachments.map((file, index) => (
              <div key={index} className="attachment-item">
                <span className="attachment-name">{file.filename}</span>
                <span className="attachment-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeAttachment(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label>Add Files (Max 5, 10MB each)</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
          />
          <small>Supported: Images, PDF, Word documents, Text files</small>
          
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.name}</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={uploading}
        >
          {uploading ? 'Posting...' : initialData ? 'Update Notice' : 'Post Notice'}
        </button>
      </div>
    </form>
  );
};

export default NoticeForm;