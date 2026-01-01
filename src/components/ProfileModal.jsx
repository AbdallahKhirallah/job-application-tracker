import { useEffect, useState } from "react";

export default function ProfileModal({ isOpen, user, onClose, onSave }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsEditing(false);
      setFormData(user); //To sync when opening
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 320);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, user]);

  if (!shouldRender || !user) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    onSave(formData);
    setIsEditing(false);
  }

  return (
    <div
      className={`auth-overlay ${isOpen ? "open" : "closing"}`}
      onClick={onClose}
    >
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-title">Profile</h2>

        {/*THE VIEW MODE */}
        {!isEditing && (
          <div className="profile-view">
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <span className="profile-value">{user.name}</span>
            </div>

            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user.email}</span>
            </div>
          </div>
        )}

        {/*EDIT MODE */}
        {isEditing && (
          <div className="auth-form">
            <div className="auth-field">
              <label>Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
             
             {/*Editing password */}
            <button className="btn-secondary" disabled>
              Change Password (Coming soon)
            </button>

          </div>
        )}

        <div className="auth-actions">
          {!isEditing && (
            <button
              className="btn-secondary"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}

          {isEditing && (
            <>
              <button className="btn-primary" onClick={handleSave}>
                Save
              </button>
              <button
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancelho
              </button>
            </>
          )}

          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
