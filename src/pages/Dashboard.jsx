import { useState , useRef , useEffect  } from "react";
import ApplicationCard from "../components/ApplicationCard/ApplicationCard"
import "./Dashboard.css";
import { applicationsAPI } from "../services/api";





export default function Dashboard({ isLoggedIn, onOpenAuth  }) {

  // States for applications from database
const [applications, setApplications] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);


// State for Creating Application Modal
const [isCreateOpen, setIsCreateOpen] = useState(false);
const [createFormData, setCreateFormData] = useState({
  company: "",
  role: "",
  status: "applied",
  location: "",
  applied_at: "",
  source: "",
  notes: "",
});
const [createError, setCreateError] = useState("");

const [createLoading, setCreateLoading] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

  const [hoveredButton, setHoveredButton] = useState(null);

  const expandedCardRef = useRef(null);



  // Fetching applications when user logs in
useEffect(() => {
  if (isLoggedIn) {
    fetchApplications();
  }
}, [isLoggedIn]);

async function fetchApplications() {
  setLoading(true);
  setError(null);

  try {
    const data = await applicationsAPI.getAll();
    setApplications(data);
  } catch (err) {
    console.error("Error fetching applications:", err);
    setError(err.message || "Failed to load applications");
  } finally {
    setLoading(false);
  }
}



  useEffect(() => {
  function handleClickOutside(e) {
    if (
      expandedCardRef.current &&
      !expandedCardRef.current.contains(e.target)
    ) {
      setExpandedId(null);
    }
  }

  if (expandedId !== null) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [expandedId]);




// CCreating Application
function handleCreateChange(e) {
  const { name, value } = e.target;
  setCreateFormData((prev) => ({ ...prev, [name]: value }));
  if (createError) setCreateError("");
}

async function handleCreateSubmit(e) {
  e.preventDefault();
  setCreateError("");
  setCreateLoading(true);

  if (!createFormData.company || !createFormData.role) {
    setCreateError("Company and role are required");
    setCreateLoading(false);
    return;
  }

    // Validating the Applied date so it cant be in the future
  if (createFormData.applied_at && new Date(createFormData.applied_at) > new Date()) {
    setCreateError("Applied date cannot be in the future");
    setCreateLoading(false);
    return;
  }


  try {
    const newApplication = await applicationsAPI.create(createFormData);
    setApplications((prev) => [newApplication, ...prev]);
    
    setCreateFormData({
      company: "",
      role: "",
      status: "applied",
      location: "",
      applied_at: "",
      source: "",
      notes: "",
    });
    setIsCreateOpen(false);
  } catch (err) {
    console.error("Error creating application:", err);
    setCreateError(err.message || "Failed to create application");
  } finally {
    setCreateLoading(false);
  }
}



  // Handling deleting an application
async function handleDeleteApplication(id) {
  try {
    await applicationsAPI.delete(id);
    setApplications((prev) => prev.filter((app) => app.id !== id));
  } catch (err) {
    console.error("Error deleting application:", err);
    alert(err.message ||  "Failed to delete application");
  }
}

  // Handling updating an application
async function handleUpdateApplication(id, updatedData) {
  try {
    const updatedApplication = await applicationsAPI.update(id, updatedData);
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? updatedApplication : app))
    );
  } catch (err) {
    console.error("Error updating application:", err);
    alert(err.message || "Failed to update application");
  }
}

  // The Logged-out view
  if (!isLoggedIn) {
    return (
      <main className="dashboard dashboard-empty dashboard-logged-out">
        {/* Animated gradient background */}
        <div className="dashboard-background" />

        {/* Floating abstract orbs */}
        <div className="floating-elements">
          <div className="floating-orb-1" />
          <div className="floating-orb-2" />
          <div className="floating-orb-3" />
          <div className="floating-orb-4" />
        </div>


        {/* Main Content */}
        <div className="dashboard-content">

          {/* Enhanced Title with Mirror Shine */}
          <h1 className="dashboard-title dashboard-title-wrapper">
            <span className="dashboard-title-gradient">
              Track your internship applications<br />in one place
            </span>


            {/* Mirror shine overlay */}
            <span className="dashboard-title-shine">
              Track your internship applications<br />in one place
            </span>
          </h1>

          <p className="dashboard-subtitle">
            Save applications, track statuses, and manage your internship search
            with clarity.
          </p>

          {/* Enhanced CTAs */}
          <div className="dashboard-cta">
            <button 
              className="btn-primary"
              onMouseEnter={() => setHoveredButton('login')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => onOpenAuth("login")}
              style={{
                background: hoveredButton === 'login' 
                  ? 'linear-gradient(135deg, #B38CA4 0%, #8B8378 100%)'
                  : 'var(--bg-elevated)',
              }}
            >
              Login
            </button>
            <button 
              className="btn-secondary"
              onMouseEnter={() => setHoveredButton('register')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => onOpenAuth("register")}
            >
              Register
            </button>
          </div>

          {/* Enhanced glassmorphic Cards */}
          <div className="ghost-grid">
            {[1, 2, 3].map((i) => (
              <EnhancedGhostCard key={i} index={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // The Logged-in view (rendering existing cards from db)
return (
  <main className="dashboard">
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Applications</h1>
        <button
          className="btn-primary"
          onClick={() => setIsCreateOpen(true)}
        >
          + Add Application
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading applications...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="dashboard-error">
          <p>Error: {error}</p>
          <button className="btn-secondary" onClick={fetchApplications}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && applications.length === 0 && (
        <div className="dashboard-empty">
          <p className="empty-message">No applications yet</p>
          <p className="empty-subtitle">
            Click "Add Application" to track your first internship application
          </p>
        </div>
      )}

      {/* Applications Grid */}
      {!loading && !error && applications.length > 0 && (
        <div className="dashboard-grid">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              id={app.id}
              company={app.company}
              role={app.role}
              status={app.status}
              location={app.location}
              appliedAt={app.applied_at}
              source={app.source}
              notes={app.notes}
              isExpanded={expandedId === app.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === app.id ? null : app.id))
              }
              onDelete={() => handleDeleteApplication(app.id)}
              onEdit={(updatedData) =>
                handleUpdateApplication(app.id, updatedData)
              }
              cardRef={expandedId === app.id ? expandedCardRef : null}
            />
          ))}
        </div>
      )}
    </div>




  {/* ---------------------------*/}
  {/*THE APPLICATION MODAL */}
  {/* ---------------------------*/}

    {isCreateOpen && (
      <div className="confirm-overlay" onClick={() => setIsCreateOpen(false)}>
        <div
          className="confirm-dialog edit-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Add New Application</h3>


          <form className="auth-form" onSubmit={handleCreateSubmit}>
            <div className="auth-field">
              <label>Company *</label>
              <input
                name="company"
                value={createFormData.company}
                 onChange={handleCreateChange}
                type="text"
                placeholder="e.g., Google"
                required
                disabled={createLoading}
              />
            </div>

            <div className="auth-field">
              <label>Role *</label>
               
              <input
                name="role"
                value={createFormData.role}
                onChange={handleCreateChange}
                type="text"
                placeholder="e.g., Software Engineer Intern"
                required
                disabled={createLoading}
              />
            </div>

            <div className="auth-field">
              <label>Status</label>
              <select

                name="status"
                value={createFormData.status}
                onChange={handleCreateChange}
                disabled={createLoading}
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
                value={createFormData.location}
                 onChange={handleCreateChange}
                type="text"
                 placeholder="e.g., Remote, New York"
                disabled={createLoading}
              />
            </div>

            <div className="auth-field">
              <label>Applied At</label>
              <input
                name="applied_at"
                value={createFormData.applied_at}
                onChange={handleCreateChange}
                type="date"
                max={new Date().toISOString().split('T')[0]}
                disabled={createLoading}
              />
            </div>

            <div className="auth-field">
              <label>Source</label>
              <input
                  name="source"
                value={createFormData.source}
                onChange={handleCreateChange}
                type="text"
                placeholder="e.g., LinkedIn"
                 disabled={createLoading}
              />
            </div>


            <div className="auth-field">
              <label>Notes</label>
              <textarea

                name="notes"
                value={createFormData.notes}
                 onChange={handleCreateChange}
                rows="3"
                placeholder="Any additional details..."
                disabled={createLoading}
              />

            </div>

            {createError && (
              <div className="form-error-message">
                {createError}
              </div>
            )}

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCreateOpen(false)}
                disabled={createLoading}
              >
                Cancel
              </button>


              <button type="submit" className="btn-primary" disabled={createLoading}>
                {createLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}


  </main> // end of Dashboard main
);
} // end of Dashboard function


// Enhanced Ghost Card Component 
function EnhancedGhostCard({ index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`ghost-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div className={`ghost-card-overlay ghost-card-overlay-${index}`} />
      

      {/* Card Content Shimmer */}
      <div className={`ghost-card-shimmer-top delay-${index}`} />
      <div className={`ghost-card-shimmer-bottom delay-${index}`} />
    </div>
  );
}