/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * Database Connection Pool Configuration (/config/db.js)
 * ==============================================================================
 * Manages reusable PostgreSQL connection pooling via the 'pg' library.
 * Pre-configured for cloud Neon PostgreSQL database instances with SSL support.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Verify that the database connection string is present
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [Database Warning] DATABASE_URL is not set in environment variables.');
}

/**
 * Configure SSL for Cloud Neon PostgreSQL:
 * Neon databases require SSL enabled. Setting rejectUnauthorized: false allows
 * secure TLS/SSL handshakes with Neon's managed certificates.
 */
const connectionString = process.env.DATABASE_URL || '';
const isNeonOrCloud = connectionString.includes('neon.tech') || 
                      connectionString.includes('sslmode=require') || 
                      (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeonOrCloud ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool size for high-throughput logistics telemetry
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout connection attempts after 5 seconds
});

// Event listener for idle pool client errors
pool.on('error', (err) => {
  console.error('❌ [Database] Unexpected idle client error:', err.message);
});

// Perform startup connectivity check and ensure schema support
pool.query('SELECT NOW() AS current_time, current_database() AS db_name')
  .then(async (res) => {
    const { current_time, db_name } = res.rows[0];
    console.log(`✅ [Database] Connected to Neon PostgreSQL database: "${db_name}"`);
    console.log(`   Database Server Time: ${current_time}`);

    // Ensure interpolation timestamp columns exist
    try {
      await pool.query(`
        ALTER TABLE parcels 
        ADD COLUMN IF NOT EXISTS departure_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE parcels 
        ADD COLUMN IF NOT EXISTS eta_at TIMESTAMP WITH TIME ZONE;
      `);
    } catch (migErr) {
      console.warn('⚠️ [Database] Schema check notice:', migErr.message);
    }
  })
  .catch((err) => {
    console.error('❌ [Database] Initial connection attempt failed:', err.message);
    console.error('   Verify DATABASE_URL credentials and network status.');
  });

// Export the pool directly; pg.Pool already provides pool.query(), pool.connect(), etc.
module.exports = pool;
module.exports.pool = pool;
