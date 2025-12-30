import { useState } from "react";
import ApplicationCard from "../components/ApplicationCard";

{
  /*hardcoded applications*/
}
const INITIAL_APPLICATIONS = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineering Intern",
    status: "Applied",
    location: "Remote",
    appliedAt: "2025-01-02",
  },
  {
    id: 2,
    company: "Shopify",
    role: "Frontend Intern",
    status: "Interview",
    location: "Canada",
    appliedAt: "2025-01-10",
  },
  {
    id: 3,
    company: "Amazon",
    role: "SDE Intern",
    status: "Rejected",
    location: "Vancouver",
    appliedAt: "2024-12-20",
  },
];

export default function Dashboard({ isLoggedIn }) {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

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
            status={app.status.toLowerCase()}
          />
        ))}
      </div>
      </div>
    </main>
  );
}
