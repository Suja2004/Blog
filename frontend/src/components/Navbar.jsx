import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <nav className="navbar">
      <h1 className="navbar-title">My Blog</h1>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' || location.pathname.startsWith('/blogs') || location.pathname.startsWith('/edit') ? 'active' : ''}>
          Home
        </Link>
        <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>
          Create Blog
        </Link>
        {isLoggedIn ? (
          <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
            <i className="fas fa-user-circle profile-icon" title="Profile" style={{ cursor: 'pointer' }}></i>
          </Link>

        ) : (
          <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
        )}
      </div>
    </nav >
  );
};

export default Navbar;
