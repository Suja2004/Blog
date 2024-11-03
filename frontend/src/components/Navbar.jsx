import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const closeMenu = (e) => {
    if (isMenuOpen && !e.target.closest('.navbar-links') && !e.target.closest('.hamburger')) {
      setIsMenuOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener('click', closeMenu);
    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [isMenuOpen]);

  return (
    <nav className="navbar">
      <h1 className="navbar-title">My Blog</h1>

      <div className={`navbar-links ${isMenuOpen ? 'show' : ''}`}>
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
      <div className="hamburger" onClick={toggleMenu}>
        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </div>
    </nav>
  );
};

export default Navbar;
