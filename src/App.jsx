

import { useState } from "react";
import Navbar from "./layout/Navbar";
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/AuthModal";


function App() {
  // TEMP: fake auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

const [isAuthOpen, setIsAuthOpen] = useState(false);
const [authMode, setAuthMode] = useState("register"); // switches between "register" / "login"

function openAuth(mode) {
  console.log("Open auth:", mode);
  setAuthMode(mode);
  setIsAuthOpen(true);
}

function closeAuth() {
  setIsAuthOpen(false);
}



  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} onOpenAuth={openAuth} />
      <Dashboard isLoggedIn={isLoggedIn} onOpenAuth={openAuth} />
      <AuthModal isOpen={isAuthOpen} mode={authMode} onClose={closeAuth} />


      {/* TEMP DEV TOGGLE (remove later) */}
      <button
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          padding: "8px 12px",
          fontSize: "0.75rem",
          opacity: 0.6,
        }}
        onClick={() => setIsLoggedIn((prev) => !prev)}
      >
        Toggle Auth
      </button>
    </div>
  );
}

export default App;
