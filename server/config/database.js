
// Loading environment variables 
require('dotenv').config();

// This file handles the PostgreSQL database connection

const { Pool } = require('pg');


const pool = new Pool({
  host: process.env.DB_HOST,       // Where the database is 
  port: parseInt(process.env.DB_PORT, 10),       // PostgreSQL port (usually 5432)
  user: process.env.DB_USER,       // database username (usually 'postgres')
  password: String(process.env.DB_PASSWORD), // password you set during installation
  database: process.env.DB_NAME,   // The database name we'll create
});

// Test the connection when the app starts
pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database');
});

// Handle connection errors
pool.on('error', (err) => {
  console.error(' Unexpected error on idle client', err);
  process.exit(-1);
});

// Export the pool so other files can use it
module.exports = pool;