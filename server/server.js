// ==========================================
// JOB TRACKER BACKEND SERVER
// ==========================================

// Importing required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/database');

// load environment variables from .env file
dotenv.config();

// Debug: Log environment variables (TEMPORARILY , remove after fixing)
console.log('Environment Variables:');
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_PASSWORD value:', process.env.DB_PASSWORD);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);

// creating Express application
const app = express();

// Step 4: Set the port number (Uses PORT from .env )
const PORT = process.env.PORT || 5000;


// ==========================
//  MIDDLEWARES
// =========================

// CORS (allows the react app [running on port 5173] to talk to this server[port 5000])
app.use(cors());

// JSON Parser (Converts incoming JSON data into javaScript objects accessible as req.body.email)
app.use(express.json());



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

// Roots to be implemented:
// - POST /api/auth/register - Create new user account
// - POST /api/auth/login -  Login existing user
// - GET /api/applications - Get all applications for logged-in user
// - POST /api/applications  - Create new application
// - PUT /api/applications/:id - Update an application
// - DELETE /api/applications/:id -  Delete an application


// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (catches requests to routes that dont exist)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
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