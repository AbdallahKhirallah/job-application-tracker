import { useState, useRef, useEffect } from "react";
import "./ApplicationCard.css";

export default function ApplicationCard({
  id,
  company,
  role,
  status,
  location,
  appliedAt,
  source,
  notes,
  interviewDate,
  resumeUrl,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
  cardRef,
  style,
  onUploadResume,
  onDeleteResume,
}) {
  // Formatting interview date for display  "Feb 20 at 2:00 PM"
  function formatInterviewDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }

  // returns how many days until interview (negative = {isExpanded && (past)
  function getDaysUntil(dateStr) {
    if (!dateStr) return null;
    const now = new Date();
    const interview = new Date(dateStr);
    const diff = interview - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const daysUntil = getDaysUntil(interviewDate);
  const interviewIsPast = daysUntil !== null && daysUntil < 0;

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
    interviewDate: "",
  });
  const [isInterviewPopupOpen, setIsInterviewPopupOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ date: "", time: "" });
  const [pendingSave, setPendingSave] = useState(null);

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
        interviewDate: interviewDate || "",
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
        return; // Do not update if future date
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
    delete dataToSave.interviewDate;

    //if status is being changed to interview, show the date popup first
    if (formData.status === "interview") {
      setPendingSave(dataToSave); //to hold the data while popup is open
      setIsEditOpen(false);
      setIsInterviewPopupOpen(true); //to show the popup
      return;
    }

    onEdit(dataToSave);
    setIsEditOpen(false);
    setIsMenuOpen(false);
  }

  // called after user confirms interview date in popup
  function handleInterviewDateConfirm() {
    // Combine date and time into one timestamp
    //"2026-02-20" + "14:00" -> "2026-02-20T14:00"
    const interview_date =
      interviewForm.date && interviewForm.time
        ? `${interviewForm.date}T${interviewForm.time}`
        : interviewForm.date
          ? `${interviewForm.date}T00:00`
          : null;

    onEdit({
      ...pendingSave,
      interview_date,
    });

    // resetting everything
    setIsInterviewPopupOpen(false);
    setPendingSave(null);
    setInterviewForm({ date: "", time: "" });
    setIsMenuOpen(false);
  }

  // called when user clicks Add later
  function handleInterviewDateSkip() {
    onEdit({
      ...pendingSave,
      interview_date: null, //saving without a date
    });

    // resetting everything
    setIsInterviewPopupOpen(false);
    setPendingSave(null);
    setInterviewForm({ date: "", time: "" });
    setIsMenuOpen(false);
  }

  // Copying Company/Role
  const [copiedField, setCopiedField] = useState(null);

  function copyToClipboard(text, field) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  return (
    <>
      <article ref={cardRef} className="app-card" style={style}>
        <header className="app-card-header">
          <h2
            className="app-card-company"
            onClick={() => copyToClipboard(company, "company")}
            title="Click to copy"
          >
            {copiedField === "company" ? "✓ Copied" : company}
          </h2>
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
          <p
            className="app-card-role"
            onClick={() => copyToClipboard(role, "role")}
            title="Click to copy"
          >
            {copiedField === "role" ? "✓ Copied" : role}
          </p>
        </div>

        {isExpanded && (
          <div className="app-card-details">
            <div className="detail-row">
              <span className="detail-label">Location</span>
              <span className="detail-value">{location}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {appliedAt
                  ? new Date(appliedAt).toLocaleDateString("en-US")
                  : "N/A"}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Source</span>
              <span className="detail-value">{source}</span>
            </div>

            {/* Interview date row - only shows for interview status */}
            {status === "interview" && (
              <div className="detail-row">
                <span className="detail-label">Interview</span>
                <span className="detail-value">
                  {interviewDate ? (
                    formatInterviewDate(interviewDate)
                  ) : (
                    <span className="interview-no-date">📅 Add date</span>
                  )}
                </span>
              </div>
            )}

            {/*The past interview prompt */}
            {interviewIsPast && status === "interview" && (
              <div className="past-interview-prompt">
                <p className="past-interview-text">
                  Interview was {Math.abs(daysUntil)}{" "}
                  {Math.abs(daysUntil) === 1 ? "day" : "days"} ago · How did it
                  go?
                </p>

                <div className="past-interview-actions">
                  <button
                    className="past-interview-btn offer"
                    onClick={() => onEdit({ status: "offer" })}
                  >
                    Got an Offer 🎉
                  </button>
                  <button
                    className="past-interview-btn rejected"
                    onClick={() => onEdit({ status: "rejected" })}
                  >
                    Rejected 😞
                  </button>
                </div>
              </div>
            )}

            <div className="detail-notes">
              <span className="detail-label">Notes</span>
              <p className={!notes ? "notes-empty" : ""}>
                {notes || "No notes added"}
              </p>
            </div>


{/* Resume section */}
          <div className="detail-resume">
            <span className="detail-label">Resume / CV</span>
            {resumeUrl ? (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-download-link"
                >
                  📄 View Resume
                </a>
                {typeof onDeleteResume === "function" && (
                  <button
                    className="resume-delete-btn"
                    onClick={() => onDeleteResume()}
                    type="button"
                  >
                    🗑 Remove
                  </button>
                )}
              </div>
            ) : (
              <label className="resume-upload-label">
                📎 Upload CV
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f && typeof onUploadResume === "function") {
                      onUploadResume(f);
                    }
                  }}
                />
              </label>
            )}
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

      {/* THE INTERVIEW DATE POPUP */}
      {isInterviewPopupOpen && (
        <div className="confirm-overlay">
          <div className="confirm-dialog interview-popup">
            <h3>When is your interview ?</h3>
            <p>Add the date and time so we can remind you.</p>

            <div className="auth-form">
              <div className="auth-field">
                <label>Date</label>
                <input
                  type="date"
                  value={interviewForm.date}
                  min={new Date().toISOString().split("T")[0]} //preventing past dates
                  onChange={(e) =>
                    setInterviewForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="auth-field">
                <label>
                  Time <span className="optional-label">(optional)</span>
                </label>
                <input
                  type="time"
                  value={interviewForm.time}
                  onChange={(e) =>
                    setInterviewForm((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="confirm-actions">
              <button
                className="btn-secondary"
                onClick={handleInterviewDateSkip}
              >
                Add later
              </button>

              <button
                className="btn-primary"
                onClick={handleInterviewDateConfirm}
                disabled={!interviewForm.date} //date is required to confirm (confirm button is disabled until the user picks a date).
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
