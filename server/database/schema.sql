-- ============================================
--    JOB TRACKER DATABASE SCHEMA
-- ============================================
-- This file contains the SQL commands to create the database tables






-- ============================================
-- USERS TABLE
-- ============================================
-- This table stores user account information

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,              -- Auto-incrementing unique ID for each user
  name VARCHAR(100) NOT NULL,         -- User's full name (of max 100 characters)
  email VARCHAR(255) UNIQUE NOT NULL, -- Email must be unique (No duplicates)
  password VARCHAR(255) NOT NULL,     -- Hashed password (using bcrypt)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- when the account was created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- last time account was updated
);

-- Adding an index on email for faster lookups when logging in
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
-- This  table stores job applications for every user

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,              -- Auto-incrementing unique ID for each application
  user_id INTEGER NOT NULL,           -- Which user owns this application
  company VARCHAR(200) NOT NULL,      -- Company name
  role VARCHAR(200) NOT NULL,         -- Job title/role
  status VARCHAR(50) DEFAULT 'applied',  -- Current status: applied, interview, offer, rejected
  location VARCHAR(200),              -- Job location
  applied_at DATE,                    -- Date when application was submitted
  source VARCHAR(200),                -- Where you found the job (LinkedIn, Indeed...)
  notes TEXT,                         -- Any additional notes
  contact_name VARCHAR(200),          -- Recruiter or hiring manager name
  contact_email VARCHAR(200),         -- Recruiter or hiring manager email
  contact_linkedin VARCHAR(500),      -- Recruiter or hiring manager LinkedIn URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When this application was created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Last time this application was updated
  
  -- Foreign key: links to the users table
  -- To ensure that that if a user is deleted, their applications are also deleted
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add an index on user_id for faster lookups when getting a user's applications
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Add an index on status for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

