const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticateToken = require('../middleware/authenticateToken');
const { uploadResume, deleteResume } = require('../services/storageService');
const pool = require('../config/database');

// Store file in memory 
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, //5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// POST /api/resumes/:applicationId , upload resume
router.post('/:applicationId', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    // verifying application belongs to user
    const appCheck = await pool.query(
      'SELECT id, resume_url FROM applications WHERE id = $1 AND user_id = $2',
      [applicationId, userId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // delete old resume if exists
    const oldUrl = appCheck.rows[0].resume_url;
    if (oldUrl) await deleteResume(oldUrl);

    // upload new resume
    const resumeUrl = await uploadResume(req.file, userId, applicationId);

    // save URL to database
    await pool.query(
'UPDATE applications SET resume_url = $1 WHERE id = $2',
[resumeUrl, applicationId]
    );


    res.json({ message: 'Resume uploaded successfully', resume_url: resumeUrl });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});



// DELETE /api/resumes/:applicationId ,  delete resume
router.delete('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    const appCheck = await pool.query(
      'SELECT resume_url FROM applications WHERE id = $1 AND user_id = $2',
      [applicationId, userId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const resumeUrl = appCheck.rows[0].resume_url;
    if (!resumeUrl) {
      return res.status(404).json({ message: 'No resume found' });
    }


    await deleteResume(resumeUrl);

    await pool.query(
'UPDATE applications SET resume_url = NULL WHERE id = $1',
[applicationId]
    );


    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Resume delete error:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;