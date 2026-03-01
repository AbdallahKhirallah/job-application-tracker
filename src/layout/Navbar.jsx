import React, { useState, useRef } from 'react';
import './Navbar.css';


function Navbar({ isLoggedIn, onOpenAuth, onLogout, onOpenProfile }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsExpanded(true);
    }, 80);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setIsExpanded(false);
  };

  return (
    <nav
      className={`navbar  ${isExpanded ? "expanded" : ""}`}

      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated gradient border */}
      <div className="navbar-border-glow" />
      
      {/* Inner gradient overlay */}
      <div className="navbar-inner-glow" />
      
      {/* Logo with particles - ALWAYS VISIBLE */}
      <div className="navbar-logo-wrapper">
        <img src="/jat-logo.png" alt="JAT" className="navbar-logo" style={{ height: '28px', width: 'auto' }} />
        <div className="navbar-logo-particles">
          <div className="particle particle-1" />
          <div className="particle particle-2" />
          <div className="particle particle-3" />
        </div>
      </div>

      {/* Dashboard - ALWAYS VISIBLE */}
      <span className="navbar-home">Dashboard</span>

      {/* Menu items - only visible when expanded */}
      {isExpanded && (
        <div className="navbar-items">
          {!isLoggedIn ? (
            <>
              <span className="navbar-item" onClick={() => onOpenAuth('login')}>Login</span>
              <span className="navbar-item" onClick={() => onOpenAuth('register')}>Register</span>
            </>
          ) : (
            <>
              <span className="navbar-item" onClick={onOpenProfile}>Profile</span>
              <span className="navbar-item navbar-logout" onClick={onLogout}>Logout</span>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;