# Project Structure

This file documents the current repository layout and the purpose of key files and folders.

```
job-application-tracker/
├── README.md                         # Project README
├── index.html                        # Vite HTML entry
├── package.json                      # Frontend scripts & deps
├── package-lock.json
├── vite.config.js                    # Vite config
├── eslint.config.js                  # ESLint configuration
├── .gitignore
├── .env.local                        # Local dev env overrides (not committed)
├── public/
│   ├── jat.svg                       # App icon
│   └── jat-logo.png                  # Logo
│
├── src/                              # React frontend
│   ├── main.jsx                      # React entry (mounts App)
│   ├── App.jsx                       # Root app wiring (auth/profile modals)
│   ├── index.css                     # Global CSS variables & styles
│   ├── styles/
│   │   └── buttons.css               # Shared button styles
│   ├── layout/
│   │   ├── Navbar.jsx                # Top navigation
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Dashboard.jsx             # Main dashboard UI (applications grid, filters, stats)
│   │   └── Dashboard.css
│   ├── components/
│   │   ├── ApplicationCard/          # Individual job card (expandable, edit/delete/resume)
│   │   │   ├── ApplicationCard.jsx
│   │   │   └── ApplicationCard.css
│   │   ├── WeeklyGoalBar/            # Weekly goal progress bar
│   │   │   ├── WeeklyGoalBar.jsx
│   │   │   └── WeeklyGoalBar.css
│   │   └── modals/                   # Auth, Profile modals
│   │       ├── AuthModal.jsx
│   │       ├── ProfileModal.jsx
│   │       └── Modal.css
│   └── services/
│       └── api.js                    # Frontend API helpers (authAPI, applicationsAPI, resumeAPI)
│
├── server/                           # Node/Express backend
│   ├── server.js                     # Express app entry point
│   ├── package.json                  # Server scripts & deps
│   ├── package-lock.json
│   ├── .env                          # Server env vars (not committed)
│   ├── .env.example                  # Example env vars template
│   ├── config/
│   │   └── database.js               # PostgreSQL connection (pool)
│   ├── database/
│   │   └── schema.sql                # SQL schema / table definitions
│   ├── jobs/
│   │   └── reminderJob.js            # Scheduled job — sends interview reminder emails
│   ├── services/
│   │   ├── emailService.js           # Email sending helpers (SendGrid)
│   │   └── storageService.js         # DigitalOcean Spaces upload/delete helpers
│   ├── routes/
│   │   ├── applications.js           # CRUD API for job applications
│   │   ├── authRoutes.js             # Register / login / profile / delete account
│   │   └── resumes.js                # Resume upload and delete endpoints
│   └── middleware/
│       ├── authenticateToken.js      # JWT authentication middleware
│       └── validateIdParam.js        # ID param validation middleware
│
└── docs/
    └── PROJECT-STRUCTURE.md          # (this file)
```
