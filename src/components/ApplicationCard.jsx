import { useState, useRef, useEffect } from "react";

export default function ApplicationCard({ company, role, status, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <article className="app-card">
      <header className="app-card-header">
        <h2 className="app-card-company">{company}</h2>
      </header>

      <span className={`status-badge status-${status}`}>{status}</span>

      <button
        className="card-menu-btn"
        aria-label="Application actions"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        ⋯
      </button>

      <div
        ref={menuRef}
        className={`card-actions-menu ${isMenuOpen ? "open" : ""}`}
      >
        <button className="card-action-item">✏️ Edit</button>
        <button
          className="card-action-item danger"
          onClick={() => {
            setIsMenuOpen(false);
            setIsConfirmOpen(true);
          }}
        >
          🗑 Delete
        </button>
      </div>

      <div className="app-card-body">
        <p className="app-card-role">{role}</p>
      </div>

      <div className="app-card-divider" />

      <footer className="app-card-footer">
        <span className="app-card-meta">Click to view details</span>
      </footer>

      {isConfirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>Delete application?</h3>
            <p>This action cannot be undone.</p>

            <div className="confirm-actions">
              <button
                className="btn-secondary"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>

              <button className="btn-danger" onClick={onDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
