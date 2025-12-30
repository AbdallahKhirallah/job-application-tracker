import { useState, useRef } from "react";

export default function Navbar({ isLoggedIn }) {
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
      className={`navbar ${isExpanded ? "expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="navbar-logo">JobTrack</span>
      <span className="navbar-home">Dashboard</span>

      {isExpanded && (
        <div className="navbar-items">
            {/*Nav bar content when logged out */}
          {!isLoggedIn && (
            <>
              <span className="navbar-item">Login</span>
              <span className="navbar-item">Register</span>
            </>
          )}
            {/*Nav bar content when logged in */}
          {isLoggedIn && (
            <>
              <span className="navbar-item">Profile</span>
              <span className="navbar-item navbar-logout">Logout</span>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
