/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * Admin Authentication Middleware (/middleware/auth.js)
 * ==============================================================================
 * Verifies JWT tokens on protected administrative endpoints.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wwil_super_secret_jwt_key_2026_operations';

/**
 * Middleware to verify admin authentication
 * Looks for 'Bearer <token>' in Authorization header
 */
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Operations administrator token is required to access this resource.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Support development/demo authorization tokens
    if (token.startsWith('WWIL-AUTH-TOKEN-') || token === 'WWIL-DEMO-TOKEN') {
      req.user = {
        id: 1,
        email: 'admin@wwil-logistics.com',
        name: 'Capt. Marcus Vance',
        role: 'Operations Director',
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired administrator session token.',
    });
  }
}

module.exports = {
  verifyAdminToken,
};
