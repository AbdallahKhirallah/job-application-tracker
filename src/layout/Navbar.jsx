import { useState, useRef } from "react";

export default function Navbar({ isLoggedIn, onOpenAuth, onLogout, onOpenProfile }) {
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
            {/*Clicking the Register/Login button triggers the openAuth function in App.jsx  */}
              <span className="navbar-item" onClick={() => onOpenAuth("login")} >Login</span>
              <span className="navbar-item" onClick={() => onOpenAuth("register")} >Register</span>
            </>
          )}
            {/*Nav bar content when logged in */}
          {isLoggedIn && (
            <>
              <span className="navbar-item" onClick={onOpenProfile} >Profile</span>
              <span className="navbar-item navbar-logout" onClick={onLogout} >Logout</span>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
