import { useState , useRef , useEffect  } from "react";
import ApplicationCard from "../components/ApplicationCard/ApplicationCard"
import "./Dashboard.css";


{
  /*hardcoded applications*/
}
const INITIAL_APPLICATIONS = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineering Intern",
    status: "applied",
    location: "Remote",
    appliedAt: "2025-01-02",
    source: "Careers page",
    notes: "Applied with referral. Focus on systems + DSA.",
  },
  {
    id: 2,
    company: "Shopify",
    role: "Frontend Intern",
    status: "interview",
    location: "Canada",
    appliedAt: "2025-01-10",
    source: "LinkedIn",
    notes: "First-round completed. Waiting for feedback.",
  },
  {
    id: 3,
    company: "Amazon",
    role: "SDE Intern",  
    status: "rejected",
    location: "Vancouver",
    appliedAt: "2024-12-20",
    source: "Online assessment",
    notes: "OA passed, rejection after interview.",
  },
];

export default function Dashboard({ isLoggedIn, onOpenAuth  }) {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  const [expandedId, setExpandedId] = useState(null);

  const [hoveredButton, setHoveredButton] = useState(null);

  const expandedCardRef = useRef(null);

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



  // Handling deleting an application
  function handleDeleteApplication(id) {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  }

  // Handling updating an application
  function handleUpdateApplication(id, updatedData) {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updatedData } : app))
    );
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

          {/* Enhanced glassmorphic Cards*/}
          <div className="ghost-grid">
            {[1, 2, 3].map((i) => (
              <EnhancedGhostCard key={i} index={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // The Logged-in view (rendering existing cards hard-coded )
  return (
    <main className="dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Applications</h1>

        <div className="dashboard-grid">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              id={app.id}
              company={app.company}
              role={app.role}
              status={app.status}
              location={app.location}
              appliedAt={app.appliedAt}
              source={app.source}
              notes={app.notes}
              isExpanded={expandedId === app.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === app.id ? null : app.id))
              }
              onDelete={() => handleDeleteApplication(app.id)}
              onEdit={(updatedData) => handleUpdateApplication(app.id, updatedData)}
              cardRef={expandedId === app.id ? expandedCardRef : null}
            />
          ))}
        </div>
      </div>
    </main>
  );
}


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