/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * Public Tracking Routes (/routes/tracking.js)
 * ==============================================================================
 * Endpoint: GET /api/tracking/:trackingNumber
 * Publicly accessible route (no auth required) that queries 'parcels' by tracking_number,
 * joins full chronological audit log from 'shipment_history', and returns 404 if not found.
 */

const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/**
 * GET /api/tracking/:trackingNumber
 * Public live tracking query
 */
router.get('/:trackingNumber', async (req, res) => {
  const { trackingNumber } = req.params;

  if (!trackingNumber || trackingNumber.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid consignment tracking number.',
    });
  }

  const normalizedTracking = trackingNumber.trim().toUpperCase();

  try {
    // 1. Query the 'parcels' table by tracking_number (case-insensitive and whitespace-safe)
    const parcelSql = `
      SELECT *
      FROM parcels
      WHERE UPPER(TRIM(tracking_number)) = UPPER(TRIM($1))
      LIMIT 1
    `;
    const parcelResult = await pool.query(parcelSql, [normalizedTracking]);

    // 2. Return 404 if tracking number does not exist
    if (parcelResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No shipment found matching tracking number "${normalizedTracking}". Please verify the identifier and try again.`,
      });
    }

    const parcel = parcelResult.rows[0];

    // 3. Fetch full chronological audit log from 'shipment_history' ordered by timestamp
    const historySql = `
      SELECT 
        id,
        parcel_id,
        status,
        location_name,
        latitude,
        longitude,
        notes,
        timestamp
      FROM shipment_history
      WHERE parcel_id = $1 OR UPPER(TRIM(tracking_number)) = UPPER(TRIM($2))
      ORDER BY timestamp ASC
    `;
    const historyResult = await pool.query(historySql, [parcel.id, normalizedTracking]);

    const milestones = historyResult.rows.map((row) => ({
      id: row.id,
      parcel_id: row.parcel_id,
      status: row.status,
      location_name: row.location_name,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      notes: row.notes,
      timestamp: row.timestamp,
    }));

    // 4. Return clean, formatted response
    return res.status(200).json({
      success: true,
      parcel: {
        id: parcel.id,
        tracking_number: parcel.tracking_number,
        sender_name: parcel.sender_name,
        recipient_name: parcel.recipient_name,
        origin_address: parcel.origin_address,
        destination_address: parcel.destination_address,
        origin_lat: parcel.origin_lat ? parseFloat(parcel.origin_lat) : null,
        origin_lng: parcel.origin_lng ? parseFloat(parcel.origin_lng) : null,
        dest_lat: parcel.dest_lat ? parseFloat(parcel.dest_lat) : null,
        dest_lng: parcel.dest_lng ? parseFloat(parcel.dest_lng) : null,
        current_lat: parcel.current_lat ? parseFloat(parcel.current_lat) : null,
        current_lng: parcel.current_lng ? parseFloat(parcel.current_lng) : null,
        transport_mode: parcel.transport_mode,
        status: parcel.status,
        estimated_delivery: parcel.estimated_delivery,
        departure_at: parcel.departure_at || parcel.created_at,
        eta_at: parcel.eta_at,
        current_location_name: parcel.current_location_name,
        carrier_name: parcel.carrier_name,
        vessel_or_flight: parcel.vessel_or_flight,
        weight_kg: parcel.weight_kg,
        volume_cbm: parcel.volume_cbm,
        progress_percent: parcel.progress_percent,
        sender_phone: parcel.sender_phone,
        recipient_phone: parcel.recipient_phone,
        recipient_email: parcel.recipient_email,
        description: parcel.description,
        created_at: parcel.created_at,
        updated_at: parcel.updated_at,
        history: milestones,
        audit_log: milestones,
      },
    });
  } catch (error) {
    console.error('❌ [Public Tracking Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while executing tracking inquiry.',
    });
  }
});

module.exports = router;
