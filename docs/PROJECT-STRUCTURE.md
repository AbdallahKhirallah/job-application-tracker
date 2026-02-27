the project strucrture i put in an other file :PROJECT-STRUCTURE.md:

```markdown
## Project Structure

```
job-application-tracker/
├── index.html                  # Vite entry point
├── vite.config.js
├── package.json
├── eslint.config.js
│
├── public/
│   └── jat.svg                 # App icon
│
├── src/                        # React frontend
│   ├── main.jsx                # App entry
│   ├── App.jsx                 # Root component & routing
│   ├── index.css
│   ├── styles/
│   │   └── buttons.css
│   ├── layout/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard view
│   │   └── Dashboard.css
│   ├── components/
│   │   ├── ApplicationCard/    # Individual job card with expandable interviews
│   │   ├── WeeklyGoalBar/      # Weekly application goal tracker
│   │   └── modals/             # Auth modal, Profile modal
│   └── services/
│       └── api.js              # Axios/fetch API calls to backend
│
├── server/                     # Node/Express backend
│   ├── server.js               # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── database.js         # PostgreSQL connection
│   ├── database/
│   │   └── schema.sql          # DB schema definitions
│   ├── routes/
│   │   ├── applications.js     # CRUD routes for applications
│   │   └── authRoutes.js       # Register / login / delete account
│   └── middleware/
│       ├── authenticateToken.js  # JWT verification
│       └── validateIdParam.js    # Route param validation
│
└── docs/
    └── PROJECT-STRUCTURE.md
```

```