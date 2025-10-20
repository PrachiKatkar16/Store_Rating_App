import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './StoreOwnerDashboard.css';

function StoreOwnerDashboard() {
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await api.get('/store-owner/dashboard');
      setStoreData(response.data.store);
      setRatings(response.data.ratings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching store data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your store dashboard...</div>;
  }

  if (!storeData) {
    return (
      <div className="store-owner-dashboard">
        <h1>Store Owner Dashboard</h1>
        <div className="no-store">
          <p>No store assigned to your account.</p>
          <p>Please contact the system administrator to assign a store to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-owner-dashboard">
      <h1>Store Owner Dashboard</h1>
      
      <div className="store-overview">
        <div className="store-info">
          <h2>🏪 {storeData.name}</h2>
          <p className="store-address">📍 {storeData.address}</p>
          <p className="store-email">📧 {storeData.email}</p>
        </div>
        
        <div className="store-stats">
          <div className="stat-card">
            <div className="stat-value">{storeData.average_rating ? Number(storeData.average_rating).toFixed(1) : '0.0'}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{storeData.total_ratings}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>
      </div>

      <div className="ratings-section">
        <h3>Customer Ratings</h3>
        
        {ratings.length > 0 ? (
          <div className="ratings-list">
            <div className="ratings-header">
              <span>Customer</span>
              <span>Rating</span>
              <span>Date</span>
            </div>
            {ratings.map((rating, index) => (
              <div key={index} className="rating-item">
                <div className="customer-info">
                  <div className="customer-name">{rating.user_name}</div>
                  <div className="customer-email">{rating.user_email}</div>
                </div>
                <div className="rating-stars">
                  {'★'.repeat(rating.rating)}{'☆'.repeat(5 - rating.rating)}
                  <span className="rating-number">({rating.rating}/5)</span>
                </div>
                <div className="rating-date">
                  {new Date(rating.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-ratings">
            <p>No ratings yet for your store.</p>
            <p>Encourage customers to rate your store!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreOwnerDashboard;