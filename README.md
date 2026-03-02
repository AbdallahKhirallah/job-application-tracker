now ?



```markdown
# JAT — Job Application Tracker

A full-stack web app to track your job search from first apply to final offer. Log applications, monitor statuses, manage interviews, and stay on top of your weekly goals, all in one place.


------------------------------------------------------------------------------

## Features

### Authentication
- Register and log in with JWT-based authentication
- Secure protected routes on both frontend and backend
- Delete your own account permanently from your profile

### Application Management
- Add, edit, and delete job applications
- Track company, role, date applied, and current status
- Attach notes to individual applications for context

### Status Tracking
- Move applications through custom statuses (e.g. Applied, Interview, Offer, Rejected)
- Visual status indicators on each application card

### Interviews
- Expandable interview button to view upcoming interviews at a glance with date and time details
- When changing status to "Interview", the edit modal prompts for an optional interview date/time (optional)
- After an interview date passes, a prompt appears on the card to mark the outcome as Offer or Rejected
- Server-side scheduled job that emails interview reminders (runs daily at 8:00 AM, sends reminders 7 and 2 days before interviews)

### Dashboard & Stats
- Overview of your full application pipeline
- Key metrics: total applications, response rate, interview conversions
- Weekly goal progress bar to keep your momentum going

### Filter & Search
- Filter applications by status
- Search by company name or role


### UX & Interactions
- **Click-to-copy fields** — click company or role on a card to copy it to clipboard with instant "Copied" feedback
- **Keyboard shortcut** — press `N` to open the Add Application modal (disabled while typing in inputs)
- **Confirmation safety for delete actions** — delete application has a confirmation dialog, delete account requires typing `DELETE` and entering your password

### Profile
- Change password, edit profile info, and delete account from the Profile modal

### Resume Storage *(coming)*
- Store application-tailored resumes per application card  (not functional yet)


-------------------------------------------------------------------------------------------------


## Tech Stack

#-----------------------------#
| Layer    | Technology       |
|----------|------------------|
| Frontend | React, Vite      |
|----------|------------------|
| Backend  | Node.js, Express |
|----------|------------------|
| Database | PostgreSQL       |
|----------|------------------|
| Auth     | JWT              |
|----------|------------------|
| Styling  | CSS Modules      |
#-----------------------------#


-------------------------------------------------------------------------------------------------

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL

### 1. Clone the repo
```bash
git clone https://github.com/AbdallahKhirallah/job-application-tracker.git
cd job-application-tracker
```

### 2. Set up the backend
```bash
cd server
cp .env.example .env        #Fill in your DB credentials and JWT secret
npm install
```

Create the database and run the schema:
```bash
psql -U youruser -d yourdb -f database/schema.sql
```

Start the server:
```bash
node server.js
```

### 3. Set up the frontend
```bash
cd ..
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5001` (or your configured port).

---

## Environment Variables

Create `server/.env` based on `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jat
DB_USER=youruser
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret
PORT=3000
```

-------------------------------------------------------------------------------------------------

## Project Structure

See [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md) for the full folder breakdown.


-------------------------------------------------------------------------------------------------

## License

MIT
```