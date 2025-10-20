import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';
import AdminDashboard from './AdminDashboard';
import StoreOwnerDashboard from './StoreOwnerDashboard';

function Dashboard() {
  const [stats, setStats] = useState({});
  const [storeOwnerData, setStoreOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  if (user?.role === 'store_owner') {
    return <StoreOwnerDashboard />;
  }
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user.role === 'admin') {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } else if (user.role === 'store_owner') {
        const response = await api.get('/dashboard/store-owner');
        setStoreOwnerData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (user.role === 'admin') {
    return (
      <div className="dashboard">
        <h1>Admin Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Stores</h3>
            <p className="stat-number">{stats.totalStores}</p>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <p className="stat-number">{stats.totalRatings}</p>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'store_owner') {
    return (
      <div className="dashboard">
        <h1>Store Owner Dashboard</h1>
        {storeOwnerData?.store ? (
          <div className="store-owner-content">
            <div className="store-info">
              <h2>{storeOwnerData.store.name}</h2>
              <p>{storeOwnerData.store.address}</p>
              <div className="store-stats">
                <div className="stat">
                  <strong>Average Rating:</strong>{' '}
                  {storeOwnerData.store.average_rating 
                    ? storeOwnerData.store.average_rating.toFixed(1) 
                    : 'No ratings yet'}
                </div>
                <div className="stat">
                  <strong>Total Ratings:</strong> {storeOwnerData.store.total_ratings}
                </div>
              </div>
            </div>
            
            <div className="ratings-list">
              <h3>Recent Ratings</h3>
              {storeOwnerData.ratings.length > 0 ? (
                <div className="ratings-grid">
                  {storeOwnerData.ratings.map((rating, index) => (
                    <div key={index} className="rating-item">
                      <div className="rating-header">
                        <strong>{rating.name}</strong>
                        <span className="rating-stars">{'★'.repeat(rating.rating)}</span>
                      </div>
                      <p>{rating.email}</p>
                      <small>{new Date(rating.created_at).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No ratings yet for your store.</p>
              )}
            </div>
          </div>
        ) : (
          <p>No store assigned to your account.</p>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>
      <div className="user-welcome">
        <p>You can browse stores and submit ratings for stores you've visited.</p>
        <div className="quick-actions">
          <a href="/stores" className="action-button">
            Browse Stores
          </a>
          <a href="/profile" className="action-button secondary">
            Update Profile
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;