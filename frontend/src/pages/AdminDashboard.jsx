import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>System Administrator Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="bi bi-speedometer2"></i> Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="bi bi-people"></i> Manage Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          <i className="bi bi-shop"></i> Manage Stores
        </button>
        <button 
          className={`tab-button ${activeTab === 'add-user' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-user')}
        >
          <i className="bi bi-person-plus"></i> Add User
        </button>
        <button 
          className={`tab-button ${activeTab === 'add-store' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-store')}
        >
          <i className="bi bi-plus-square"></i> Add Store
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bi bi-shop"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Stores</h3>
                  <p className="stat-number">{stats.totalStores}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bi bi-star"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Ratings</h3>
                  <p className="stat-number">{stats.totalRatings}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'stores' && <StoreManagement />}
        {activeTab === 'add-user' && <AddUserForm onUserAdded={fetchDashboardStats} />}
        {activeTab === 'add-store' && <AddStoreForm onStoreAdded={fetchDashboardStats} />}
      </div>
    </div>
  );
}

// User Management Component
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: { search, role: roleFilter }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><i className="bi bi-hourglass-split"></i> Loading users...</div>;

  return (
    <div className="user-management">
      <h2><i className="bi bi-people"></i> User Management</h2>
      
      <div className="filters">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by name, email, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="user">Normal User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th><i className="bi bi-person"></i> Name</th>
              <th><i className="bi bi-envelope"></i> Email</th>
              <th><i className="bi bi-geo-alt"></i> Address</th>
              <th><i className="bi bi-person-badge"></i> Role</th>
              <th><i className="bi bi-calendar"></i> Join Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="address-cell">{user.address}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    <i className={`bi ${getRoleIcon(user.role)}`}></i> {user.role}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="no-data">
            <i className="bi bi-people"></i> No users found
          </div>
        )}
      </div>
    </div>
  );
}

// Store Management Component
function StoreManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStores();
  }, [search]);

  const fetchStores = async () => {
    try {
      const response = await api.get('/admin/stores', {
        params: { search }
      });
      setStores(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><i className="bi bi-hourglass-split"></i> Loading stores...</div>;

  return (
    <div className="store-management">
      <h2><i className="bi bi-shop"></i> Store Management</h2>
      
      <div className="filters">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by store name, email, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="stores-table">
        <table>
          <thead>
            <tr>
              <th><i className="bi bi-shop"></i> Store Name</th>
              <th><i className="bi bi-envelope"></i> Email</th>
              <th><i className="bi bi-geo-alt"></i> Address</th>
              <th><i className="bi bi-star"></i> Rating</th>
              <th><i className="bi bi-person"></i> Owner</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.email}</td>
                <td className="address-cell">{store.address}</td>
                <td>
                  <span className="rating-display">
                    <i className="bi bi-star"></i> {store.average_rating ? `${Number(store.average_rating).toFixed(1)}` : 'No ratings'}
                    {store.total_ratings > 0 && ` (${store.total_ratings})`}
                  </span>
                </td>
                <td>{store.owner_name || 'No owner'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stores.length === 0 && (
          <div className="no-data">
            <i className="bi bi-shop"></i> No stores found
          </div>
        )}
      </div>
    </div>
  );
}

// Add User Form Component
function AddUserForm({ onUserAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      await api.post('/admin/users', formData);
      setMessage('User created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'user'
      });
      onUserAdded();
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-form">
      <h2><i className="bi bi-person-plus"></i> Add New User</h2>
      
      {error && <div className="error-message"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
      {message && <div className="success-message"><i className="bi bi-check-circle"></i> {message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label><i className="bi bi-person"></i> Full Name (20-60 characters):</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={20}
            maxLength={60}
            placeholder="Enter full name"
          />
          <small>{formData.name.length}/60 characters</small>
        </div>

        <div className="form-group">
          <label><i className="bi bi-envelope"></i> Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
          />
        </div>

        <div className="form-group">
          <label><i className="bi bi-person-badge"></i> Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="user">Normal User</option>
            <option value="store_owner">Store Owner</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>

        <div className="form-group">
          <label><i className="bi bi-geo-alt"></i> Address (max 400 characters):</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            maxLength={400}
            rows="3"
            placeholder="Enter complete address"
          />
          <small>{formData.address.length}/400 characters</small>
        </div>

        <div className="form-group">
          <label><i className="bi bi-lock"></i> Password (8-16 characters):</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            maxLength={16}
            placeholder="Enter password"
          />
          <small>Must include uppercase and special character</small>
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          <i className="bi bi-person-plus"></i> {loading ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

// Add Store Form Component
function AddStoreForm({ onStoreAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: { role: 'store_owner' }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
      await api.post('/admin/stores', formData);
      setMessage('Store created successfully!');
      setFormData({
        name: '',
        email: '',
        address: '',
        owner_id: ''
      });
      onStoreAdded();
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-store-form">
      <h2><i className="bi bi-plus-square"></i> Add New Store</h2>
      
      {error && <div className="error-message"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
      {message && <div className="success-message"><i className="bi bi-check-circle"></i> {message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label><i className="bi bi-shop"></i> Store Name (max 60 characters):</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={60}
            placeholder="Enter store name"
          />
          <small>{formData.name.length}/60 characters</small>
        </div>

        <div className="form-group">
          <label><i className="bi bi-envelope"></i> Store Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter store email"
          />
        </div>

        <div className="form-group">
          <label><i className="bi bi-geo-alt"></i> Store Address (max 400 characters):</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            maxLength={400}
            rows="3"
            placeholder="Enter store address"
          />
          <small>{formData.address.length}/400 characters</small>
        </div>

        <div className="form-group">
          <label><i className="bi bi-person"></i> Store Owner (Optional):</label>
          <select
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">No Owner</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <small>Select a store owner from existing users</small>
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          <i className="bi bi-plus-square"></i> {loading ? 'Creating Store...' : 'Create Store'}
        </button>
      </form>
    </div>
  );
}

// Helper function to get role icons
function getRoleIcon(role) {
  switch (role) {
    case 'admin':
      return 'bi-gear';
    case 'store_owner':
      return 'bi-shop';
    case 'user':
    default:
      return 'bi-person';
  }
}

export default AdminDashboard;