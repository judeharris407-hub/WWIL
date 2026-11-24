/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * Main Express Application Server (/server.js)
 * ==============================================================================
 * Core backend service providing REST API endpoints for shipment tracking,
 * commercial quotations, admin authentication, and real-time telemetry.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./config/db');

// Domain Route Handlers
const adminRoutes = require('./routes/admin');
const parcelRoutes = require('./routes/parcels');
const trackingRoutes = require('./routes/tracking');
const quoteRoutes = require('./src/routes/quotes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================================================================
// 1. Core Security & Middleware
// ==============================================================================

// HTTP Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin embeds and frontend client flexibility
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Explicit Origin Allowlist for CORS
const explicitAllowlist = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Direct match against explicit allowlist
    if (explicitAllowlist.includes(origin)) {
      return callback(null, true);
    }

    // Match *.vercel.app preview and production domains if FRONTEND_URL not strictly locked
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parsing Middleware with 50kb limit to prevent payload overload attacks
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// ------------------------------------------------------------------------------
// Multi-Tier Rate Limiting Configuration
// ------------------------------------------------------------------------------

// 1. Global API Rate Limiter: 100 requests per 15 minutes per IP
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please retry in 15 minutes.',
  },
});
app.use('/api', globalApiLimiter);
app.use('/tracking', globalApiLimiter);
app.use('/parcels', globalApiLimiter);
app.use('/quotes', globalApiLimiter);

// 2. Strict Rate Limiter on Admin Login: 8 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts from this IP address. Access restricted for 15 minutes.',
  },
});

// 3. Form-Submission Rate Limiter on Quotes: 5 submissions per hour per IP
const quoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Exceeded maximum freight quotation requests (5 per hour). Please contact direct operations or try again later.',
  },
});

// Request Logging (Development mode)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ==============================================================================
// 2. Health Check & Diagnostic Endpoints
// ==============================================================================

/**
 * GET /api/health
 * Verifies server operational status and queries PostgreSQL (SELECT NOW())
 */
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() AS now, current_database() AS db_name');

    return res.status(200).json({
      status: 'healthy',
      message: 'TransGlobe-Logistics Enterprise API is operational',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: true,
        serverTime: dbResult.rows[0].now,
        databaseName: dbResult.rows[0].db_name,
        engine: 'Neon PostgreSQL (Cloud / SSL Enabled)',
      },
    });
  } catch (error) {
    console.error('❌ [Health Check] Database connectivity failed:', error.message);
    return res.status(503).json({
      status: 'degraded',
      message: 'API server is running, but database connection failed',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: false,
        error: error.message,
      },
    });
  }
});

// Base API Index
app.get('/', (req, res) => {
  res.json({
    name: 'TransGlobe-Logistics API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      adminLogin: 'POST /api/admin/login',
      parcels: 'GET /api/parcels, POST /api/parcels, PUT /api/parcels/:id, PATCH /api/parcels/:id/location',
      tracking: 'GET /api/tracking/:trackingNumber',
      quotes: 'POST /api/quotes, GET /api/quotes',
    },
  });
});

// ==============================================================================
// 3. Domain Route Registrations
// ==============================================================================
// Admin Authentication (POST /api/admin/login with strict brute-force limiter)
app.use('/api/admin/login', loginLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', adminRoutes); // Alias for flexible client compatibility

// Parcel Management (POST /api/parcels, PUT /api/parcels/:id, PATCH /api/parcels/:id/location)
app.use('/api/parcels', parcelRoutes);
app.use('/parcels', parcelRoutes);

// Public Shipment Tracking (GET /api/tracking/:trackingNumber and fallback GET /tracking/:trackingNumber)
app.use('/api/tracking', trackingRoutes);
app.use('/tracking', trackingRoutes);

// Inbound Quotation Requests (POST /api/quotes with anti-spam limiter)
app.use('/api/quotes', quoteLimiter, quoteRoutes);
app.use('/quotes', quoteLimiter, quoteRoutes);

// ==============================================================================
// 4. Error Handling
// ==============================================================================

// 404 Route Catch-All
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Server Error Handler
app.use((err, req, res, next) => {
  console.error('❌ [Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Enterprise Logistics Server Error',
  });
});

// ==============================================================================
// 5. Server Startup
// ==============================================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 WWIL Logistics Server running on port: ${PORT}`);
    console.log(`   Health:    http://localhost:${PORT}/api/health`);
    console.log(`   Admin Auth: POST http://localhost:${PORT}/api/admin/login`);
    console.log(`   Parcels:    POST/GET/PUT/PATCH http://localhost:${PORT}/api/parcels`);
    console.log(`   Tracking:   GET http://localhost:${PORT}/api/tracking/:trackingNumber`);
    console.log(`   Quotes:     POST/GET http://localhost:${PORT}/api/quotes`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
