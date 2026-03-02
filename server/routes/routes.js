// ============================================
// RESUME UPLOAD ROUTE
// ============================================

// This file handles uploading a resume file to DigitalOcean Spaces (S3-compatible storage)
// and saving the file URL to the application in the db

const express = require("express");
const multer = require("multer");

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const pool = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");
const validateIdParam = require("../middleware/validateIdParam");

const router = express.Router();

// ==============================================
//  S3 CLIENT SETUP(DigitalOcean Spaces)
// ===============================================
// Spaces is S3-compatible, using the AWS SDK
// and pointing it to DigitalOcean's endpoint instead of AWS

const s3 = new S3Client({
  endpoint: `https://${process.env.SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.SPACES_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
});

// ============================================
//    MULTER SETUP
// ============================================
// Multer handles the file coming in from the frontend

const upload = multer({
  storage: multer.memoryStorage(),

  // allowing PDF, DOC, DOCX files
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true); // accept file
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },

  // max file size : 5MB
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ============================================
// UPLOAD RESUME
// ============================================
// POST /api/uploads/resume/:id
// Uploads a resume file to spaces and saves the URL to the application

router.post(
  "/resume/:id",
  validateIdParam,
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // confirming file was sent
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // check this application belongs to the logged user
      const app = await pool.query(
        "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
        [id, req.userId],
      );

      if (app.rows.length === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      // If theres already a resume, delete the old one from Spaces first
      if (app.rows[0].resume_url) {
        const oldKey = app.rows[0].resume_url.split("/").pop(); // extract filename from URL
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.SPACES_BUCKET,
            Key: `resumes/${oldKey}`,
          }),
        );
      }

      // Creating a unique filename : userId_applicationId_timestamp.ext
      const ext = req.file.originalname.split(".").pop();
      const filename = `${req.userId}_${id}_${Date.now()}.${ext}`;

      // Uploading the file to DigitalOcean Spaces
      // The Upload class handles large files by streaming them in chunks
      const parallelUpload = new Upload({
        client: s3,
        params: {
          Bucket: process.env.SPACES_BUCKET,
          Key: `resumes/${filename}`, // filename inside the bucket
          Body: req.file.buffer, // the file content from memory
          ContentType: req.file.mimetype,
          ACL: "public-read", // make the file publicly accessible via URL
        },
      });

      await parallelUpload.done();

      // the public URL for the uploaded file
      const fileUrl = `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/resumes/${filename}`;

      // Saving the URL to the application row in the db
      await pool.query(
        "UPDATE applications SET resume_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [fileUrl, id],
      );

      res.json({
        success: true,
        message: "Resume uploaded successfully",
        resume_url: fileUrl,
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      res.status(500).json({ message: "Error uploading resume" });
    }
  },
);

// ============================================
// DELETE RESUME
// ============================================
// DELETE /api/uploads/resume/:id
// Removes the resume from Spaces and clears the URL from the db

router.delete(
  "/resume/:id",
  validateIdParam,
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      // getting the application & verifying ownership
      const app = await pool.query(
        "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
        [id, req.userId],
      );

      if (app.rows.length === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (!app.rows[0].resume_url) {
        return res.status(400).json({ message: "No resume to delete" });
      }

      // extract the filename from the URL & delete from Spaces
      const oldKey = app.rows[0].resume_url.split("/").pop();
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.SPACES_BUCKET,
          Key: `resumes/${oldKey}`,
        }),
      );

      // clear the URL from the db
      await pool.query(
        "UPDATE applications SET resume_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id],
      );

      res.json({ success: true, message: "Resume deleted successfully" });
    } catch (error) {
      console.error("Resume delete error:", error);
      res.status(500).json({ message: "Error deleting resume" });
    }
  },
);

module.exports = router;
