export default function ApplicationCard({ company, role, status }) {
  return (
    <article className="app-card">
      <header className="app-card-header">
        <h2 className="app-card-company">{company}</h2>

        <span className={`status-badge status-${status}`}>
          {status}
        </span>
      </header>

      <div className="app-card-body">
        <p className="app-card-role">{role}</p>
      </div>

      <footer className="app-card-footer">
        {/*reserved for date, location, actions later */}
      </footer>
    </article>
  );
}
