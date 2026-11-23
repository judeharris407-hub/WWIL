/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * Quotation Management Routes (/routes/quotes.js)
 * ==============================================================================
 * Endpoints:
 * - POST /api/quotes  (Submit static freight quotation request & trigger Resend email)
 * - GET  /api/quotes  (Retrieve quotations for enterprise operations desk)
 */

const express = require('express');
const pool = require('../config/db');
const { sendQuoteConfirmationEmail, sendOperationsAlertEmail } = require('../services/emailService');
const { validateBody, quoteSubmissionSchema } = require('../middleware/validators');

const router = express.Router();

/**
 * POST /api/quotes
 * Submit freight quotation inquiry, record in PostgreSQL, and dispatch Resend confirmation email
 */
router.post('/', validateBody(quoteSubmissionSchema), async (req, res) => {
  // Support both camelCase and snake_case parameter formats
  const freight_type = req.body.freightType || req.body.freight_type;
  const departure_country = req.body.departureCountry || req.body.departure_country;
  const recipient_country = req.body.recipientCountry || req.body.recipient_country;
  const weight = req.body.weight || req.body.weight_kg;
  const full_name = req.body.fullName || req.body.full_name;
  const email = req.body.email;
  const phone = req.body.phone;
  const notes = req.body.notes || req.body.message;

  // 1. Input Validation
  if (!freight_type || !departure_country || !recipient_country || !full_name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Missing required quotation parameters: freightType, departureCountry, recipientCountry, fullName, and email are mandatory.',
    });
  }

  // Basic email syntax check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid corporate email address.',
    });
  }

  // 2. Generate unique reference number: TGL-QT-2026-XXXX
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reference_number = `TGL-QT-2026-${randomSuffix}`;

  try {
    // 3. Save quotation record into 'quotes' table in PostgreSQL
    const insertSql = `
      INSERT INTO quotes (
        reference_number,
        freight_type,
        departure_country,
        recipient_country,
        weight,
        full_name,
        email,
        phone,
        notes,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending Review', CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const insertValues = [
      reference_number,
      freight_type,
      departure_country,
      recipient_country,
      weight ? String(weight) : 'Standard Consignment',
      full_name.trim(),
      email.trim().toLowerCase(),
      phone ? String(phone).trim() : null,
      notes || null,
    ];

    const result = await pool.query(insertSql, insertValues);
    const savedQuote = result.rows[0];

    // 4. Trigger Transactional Email via Resend Service
    // Dispatched asynchronously with graceful error isolation
    let emailStatus = { sent: false, message: 'Email dispatch initiated' };

    try {
      // Send confirmation to client
      const clientEmailRes = await sendQuoteConfirmationEmail(savedQuote);

      // Send operational alert to dispatch team (optional, non-blocking)
      sendOperationsAlertEmail(savedQuote).catch((err) => {
        console.warn('⚠️ [Operations Alert Notice]:', err.message);
      });

      emailStatus = {
        sent: clientEmailRes.success,
        simulated: clientEmailRes.simulated || false,
        message: clientEmailRes.success
          ? clientEmailRes.simulated
            ? 'Quote recorded. Email simulation logged (set RESEND_API_KEY for live delivery).'
            : 'Quote recorded and confirmation email dispatched to client.'
          : 'Quote recorded; confirmation email queued for dispatch.',
      };
    } catch (emailError) {
      console.error('⚠️ [Email Trigger Warning]:', emailError.message);
      emailStatus = {
        sent: false,
        error: emailError.message,
        message: 'Quote recorded successfully. Email notification will be retried by operations.',
      };
    }

    // 5. Respond with 201 Created and full confirmation details
    return res.status(201).json({
      success: true,
      message: 'Freight quotation request submitted successfully!',
      referenceNumber: savedQuote.reference_number,
      quote: savedQuote,
      notification: emailStatus,
    });
  } catch (error) {
    console.error('❌ [Create Quote Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record quotation request in database. Please try again or contact operations directly.',
    });
  }
});

/**
 * GET /api/quotes
 * Retrieve all quotation requests (for Enterprise Operations Desk)
 */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        reference_number,
        freight_type,
        departure_country,
        recipient_country,
        weight,
        full_name,
        email,
        phone,
        status,
        created_at
      FROM quotes
      ORDER BY created_at DESC
    `;
    const result = await pool.query(sql);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      quotes: result.rows,
    });
  } catch (error) {
    console.error('❌ [Get Quotes Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load quotation inquiries.',
    });
  }
});

module.exports = router;
