// ==========================================
// JOB TRACKER BACKEND SERVER
// ==========================================

// Importing required packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const pool = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const applicationsRoutes = require('./routes/applications');
// Importing this file also registers the daily 8:00 AM interview-reminder cron job.
const { checkAndSendReminders } = require('./jobs/reminderJob');

// load environment variables from .env file
dotenv.config();

// Fail fast if JWT_SECRET is missing (security-critical)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set in .env and be at least 32 characters.');
  process.exit(1);
}

// creating Express application
const app = express();

// Step 4: Set the port number (Uses PORT from .env )
const PORT = process.env.PORT || 5000;


// ==========================
//  MIDDLEWARES
// =========================

// Security headers
app.use(helmet());

// CORS — FRONTEND_URL may be a single origin or a comma-separated list
// (e.g. "https://trackjat.me,https://www.trackjat.me").
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

  console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser clients (curl, health checks) with no Origin header
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// JSON Parser (Converts incoming JSON data into javaScript objects accessible as req.body.email)
app.use(express.json({ limit: '32kb' }));

// Rate limit: general API (all endpoints)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                  // 300 requests per window per IP
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Rate limit: auth endpoints (stricter to prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,                   // 30 login/register attempts per 15 min per IP
  message: { message: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);



// ======================================
// TESTING ROUTES
// ======================================

// basic testing route
app.get('/', (req, res) => {
  res.json({
    message: 'Job Tracker API is  running!',
    status: 'active',
    timestamp: new Date()

  });
});

// Lightweight health check (no DB) — used by uptime pingers to keep the
// free-tier host awake.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Externally-triggerable reminder run. On hosts that sleep (Render free tier)
// the in-process 8 AM cron may not fire, so an external scheduler can hit this
// endpoint daily. Protected by a shared secret.
app.post('/api/cron/reminders', async (req, res) => {
  const token = req.get('x-cron-secret') || req.query.secret;
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    await checkAndSendReminders();
    res.json({ message: 'Reminder run completed' });
  } catch (error) {
    console.error('Manual reminder run failed:', error);
    res.status(500).json({ message: 'Reminder run failed' });
  }
});

// testing database connection
app.get('/api/test-db', async (req, res) => {
  try {
    // trying to run a simple query
    const result = await pool.query('SELECT NOW()');
    
    res.json({ 
      message: 'Database  connection successful!',
      timestamp: result.rows[0].now
    });
  } 
  catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// ============================================
// API ROUTES (TO BE ADDED)
// ============================================

 // Authentication routes (register, login)
// All routes in authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Applications routes (CRUD operations for job applications)
// Routes in applicationsRoutes prefixed with /api/applications
// Connecting  applications routes
app.use('/api/applications', applicationsRoutes);

const resumeRoutes = require('./routes/resumes');
app.use('/api/resumes', resumeRoutes);

// Routes :
// - POST   /api/auth/register            - Register new user
// - POST   /api/auth/login               - Login existing user
// - GET    /api/applications             - Get all applications for logged in user
// - GET    /api/applications/:id         - Get single application by ID
// - POST   /api/applications             - Create new application
// - PUT    /api/applications/:id         - Update an application
// - DELETE /api/applications/:id         - Delete an application
// - POST /api/resumes/:applicationId     — upload resume
// - DELETE /api/resumes/:applicationId   — delete resume


// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (catches requests to routes that dont exist)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (do not leak error details in production)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// ============================================
// STARTING THE SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
  
      Job Tracker Server Running         
      http://localhost:${PORT}           
      PostgreSQL database Ready          
  
  `);
});


// ===============================
// TO GRACEFULLY SHUTDOWN
// ===============================
// properly closing database connections when server stops

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
  });
  process.exit(0);
});