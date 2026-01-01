import { useEffect, useState } from "react";

export default function AuthModal({ isOpen, mode, onClose, onLoginSuccess }) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
       //Wait for exit animation before unmounting
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 320);    //To match CSS duration

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`auth-overlay ${isOpen ? "open" : "closing"}`}
      onClick={onClose }
    >
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="auth-title">
          {mode === "register" ? "Create account" : "Log in"}
        </h2>

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); if (mode === "login") { onLoginSuccess();} else { onClose() }; }} >

          {mode === "register" && (
            <div className="auth-field">
              <label>Name</label>
              <input type="text" placeholder="Your name" />
            </div>
          )} 

          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <div className="auth-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              {mode === "register" ? "Create account" : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
