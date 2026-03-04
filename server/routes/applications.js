// ========================================
// APPLICATIONS ROUTES
// ========================================
// This file handles all job application CRUD operations

const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/authenticateToken');
const validateIdParam = require('../middleware/validateIdParam');

// Creating a router to handle application routes
const router = express.Router();

// Sanitize string for DB: trim and enforce max length
function trimMax(str, maxLen) {
  if (str == null || typeof str !== 'string') return null;
  const t = str.trim().slice(0, maxLen);
  return t === '' ? null : t;
}

// Parse ISO date string (YYYY-MM-DD) or return null if invalid
function parseDateOnly(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : s;
}






// ==============================================
// GETTING ALL APPLICATIONS FOR LOGGED-IN USER
// ==============================================
// GET /api/applications/
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
        interview_date,
        resume_url,
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
      message: 'Error fetching applications'
    });
  }
});

// ============================================
//  GET APPLICATIONS STATISTICS (must be before /:id)
// ============================================
// GET /api/applications/stats/summary

router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM applications WHERE user_id = $1 GROUP BY status`,
      [req.userId]
    );
    const total = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE user_id = $1',
      [req.userId]
    );
    const statusCounts = {};
    stats.rows.forEach(row => {
      statusCounts[row.status] = parseInt(row.count, 10);
    });
    res.json({
      success: true,
      stats: {
        total: parseInt(total.rows[0].count, 10),
        byStatus: statusCounts
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      message: 'Error fetching statistics'
    });
  }
});

// ============================================
// GET SINGLE APPLICATION BY ID
// ============================================
// GET /api/applications/:id
// Returns a specific application if it belongs to the logged-in user

router.get('/:id', validateIdParam, authenticateToken, async (req, res) => {
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
        interview_date,
        resume_url,
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
      message: 'Error fetching application'
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
    const raw = req.body;
    const company = trimMax(raw.company, 200);
    const role = trimMax(raw.role, 200);
    const status = raw.status != null ? String(raw.status).trim().toLowerCase() : 'applied';
    const location = trimMax(raw.location, 200);
    const source = trimMax(raw.source, 200);
    const notes = trimMax(raw.notes, 10000); // TEXT field
    const applied_at = parseDateOnly(raw.applied_at);
    const interview_date = raw.interview_date != null && raw.interview_date !== ''
      ? parseDateOnly(String(raw.interview_date).slice(0, 10))
      : null;

    if (!company || !role) {
      return res.status(400).json({
        message: 'Company and role are required fields'
      });
    }

    const validStatuses = ['applied', 'interview', 'offer', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: applied, interview, offer, rejected'
      });
    }

    const newApplication = await pool.query(
      `INSERT INTO applications 
        (user_id, company, role, status, location, applied_at, source, notes, interview_date)  
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [req.userId, company, role, status, location, applied_at, source, notes, interview_date]
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
      message: 'Error creating application'
    });
  }
});

// ============================================
// UPDATE APPLICATION
// ============================================
// PUT /api/applications/:id
// Updates an existing application ( if it belongs to the logged in user)

router.put('/:id', validateIdParam, authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body;

    const existingApp = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (existingApp.rows.length === 0) {
      return res.status(404).json({
        message: 'Application not found or you do not have permission to update it'
      });
    }

    const validStatuses = ['applied', 'interview', 'offer', 'rejected'];
    const status = raw.status != null ? String(raw.status).trim().toLowerCase() : null;
    if (status !== null && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: applied, interview, offer, rejected'
      });
    }

    const company = raw.company !== undefined ? trimMax(raw.company, 200) : null;
    const role = raw.role !== undefined ? trimMax(raw.role, 200) : null;
    const location = raw.location !== undefined ? trimMax(raw.location, 200) : null;
    const source = raw.source !== undefined ? trimMax(raw.source, 200) : null;
    const notes = raw.notes !== undefined ? trimMax(raw.notes, 10000) : null;
    const applied_at = raw.applied_at !== undefined ? parseDateOnly(raw.applied_at) : null;
    const interview_date = raw.interview_date !== undefined
      ? (raw.interview_date != null && raw.interview_date !== ''
          ? parseDateOnly(String(raw.interview_date).slice(0, 10))
          : null)
      : undefined;

    const updatedApplication = await pool.query(
      `UPDATE applications 
      SET 
        company = COALESCE($1, company),
        role = COALESCE($2, role),
        status = COALESCE($3, status),
        location = COALESCE($4, location),
        applied_at = COALESCE($5, applied_at),
        source = COALESCE($6, source),
        notes = COALESCE($7, notes),
        interview_date = $8,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $9 AND user_id = $10  
      RETURNING *`,
      [company, role, status, location, applied_at, source, notes, interview_date === undefined ? existingApp.rows[0].interview_date : interview_date, id, req.userId]
    );

    res.json({
      success: true,
      message: 'Application updated successfully',
      application: updatedApplication.rows[0]
    });

  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      message: 'Error updating application'
    });
  }
});

// ============================================
//  DELETE APPLICATION
// ============================================
// DELETE /api/applications/:id
// Deletes an application (if it belongs to the logged in user)

router.delete('/:id', validateIdParam, authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the application
    // checking user_id to ensure the user can only delete their own applications
    const deletedApplication = await pool.query(
      'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    // If no rows were deleted, the application didn't exist or doesn't belong to user
    if (deletedApplication.rows.length === 0) {
      return res.status(404).json({
        message: 'Application not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully',
      deletedApplication: deletedApplication.rows[0]
    });


  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      message: 'Error deleting application'
    });
  }
});



// Export the router so server.js can use it
module.exports = router;