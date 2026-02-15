import { useEffect, useState } from "react";
import { authAPI } from "../../services/api";

export default function ProfileModal({ isOpen, user, onClose, onSave }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

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

  async function handlePasswordChange() {
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Optional: show success message
    } catch (error) {
      setPasswordError(error.message);
    }
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

            {/* PASSWORD CHANGE MODE */}
            {isChangingPassword && (
              <div className="auth-form">
                <div className="auth-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="auth-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="auth-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>

                {passwordError && (
                  <div
                    style={{
                      color: "var(--status-rejected)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {passwordError}
                  </div>
                )}
              </div>
            )}

            {/*Change password */}
            {!isChangingPassword && (
              <button
                className="btn-secondary"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </button>
            )}
          </div>
        )}

        <div className="auth-actions">
          {!isEditing && !isChangingPassword && (
            <button
              className="btn-secondary"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}

          {isEditing && !isChangingPassword && (
            <>
              <button className="btn-primary" onClick={handleSave}>
                Save
              </button>
              <button
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          )}

          {isChangingPassword && (
            <>
              <button className="btn-primary" onClick={handlePasswordChange}>
                Change Password
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordError("");
                }}
              >
                Cancel
              </button>
            </>
          )}

          {!isEditing && !isChangingPassword && (
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
