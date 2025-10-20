import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Profile.css';

function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setError('New password must contain at least one uppercase letter and one special character');
      return;
    }

    setLoading(true);

    try {
      await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setMessage('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'Not assigned';
    
    const roleMap = {
      'admin': 'Administrator',
      'user': 'Normal User', 
      'store_owner': 'Store Owner',
      'TIMI': 'Normal User'
    };
    
    return roleMap[role] || role;
  };

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name || 'Not available'}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email || 'Not available'}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className={`role-badge role-${user?.role}`}>
                {formatRole(user?.role)}
              </span>
            </div>
            <div className="info-item">
              <label>Address:</label>
              <span>{user?.address || 'Not provided'}</span>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="password-form">
            <form onSubmit={handlePasswordSubmit}>
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
              
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  maxLength={16}
                />
                <small>8-16 characters with uppercase and special character</small>
              </div>
              
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;