const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { checkConnection } = require('./db');
const authRoutes = require('./routes/auth');
const parcelRoutes = require('./routes/parcels');
const quoteRoutes = require('./routes/quotes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend client connections
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging (Development)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health & System Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkConnection();
  res.json({
    status: 'online',
    service: 'WWIL Enterprise Logistics Backend Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount Domain API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/quotes', quoteRoutes);

// 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error. Please consult operations logs.',
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 WWIL Logistics API Server running on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Parcels API:  http://localhost:${PORT}/api/parcels`);
    console.log(`   Quotes API:   http://localhost:${PORT}/api/quotes`);
    console.log(`   Auth API:     http://localhost:${PORT}/api/auth/login`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
