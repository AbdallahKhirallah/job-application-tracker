import { useState, useEffect } from "react";
import Navbar from "./layout/Navbar";
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/modals/AuthModal"
import ProfileModal from "./components/modals/ProfileModal"
import { authAPI } from "./services/api";
import './index.css' 

function App() {
  // Authentification states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  //Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("register"); // switches between register & login
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const loggedIn = authAPI.isLoggedIn();
    if (loggedIn) {
      const currentUser = authAPI.getCurrentUser();
      setIsLoggedIn(true);
      setUser(currentUser);
    }
  }, []);

  function openAuth(mode) {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }

  function closeAuth() {
    setIsAuthOpen(false);
  }

  function handleLoginSuccess(userData) {
    setIsLoggedIn(true);
    setUser(userData);
    setIsAuthOpen(false);
  }

  function handleLogout() {
    authAPI.logout();
    setIsLoggedIn(false);
    setUser(null);
  }

  function openProfile() {
    setIsProfileOpen(true);
  }

  function closeProfile() {
    setIsProfileOpen(false);
  }

  function handleSaveProfile(updatedUser) {
    setUser(updatedUser);
    //to do :  ********** Call API to update user profile on backend************
  }

  return (
    <div className="app">
      <Navbar
        isLoggedIn={isLoggedIn}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
        onOpenProfile={openProfile}
      />
      <Dashboard isLoggedIn={isLoggedIn} onOpenAuth={openAuth} />
      <AuthModal
        isOpen={isAuthOpen}
        mode={authMode}
        onClose={closeAuth}
        onLoginSuccess={handleLoginSuccess}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={closeProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default App;
