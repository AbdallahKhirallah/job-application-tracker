import { useState , useRef , useEffect  } from "react";
import ApplicationCard from "../components/ApplicationCard";

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

export default function Dashboard({ isLoggedIn }) {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  const [expandedId, setExpandedId] = useState(null);

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

  // The Logged-out view
  if (!isLoggedIn) {
    return (
      <main className="dashboard dashboard-empty">
        <h1 className="dashboard-title">
          Track your internship applications in one place
        </h1>

        <p className="dashboard-subtitle">
          Save applications, track statuses, and manage your internship search
          with clarity.
        </p>

        <div className="dashboard-cta">
          <button className="btn-primary">Login</button>
          <button className="btn-secondary">Register</button>
        </div>

        <div className="ghost-grid">
          <div className="ghost-card" />
          <div className="ghost-card" />
          <div className="ghost-card" />
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
              cardRef={expandedId === app.id ? expandedCardRef : null}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
