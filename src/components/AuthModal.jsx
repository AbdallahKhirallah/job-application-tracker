import { useEffect, useState } from "react";
import { authAPI } from "../services/api";

export default function AuthModal({ isOpen, mode, onClose, onLoginSuccess }) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      setFormData({ name: "", email: "", password: "" });
      setError("");
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 320);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const data = await authAPI.register(
          formData.name,
          formData.email,
          formData.password,
        );
        onLoginSuccess(data.user);
      } else {
        const data = await authAPI.login(formData.email, formData.password);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`auth-overlay ${isOpen ? "open" : "closing"}`}
      onClick={onClose}
    >
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-title">
          {mode === "register" ? "Create account" : "Log in"}
        </h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="auth-field">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          {error && (
            <div
              style={{
                color: "var(--status-rejected)",
                fontSize: "0.85rem",
                marginTop: "-8px",
              }}
            >
              {error}
            </div>
          )}

          <div className="auth-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "..."
                : mode === "register"
                  ? "Create account"
                  : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
