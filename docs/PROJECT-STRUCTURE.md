# Project Structure

This file documents the current repository layout and the purpose of key files and folders.

```
job-application-tracker/
├── README.md                   # Project README 
├── index.html                  # Vite HTML entry
├── package.json                # Frontend scripts & deps
├── vite.config.js              # Vite config
├── eslint.config.js            # ESLint configuration
├── public/
│   |── jat.svg                 # App icon/ public assets
│   └── jat-logo.png            # Logo
│
├── src/                        # React frontend
│   ├── main.jsx                # React entry (mounts App)
│   ├── App.jsx                 # Root app wiring (auth/profile modals)
│   ├── index.css               # Global CSS variables & styles
│   ├── styles/
│   │   └── buttons.css         # Shared button styles
│   ├── layout/
│   │   ├── Navbar.jsx          # Top navigation
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard UI (applications grid, filters, stats)
│   │   └── Dashboard.css
│   ├── components/
│   │   ├── ApplicationCard/    # Individual job card (expandable, edit/delete)
│   │   │   ├── ApplicationCard.jsx
│   │   │   └── ApplicationCard.css
│   │   ├── WeeklyGoalBar/      # WeeklyGoalBar component
│   │   │   ├── WeeklyGoalBar.jsx
│   │   │   └── WeeklyGoalBar.css
│   │   └── modals/             # AuthModal, ProfileModal, shared modal styles
│   │       ├── AuthModal.jsx
│   │       ├── ProfileModal.jsx
│   │       └── Modal.css
│   └── services/
│       └── api.js              # Frontend API helpers(applicationsAP authAPI)
│
├── server/                     # Node/Express backend
│   ├── server.js               # Express app entry point
│   ├── package.json            # Server scripts & deps
│   ├── .env.example            # Example env vars
│   ├── config/
│   │   └── database.js         # PostgreSQL connection (pool)
│   ├── database/
│   │   └── schema.sql          # SQL schema / table definitions
│   ├── jobs/
│   │   └── reminderJob.js      # Scheduled job to send interview reminders
│   ├── services/
│   │   └── emailService.js     # Email sending helpers used by jobs/routes
│   ├── routes/
│   │   ├── applications.js     # CRUD API for applications
│   │   └── authRoutes.js       # Register / login / profile / delete account
│   └── middleware/
│       ├── authenticateToken.js# JWT authentication middleware
│       └── validateIdParam.js  # ID param validation middleware
│
└── docs/
    └── PROJECT-STRUCTURE.md   # (this file)
```
