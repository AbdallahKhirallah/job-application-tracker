

import { useState } from "react";
import Navbar from "./layout/Navbar";
import Dashboard from "./pages/Dashboard";

function App() {
  // TEMP: fake auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} />
      <Dashboard isLoggedIn={isLoggedIn} />

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
