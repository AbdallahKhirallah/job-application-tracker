// ========================================
// APPLICATIONS ROUTES
// ========================================
// This file handles all job application CRUD operations

const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Creating a router to handle application routes
const router = express.Router();



// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware runs BEFORE any route that needs authentication
// It checks if the user has a valid token and extracts their user ID


const authenticateToken = (req, res, next) => {
  // Getting the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Gets the token part after "Bearer "


  // If no token is provided
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied, No token provided.' 
    });
  }

  try {
    // Verifying the token using the secret key , if valid, jwt.verify returns the decoded payload(which contains userId )
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attaching the user ID to the request object
    req.userId = decoded.userId;
    
    // next middleware or route handler
    next();

  } catch (error) {

    // Token is invalid or expired
    return res.status(403).json({ 
      message: 'Invalid or expired token' 
    });
  }
};

// ==============================================
// GETTING ALL APPLICATIONS FOR LOGGED-IN USER
// ==============================================
// GET /api/applications
// Returns all job applications that belong to the logged-in user

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Query to the database for all applications belonging to the user
    //req.userId comes from the authenticateToken middleware
    const applications = await pool.query(
      `SELECT 
        id, 
        company, 
        role, 
        status, 
        location, 
        applied_at, 
        source, 
        notes, 
        created_at, 
        updated_at
      FROM applications 
      WHERE user_id = $1 
      ORDER BY created_at DESC`, // Newest applications first
      [req.userId]
    );

    // Returning the applications array (applications.rows)
    res.json({
      success: true,
      count: applications.rows.length,
      applications: applications.rows

    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      message: 'Error fetching applications',
      error: error.message 
    });
  }
});

// ============================================
// GET SINGLE APPLICATION BY ID
// ============================================
// GET /api/applications/:id
// Returns a specific application if it belongs to the logged-in user

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Getting the application ID from the URL parameter
    const { id } = req.params;

    // Query for the specific  application
    // We check BOTH the id AND user_id to ensure: The application exists and It belongs to the logged-in user
    const application = await pool.query(
      `SELECT 
        id, 
        company, 
        role, 
        status, 
        location, 
        applied_at, 
        source, 
        notes, 
        created_at, 
        updated_at
      FROM applications 
      WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );

    // If no application found
    if (application.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Application not found or you do not have permission to view it' 
      });
    }

    // Returning the single application
    res.json({
      success: true,
      application: application.rows[0]
    });


  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ 
      message: 'Error fetching application',
      error: error.message 
    });
  }
});

// ============================================
// CREATE NEW APPLICATION
// ============================================
// POST /api/applications
// Creates a new job application for the logged in user

router.post('/', authenticateToken, async (req, res) => {
  try {
    // Getting data from request body
    const { company, role, status, location, applied_at, source, notes } = req.body;

    // Input validation, to ensure required fields are provided
    if (!company || !role) {
      return res.status(400).json({ 
        message: 'Company and role are required fields' 
      });
    }

    // Validating status ,only allowing specific status values
    const validStatuses = ['applied', 'interview', 'offer', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: applied, interview, offer, rejected' 
      });
    }

    // Inserting new application into database
    const newApplication = await pool.query(
      `INSERT INTO applications 
        (user_id, company, role, status, location, applied_at, source, notes) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        req.userId,                    // $1  from the token
        company,                       // $2  required
        role,                          // $3  required
        status || 'applied',           // $4  default is "applied" 
        location || null,              // $5  optional
        applied_at || null,            // $6  optional
        source || null,                // $7  optional
        notes || null                  // $8  optional
      ]
    );

    // Return the newly created application
    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application: newApplication.rows[0]
    });


  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ 
      message: 'Error creating application',
      error: error.message 
    });
  }
});

