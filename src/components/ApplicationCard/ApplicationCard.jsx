import { useState, useRef, useEffect } from "react";

export default function ApplicationCard({
  company,
  role,
  status,
  location,
  appliedAt,
  source,
  notes,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
  cardRef,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "",
    location: "",
    appliedAt: "",
    source: "",
    notes: "",
  });

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

  // Initialize form data when edit modal opens
  useEffect(() => {
    if (isEditOpen) {
      setFormData({
        company,
        role,
        status,
        location,
        appliedAt,
        source,
        notes,
      });
    }
  }, [isEditOpen, company, role, status, location, appliedAt, source, notes]);

  function handleChange(e) {
    const { name, value } = e.target;

    // Preventing future dates for appliedAt
    if (name === "appliedAt" && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        return; // Don't update if future date
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    const dataToSave = {
      ...formData,
      applied_at: formData.appliedAt,
    };

    delete dataToSave.appliedAt;

    onEdit(dataToSave);
    setIsEditOpen(false);
    setIsMenuOpen(false);
  }

  return (
    <>
      <article ref={cardRef} className="app-card">
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
          <button
            className="card-action-item"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditOpen(true);
            }}
          >
            ✏️ Edit
          </button>
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

        {isExpanded && (
          <div className="app-card-details">
            <div className="detail-row">
              <span className="detail-label">Location</span>
              <span className="detail-value">{location}</span>
            </div>


            <div className="detail-row">
              <span className="detail-label">Source</span>
              <span className="detail-value">{source}</span>
            </div>

            <div className="detail-notes">
              <span className="detail-label">Notes</span>
              <p>{notes}</p>
            </div>
          </div>
        )}

        <div className="app-card-divider" />

        <footer className="app-card-footer">
          <button className="app-card-toggle" onClick={onToggle}>
            {isExpanded ? "Hide details" : "View details"}
          </button>
        </footer>
      </article>

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

      {isEditOpen && (
        <div className="confirm-overlay">
          <div className="confirm-dialog edit-dialog">
            <h3>Edit Application</h3>

            <div className="auth-form">
              <div className="auth-field">
                <label>Company</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div className="auth-field">
                <label>Role</label>
                <input
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div className="auth-field">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="auth-field">
                <label>Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  type="text"
                />
              </div>


              <div className="auth-field">
                <label>Source</label>
                <input
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div className="auth-field">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="confirm-actions">
              <button
                className="btn-secondary"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </button>

              <button className="btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
