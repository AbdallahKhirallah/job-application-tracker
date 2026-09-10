
// Loading environment variables 
require('dotenv').config();

// This file handles the PostgreSQL database connection

const { Pool } = require('pg');


// In production (Railway / Neon / Render) a single DATABASE_URL is provided.
// Locally we fall back to the discrete DB_* variables.
//
// SSL: managed Postgres over the public internet needs it, but Railway's
// private network (*.railway.internal) does not and will error if forced.
// Default: SSL on, unless the host is a private/local address. Override with
// DATABASE_SSL=true|false.
function resolveSsl(connectionString) {
  if (process.env.DATABASE_SSL === 'true') return { rejectUnauthorized: false };
  if (process.env.DATABASE_SSL === 'false') return false;
  const isInternal = /\.railway\.internal|localhost|127\.0\.0\.1|\.internal(?:[:/]|$)/.test(
    connectionString
  );
  return isInternal ? false : { rejectUnauthorized: false };
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: resolveSsl(process.env.DATABASE_URL),
    })
  : new Pool({
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

// Handle connection errors. Managed Postgres can drop idle connections;
// log it and let the pool recover instead of crashing the whole server.
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

// Export the pool so other files can use it
module.exports = pool;