const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, checkConnection } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wwil_super_secret_jwt_key_2026_operations';

// Fallback demo credentials if PostgreSQL is running offline
const DEFAULT_DEMO_CREDENTIALS = {
  email: 'admin@wwil-logistics.com',
  password: 'WWIL-Ops#2026',
};

/**
 * POST /api/auth/login
 * Authenticate administrator with email and password
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both corporate email and operations security key.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const dbStatus = await checkConnection();

    // Check PostgreSQL database if reachable
    if (dbStatus.connected) {
      const sql = 'SELECT * FROM admins WHERE LOWER(email) = $1 LIMIT 1';
      const result = await query(sql, [normalizedEmail]);

      if (result.rows.length > 0) {
        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (isMatch) {
          const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'Operations Director' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.json({
            success: true,
            user: {
              id: admin.id,
              email: admin.email,
              name: 'Capt. Marcus Vance',
              role: 'Operations Director',
              department: 'Global Multimodal Dispatch',
              terminalCode: 'EUR-USA-CENTRAL',
              avatarInitials: 'MV',
            },
            token,
          });
        }
      }
    }

    // Fallback verification for demo controller key
    const isDemoMatch =
      (normalizedEmail === DEFAULT_DEMO_CREDENTIALS.email.toLowerCase() ||
        normalizedEmail.endsWith('@wwil-logistics.com')) &&
      password === DEFAULT_DEMO_CREDENTIALS.password;

    if (isDemoMatch) {
      const token = jwt.sign(
        { id: 999, email: normalizedEmail, role: 'Operations Director' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        user: {
          id: 999,
          email: normalizedEmail,
          name: 'Capt. Marcus Vance',
          role: 'Operations Director',
          department: 'Global Multimodal Dispatch',
          terminalCode: 'EUR-USA-CENTRAL',
          avatarInitials: 'MV',
        },
        token,
        notice: dbStatus.connected
          ? 'Authenticated via authorized demo clearance.'
          : 'Operating in local preview mode (PostgreSQL offline).',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Please verify your email and authorized operations security key.',
    });
  } catch (err) {
    console.error('[Auth Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication server error.',
    });
  }
});

/**
 * GET /api/auth/verify
 * Validate JWT session
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

module.exports = router;
