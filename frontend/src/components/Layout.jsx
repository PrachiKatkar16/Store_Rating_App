import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>Store Rating App</h2>
        </div>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/stores">Stores</Link>
          {user?.role === 'admin' && <Link to="/users">Users</Link>}
          <Link to="/profile">Profile</Link>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;