import { useState, useRef, useEffect, useMemo } from "react";
import ApplicationCard from "../components/ApplicationCard/ApplicationCard";
import "./Dashboard.css";
import { applicationsAPI } from "../services/api";
import WeeklyGoalBar from "../components/WeeklyGoalBar/WeeklyGoalBar";

// Filtering statuses
const STATUS_OPTIONS = ["applied", "interview", "offer", "rejected"];

export default function Dashboard({ isLoggedIn, onOpenAuth }) {
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
    //applied_at: "",
    source: "",
    notes: "",
  });
  const [createError, setCreateError] = useState("");

  const [createLoading, setCreateLoading] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

  const [hoveredButton, setHoveredButton] = useState(null);

  const expandedCardRef = useRef(null);

  const filterHoverTimeout = useRef(null);

  const interviewHoverTimeout = useRef(null);
  const interviewLeaveTimeout = useRef(null);
  const [isInterviewBeanOpen, setIsInterviewBeanOpen] = useState(false);

  const [isInterviewPopupOpen, setIsInterviewPopupOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ date: "", time: "" });
  const [pendingCreateData, setPendingCreateData] = useState(null);

  // ----------------- Filter states ---------------------
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState("");

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

//Keyboard shortcut : press "N" to open Add Application modal,
// Disabled when user is typing in a field or modal is already open
  useEffect(() => {
  function handleKeyDown(e) {
    if (e.key === 'n' || e.key === 'N') {
      const tag = document.activeElement.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (isCreateOpen) return;
      setIsCreateOpen(true);
    }
  }
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isCreateOpen]);


  // ── Filtered applications (derived) ───────────
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (filterSearch.trim()) {
        const q = filterSearch.trim().toLowerCase();
        if (
          !app.company?.toLowerCase().includes(q) &&
          !app.role?.toLowerCase().includes(q)
        )
          return false;
      }

      if (filterStatuses.length > 0) {
        if (!filterStatuses.includes(app.status)) return false;
      }

      if (filterDateFrom) {
        if (!app.applied_at) return false;

        //  string comparison works for YYYY-MM-DD format
        const appDate = app.applied_at.split("T")[0]; // extracting date part only

        if (appDate < filterDateFrom) return false;
      }

      return true;
    });
  }, [applications, filterSearch, filterStatuses, filterDateFrom]);



// Status counts + response rate for the stats strip
const statusCounts = useMemo(() => {
  const applied   = applications.filter(a => a.status === "applied").length;
  const interview = applications.filter(a => a.status === "interview").length;
  const offer     = applications.filter(a => a.status === "offer").length;
  const rejected  = applications.filter(a => a.status === "rejected").length;
  const total     = applied + interview + offer + rejected;

  //Interviews + offers out of total =response rate
  const responseRate = total > 0 ? Math.round((interview + offer) / total * 100) : 0;

  return { applied, interview, offer, rejected, responseRate };
}, [applications]);

  const activeFilterCount =
    (filterSearch.trim() ? 1 : 0) +
    filterStatuses.length +
    (filterDateFrom ? 1 : 0);

  function toggleStatus(s) {
    setFilterStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  // To cleanr filters
  function clearAllFilters() {
    setFilterSearch("");
    setFilterStatuses([]);
    setFilterDateFrom("");
  }

  //upcoming interviews : interview status & date within 7 days or no date yet
  const upcomingInterviews = useMemo(() => {
    return applications
      .filter((app) => {
        if (app.status !== "interview") return false;
        if (!app.interview_date) return false;
        const daysUntil = Math.ceil(
          (new Date(app.interview_date) - new Date()) / (1000 * 60 * 60 * 24),
        );
        return daysUntil >= 0 && daysUntil <= 14; //within the next 14 days (2 weeks)
      })
      .sort(
        (a, b) => new Date(a.interview_date) - new Date(b.interview_date), // the soonest first
      );
  }, [applications]);

  //Returning urgency color class based on days until interview
  function getUrgencyClass(dateStr) {
    const daysUntil = Math.ceil(
      (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntil <= 1) return "urgency-red"; //today or tomorrow
    if (daysUntil <= 4) return "urgency-yellow"; //2 - 4 days
    return "urgency-green"; //5 - 7 days
  }

  // Formatting interview date ("Feb 20 · 2:00 PM" or  "Tomorrow" or "Today")
  function formatUpcomingDate(dateStr) {
    const date = new Date(dateStr);
    const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (daysUntil === 0) return `Today · ${time}`;
    if (daysUntil === 1) return `Tomorrow · ${time}`;
    return (
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      ` · ${time}`
    );
  }

  const activeChips = [
    ...(filterSearch.trim()
      ? [
          {
            label: `"${filterSearch.trim()}"`,
            onRemove: () => setFilterSearch(""),
          },
        ]
      : []),
    ...filterStatuses.map((s) => ({
      label: s,
      status: s,
      onRemove: () => toggleStatus(s),
    })),
    ...(filterDateFrom
      ? [
          {
            label: `From ${filterDateFrom}`,
            onRemove: () => setFilterDateFrom(""),
          },
        ]
      : []),
  ];

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

    if (!createFormData.company || !createFormData.role) {
      setCreateError("Company and role are required");
      return;
    }

    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000,
    );
    const dataToSubmit = {
      ...createFormData,
      applied_at: localDate.toISOString().split("T")[0],
    };

    if (createFormData.status === "interview") {
      setPendingCreateData(dataToSubmit);
      setIsCreateOpen(false);
      setIsInterviewPopupOpen(true);
      return;
    }

    await doCreateApplication(dataToSubmit);
  }

  async function doCreateApplication(data) {
    setCreateLoading(true);
    try {
      const newApplication = await applicationsAPI.create(data);
      setApplications((prev) => [newApplication, ...prev]);
      setIsCreateOpen(false); 
      setCreateFormData({
        company: "",
        role: "",
        status: "applied",
        location: "",
        source: "",
        notes: "",
      });
    } catch (err) {
      setCreateError(err.message || "Failed to create application");
    } finally {
      setCreateLoading(false);
    }
  }

  function handleCreateInterviewConfirm() {
    const interview_date =
      interviewForm.date && interviewForm.time
        ? `${interviewForm.date}T${interviewForm.time}`
        : interviewForm.date
          ? `${interviewForm.date}T00:00`
          : null;

    doCreateApplication({ ...pendingCreateData, interview_date });
    setIsInterviewPopupOpen(false);
    setPendingCreateData(null);
    setInterviewForm({ date: "", time: "" });
  }

  function handleCreateInterviewSkip() {
    doCreateApplication({ ...pendingCreateData, interview_date: null });
    setIsInterviewPopupOpen(false);
    setPendingCreateData(null);
    setInterviewForm({ date: "", time: "" });
  }

  // Handling deleting an application
  async function handleDeleteApplication(id) {
    try {
      await applicationsAPI.delete(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error("Error deleting application:", err);
      alert(err.message || "Failed to delete application");
    }
  }

  // Handling updating an application
  async function handleUpdateApplication(id, updatedData) {
    try {
      const updatedApplication = await applicationsAPI.update(id, updatedData);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updatedApplication : app)),
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
              Track your internship applications
              <br />
              in one place
            </span>

            {/* Mirror shine overlay */}
            <span className="dashboard-title-shine">
              Track your internship applications
              <br />
              in one place
            </span>
          </h1>

          <p className="dashboard-subtitle--hero">
            Save applications, track statuses, and manage your internship search
            with clarity.
          </p>

          {/* Enhanced CTAs */}
          <div className="dashboard-cta">
            <button
              className="btn-primary"
              onMouseEnter={() => setHoveredButton("login")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => onOpenAuth("login")}
              style={{
                background:
                  hoveredButton === "login"
                    ? "linear-gradient(135deg, #B38CA4 0%, #8B8378 100%)"
                    : "var(--bg-elevated)",
              }}
            >
              Login
            </button>
            <button
              className="btn-secondary"
              onMouseEnter={() => setHoveredButton("register")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => onOpenAuth("register")}
            >
              Register
            </button>
          </div>

          {/* Status count bar */}
          <div className="ghost-stats-strip">
            <div className="ghost-stat">
              <span className="ghost-stat-num">12</span>
              <span className="ghost-stat-label">Applied</span>
            </div>
            <div className="ghost-stat-divider" />
            <div className="ghost-stat">
              <span className="ghost-stat-num ghost-stat-num--interview">
                4
              </span>
              <span className="ghost-stat-label">Interviews</span>
            </div>
            <div className="ghost-stat-divider" />
            <div className="ghost-stat">
              <span className="ghost-stat-num ghost-stat-num--offer">2</span>
              <span className="ghost-stat-label">Offers</span>
            </div>
            <div className="ghost-stat-divider" />
            <div className="ghost-stat">
              <span className="ghost-stat-num ghost-stat-num--rejected">3</span>
              <span className="ghost-stat-label">Rejected</span>
            </div>
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

  // The Logged-in view
  return (
    <main className="dashboard">
      <div className="dashboard-container">
        {/* Header with expanding filter bar */}

        <h1 className="dashboard-title">Applications</h1>
        <p className="dashboard-subtitle">Your job search, all in one place.</p>
        <div className="dashboard-stats-strip">

          {/* Weekly Goal Bar */}
<WeeklyGoalBar applications={applications} />

  <div className="ghost-stat">
    <span className="ghost-stat-num">{statusCounts.applied || '—'}</span>
    <span className="ghost-stat-label">Applied</span>
  </div>
  <div className="ghost-stat-divider" />
  <div className="ghost-stat">
    <span className="ghost-stat-num ghost-stat-num--interview">{statusCounts.interview || '—'}</span>
    <span className="ghost-stat-label">Interviews</span>
  </div>
  <div className="ghost-stat-divider" />
  <div className="ghost-stat">
    <span className="ghost-stat-num ghost-stat-num--offer">{statusCounts.offer || '—'}</span>
    <span className="ghost-stat-label">Offers</span>
  </div>
  <div className="ghost-stat-divider" />
  <div className="ghost-stat">
    <span className="ghost-stat-num ghost-stat-num--rejected">{statusCounts.rejected || '—'}</span>
    <span className="ghost-stat-label">Rejected</span>
  </div>
  <div className="ghost-stat-divider" />
  <div className="ghost-stat">
    <span className="ghost-stat-num ghost-stat-num--rate">{statusCounts.responseRate ? `${statusCounts.responseRate}%` : '—'}</span>
    <span className="ghost-stat-label">Response</span>
  </div>
</div>
        <div className="dashboard-header">
          <div className="dashboard-header-actions">
            {/* Upcoming Interviews Bean (only shows when there are upcoming interviews)*/}

            {upcomingInterviews.length > 0 && (
              <div
                className={`interview-bean ${isInterviewBeanOpen ? "open" : ""}`}
                onMouseEnter={() => {
                  // Cancel any pending leave and open more quickly for responsive UX
                  clearTimeout(interviewLeaveTimeout.current);
                  clearTimeout(interviewHoverTimeout.current);
                  interviewHoverTimeout.current = setTimeout(
                    () => setIsInterviewBeanOpen(true),
                    30,
                  );
                }}
                onMouseLeave={() => {
                  // Delay the close a bit longer to avoid flicker when cursor moves
                  // between the trigger and expanded content
                  clearTimeout(interviewHoverTimeout.current);
                  interviewLeaveTimeout.current = setTimeout(
                    () => setIsInterviewBeanOpen(false),
                    300,
                  );
                }}
              >
                {/*Collapsed state : icon + count */}
                <div className="interview-bean-trigger">
                  <span className="interview-bean-label">Interviews</span>
                  <span className="interview-bean-count">
                    ({upcomingInterviews.length})
                  </span>
                </div>
                {/*Expanded state : interview list */}
                <div
                  className="interview-bean-content"
                  onMouseEnter={() => {
                    // ensure content hover keeps bean open
                    clearTimeout(interviewLeaveTimeout.current);
                    clearTimeout(interviewHoverTimeout.current);
                    interviewHoverTimeout.current = setTimeout(
                      () => setIsInterviewBeanOpen(true),
                      0,
                    );
                  }}
                  onMouseLeave={() => {
                    clearTimeout(interviewHoverTimeout.current);
                    interviewLeaveTimeout.current = setTimeout(
                      () => setIsInterviewBeanOpen(false),
                      300,
                    );
                  }}
                >
                  <div className="interview-bean-divider" />
                  <div className="interview-bean-list">
                    {upcomingInterviews.map((app, index) => (
                      <div
                        key={app.id}
                        className="interview-bean-item"
                        style={{ "--item-index": index }}
                      >
                        <span
                          className={`interview-urgency-dot ${getUrgencyClass(app.interview_date)}`}
                        />
                        <span className="interview-bean-company">
                          {app.company}
                        </span>
                        <span className="interview-bean-date">
                          {formatUpcomingDate(app.interview_date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/*The Hover-expanding filter bar */}
            <div
              className={`filter-bar ${isFilterOpen ? "open" : ""}`}
              onMouseEnter={() => {
                filterHoverTimeout.current = setTimeout(
                  () => setIsFilterOpen(true),
                  60,
                );
              }}
              onMouseLeave={() => {
                clearTimeout(filterHoverTimeout.current);
                setIsFilterOpen(false);
              }}
            >
              {/* Icon trigger */}
              <button className="filter-trigger" tabIndex={-1}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 2.5h12M3 7h8M5 11.5h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                {!isFilterOpen && <span className="filter-text">Filter</span>}

                {!isFilterOpen && activeFilterCount > 0 && (
                  <span className="filter-badge">{activeFilterCount}</span>
                )}
              </button>

              {/* Controls ,  revealed on hover */}
              <div className="filter-bar-controls">
                <div className="filter-bar-divider" />

                {/* Search */}
                <div className="filter-search-wrap">
                  <svg
                    className="filter-search-icon"
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                  >
                    <circle
                      cx="5.5"
                      cy="5.5"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M8.5 8.5L11 11"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    className="filter-input filter-search-input"
                    type="text"
                    placeholder="Company or role…"
                    value={filterSearch}
                    onChange={(e) => isFilterOpen && setFilterSearch(e.target.value)}
                    readOnly={!isFilterOpen}
                    tabIndex={isFilterOpen ? 0 : -1}
                  />
                  {filterSearch && (
                    <button
                      className="filter-clear-input"
                      onClick={() => setFilterSearch("")}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="filter-bar-divider" />

                {/* Status pills */}
                <div className="filter-status-pills">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      className={`filter-status-pill status-pill-${s} ${filterStatuses.includes(s) ? "selected" : ""}`}
                      onClick={() => toggleStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="filter-bar-divider" />

                {/* Date filter */}

                <input
                  className="filter-input filter-date-input"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => isFilterOpen && setFilterDateFrom(e.target.value)}
                  readOnly={!isFilterOpen}
                  tabIndex={isFilterOpen ? 0 : -1}
                />

                {activeFilterCount > 0 && (
                  <>
                    <div className="filter-bar-divider" />
                    <button
                      className="filter-clear-all"
                      onClick={clearAllFilters}
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => setIsCreateOpen(true)}
            >
              + Add Application <span className="kbd-hint">N</span>
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="filter-chips-row">
            {activeChips.map((chip, i) => (
              <span
                key={i}
                className={`filter-chip ${chip.status ? `filter-chip-${chip.status}` : ""}`}
              >
                {chip.label}
                <button className="filter-chip-remove" onClick={chip.onRemove}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Loading*/}
        {loading && (
          <div className="dashboard-loading">
            <div className="loading-spinner" />
            <p>Loading applications...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="dashboard-error">
            <p>Error: {error}</p>
            <button className="btn-secondary" onClick={fetchApplications}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty ,  no applications at all */}
        {!loading && !error && applications.length === 0 && (
          <div className="dashboard-empty">
            <p className="empty-message">No applications yet</p>
            <p className="empty-subtitle">
              Click "Add Application" to track your first internship application
            </p>
          </div>
        )}

        {/* Empty , filters produced no results */}
        {!loading &&
          !error &&
          applications.length > 0 &&
          filteredApplications.length === 0 && (
            <div className="dashboard-empty filter-no-results">
              <p className="empty-message">No matches</p>
              <p className="empty-subtitle">
                Try adjusting or clearing your filters
              </p>
              <button
                className="btn-secondary"
                style={{ marginTop: "12px" }}
                onClick={clearAllFilters}
              >
                Clear filters
              </button>
            </div>
          )}

        {/* Applications grid */}
        {!loading && !error && filteredApplications.length > 0 && (
          <div className="dashboard-grid">
            {filteredApplications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                style={{ animationDelay: `${index * 60}ms` }}
                id={app.id}
                company={app.company}
                role={app.role}
                status={app.status}
                location={app.location}
                appliedAt={app.applied_at}
                source={app.source}
                notes={app.notes}
                interviewDate={app.interview_date}
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

      {/* Add Application Modal*/}
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
                <div className="form-error-message">{createError}</div>
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
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInterviewPopupOpen && (
        <div className="confirm-overlay">
          <div className="confirm-dialog interview-popup">
            <h3>When is your interview?</h3>
            <p>Add the date and time so we can remind you.</p>

            <div className="auth-form">
              <div className="auth-field">
                <label>Date</label>
                <input
                  type="date"
                  value={interviewForm.date}
                  min={new Date().toISOString().split("T")[0]}
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
                onClick={handleCreateInterviewSkip}
              >
                Add later
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateInterviewConfirm}
                disabled={!interviewForm.date}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} // end of Dashboard function

// Enhanced Ghost Card Component
function EnhancedGhostCard({ index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`ghost-card ${isHovered ? "hovered" : ""}`}
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
