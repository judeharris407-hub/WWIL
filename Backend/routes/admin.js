/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * Admin Authentication Routes (/routes/admin.js)
 * ==============================================================================
 * Endpoint: POST /api/admin/login
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validateBody, adminLoginSchema } = require('../middleware/validators');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'transglobe_operations_jwt_secret_key_2026';

// Corporate admin credentials configured via environment variables
const CORP_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'transglobel9@gmail.com').trim().toLowerCase();
const CORP_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kenfack123@';

/**
 * POST /api/admin/login
 * Verify administrator credentials against 'admins' table using bcrypt
 */
router.post('/login', validateBody(adminLoginSchema), async (req, res) => {
  const { email, password } = req.body;

  // 1. Input Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both corporate email address and operations security key.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 2. Query the 'admins' table for the matching email
    const querySql = `
      SELECT id, email, password_hash, name, role
      FROM admins
      WHERE LOWER(email) = $1
      LIMIT 1
    `;
    const result = await pool.query(querySql, [normalizedEmail]);

    let admin = null;
    let isPasswordValid = false;

    if (result.rows.length > 0) {
      admin = result.rows[0];
      try {
        isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      } catch (bcryptErr) {
        console.warn('[Bcrypt Warning]:', bcryptErr.message);
      }
    }

    // Corporate credentials check via process.env.ADMIN_EMAIL / process.env.ADMIN_PASSWORD
    if (normalizedEmail === CORP_ADMIN_EMAIL && password === CORP_ADMIN_PASSWORD) {
      isPasswordValid = true;
      // Upsert / self-heal corporate admin record into PostgreSQL admins table
      try {
        const hash = await bcrypt.hash(CORP_ADMIN_PASSWORD, 10);
        const upsertRes = await pool.query(
          `INSERT INTO admins (email, password_hash)
           VALUES ($1, $2)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
           RETURNING id, email, name, role`,
          [CORP_ADMIN_EMAIL, hash]
        );
        admin = upsertRes.rows[0];
      } catch (upsertErr) {
        console.warn('[Admin Auth] Neon DB sync warning:', upsertErr.message);
        if (!admin) {
          admin = { id: 1, email: CORP_ADMIN_EMAIL, name: 'Corporate Operations Director', role: 'Global Administrator' };
        }
      }
    }

    if (!isPasswordValid || !admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your administrator email and security password.',
      });
    }

    // 4. Generate JWT session token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name || 'Capt. Marcus Vance',
        role: admin.role || 'Senior Operations Director',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Return success status with session confirmation and token
    return res.status(200).json({
      success: true,
      message: 'Administrator authentication successful.',
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name || 'Capt. Marcus Vance',
        role: admin.role || 'Senior Operations Director',
        department: 'Global Multimodal Dispatch',
        terminalCode: 'EUR-USA-CENTRAL',
        avatarInitials: 'MV',
      },
    });
  } catch (error) {
    console.error('❌ [Admin Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during administrator authentication.',
    });
  }
});

module.exports = router;
