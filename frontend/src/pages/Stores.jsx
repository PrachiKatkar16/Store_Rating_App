import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Stores.css';

function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const { user } = useAuth();

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const fetchStores = async () => {
  try {
    const response = await api.get('/stores', {
      params: { search, sortBy, sortOrder }
    });
    console.log('Stores API Response:', response.data); // Debug line
    setStores(response.data);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching stores:', error);
    setLoading(false);
  }
};

  const submitRating = async (storeId, rating) => {
    try {
      await api.post('/ratings', {
        store_id: storeId,
        rating
      });
      fetchStores(); // Refresh data
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    }
  };

  // Safe function to format rating
  const formatRating = (rating) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
      return 'No ratings';
    }
    return Number(rating).toFixed(1);
  };

  if (loading) {
    return <div className="loading">Loading stores...</div>;
  }

  return (
    <div className="stores-page">
      <h1>Stores</h1>
      
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Search by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="average_rating">Rating</option>
            <option value="address">Address</option>
            <option value="total_ratings">Total Ratings</option>
          </select>
          
          <button 
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            className="sort-order-btn"
          >
            {sortOrder === 'ASC' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      <div className="stores-grid">
        {stores.map(store => (
          <div key={store.id} className="store-card">
            <h3>{store.name}</h3>
            <p className="store-address">{store.address}</p>
            <p className="store-email">{store.email}</p>
            
            <div className="rating-section">
              <div className="overall-rating">
                <strong>Overall Rating:</strong>{' '}
                <span className="rating-value">
                  {formatRating(store.average_rating)} ★ 
                  {store.total_ratings > 0 && ` (${store.total_ratings} ratings)`}
                </span>
              </div>
              
              {user.role === 'user' && (
                <div className="user-rating">
                  <strong>Your Rating:</strong>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className={`star-btn ${star <= (store.user_rating || 0) ? 'active' : ''}`}
                        onClick={() => submitRating(store.id, star)}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {store.user_rating && (
                    <small>You rated this store {store.user_rating} stars</small>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="no-stores">
          <p>No stores found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default Stores;