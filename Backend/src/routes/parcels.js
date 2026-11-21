const express = require('express');
const { query } = require('../db');

const router = express.Router();

/**
 * GET /api/parcels
 * List all parcels with optional filtering
 */
router.get('/', async (req, res) => {
  const { search, mode, status } = req.query;

  try {
    let sql = `
      SELECT 
        p.*,
        (
          SELECT json_agg(h ORDER BY h.timestamp ASC)
          FROM shipment_history h
          WHERE h.parcel_id = p.id
        ) as history,
        (
          SELECT json_build_object(
            'location_name', h.location_name,
            'status', h.status,
            'timestamp', h.timestamp,
            'notes', h.notes
          )
          FROM shipment_history h
          WHERE h.parcel_id = p.id
          ORDER BY h.timestamp DESC
          LIMIT 1
        ) as latest_checkpoint
      FROM parcels p
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (
        p.tracking_number ILIKE $${params.length} OR 
        p.sender_name ILIKE $${params.length} OR 
        p.recipient_name ILIKE $${params.length} OR 
        p.origin_address ILIKE $${params.length} OR 
        p.destination_address ILIKE $${params.length}
      )`;
    }

    if (mode && mode !== 'All') {
      params.push(mode);
      sql += ` AND p.transport_mode = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);
    return res.json({
      success: true,
      count: result.rows.length,
      parcels: result.rows,
    });
  } catch (error) {
    console.error('[Get Parcels Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve parcel consignments from database.',
    });
  }
});

/**
 * GET /api/parcels/:tracking_number
 * Public customer tracking lookup with full history checkpoints
 */
router.get('/:tracking_number', async (req, res) => {
  const { tracking_number } = req.params;

  try {
    const parcelSql = `
      SELECT * FROM parcels 
      WHERE LOWER(tracking_number) = LOWER($1) 
      LIMIT 1
    `;
    const parcelResult = await query(parcelSql, [tracking_number.trim()]);

    if (parcelResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No consignment found matching tracking ID: "${tracking_number}". Please verify the number.`,
      });
    }

    const parcel = parcelResult.rows[0];

    // Fetch chronological shipment history
    const historySql = `
      SELECT id, status, location_name, latitude, longitude, notes, timestamp
      FROM shipment_history
      WHERE parcel_id = $1
      ORDER BY timestamp ASC
    `;
    const historyResult = await query(historySql, [parcel.id]);

    return res.json({
      success: true,
      parcel: {
        ...parcel,
        history: historyResult.rows,
      },
    });
  } catch (error) {
    console.error('[Tracking Lookup Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Error executing tracking lookup.',
    });
  }
});

/**
 * POST /api/parcels
 * Register a new parcel consignment and log first milestone
 * Accepts all expanded contact/description fields (camelCase & snake_case both supported)
 */
router.post('/', async (req, res) => {
  const {
    tracking_number,
    trackingNumber,
    sender_name,
    senderName,
    recipient_name,
    recipientName,
    receiver_name,
    receiverName,
    origin_address,
    originAddress,
    destination_address,
    destinationAddress,
    origin_lat,
    originLat,
    origin_lng,
    originLng,
    dest_lat,
    destLat,
    dest_lng,
    destLng,
    current_lat,
    currentLat,
    current_lng,
    currentLng,
    transport_mode,
    transportMode,
    type,
    status,
    estimated_delivery,
    estimatedDelivery,
    eta,
    current_location_name,
    currentLocationName,
    weight_kg,
    weightKg,
    weight,
    volume_cbm,
    volumeCbm,
    carrier_name,
    carrierName,
    carrier,
    vessel_or_flight,
    vesselOrFlight,
    conveyance,
    sender_phone,
    senderPhone,
    recipient_phone,
    recipientPhone,
    recipient_email,
    recipientEmail,
    description,
    package_description,
    packageDescription,
  } = req.body;

  // Normalize camelCase / snake_case aliases
  const resolvedTrackingNumber = (tracking_number || trackingNumber || req.body.id || '').toString().trim().toUpperCase();
  const resolvedSenderName = (sender_name || senderName || '').toString().trim();
  const resolvedRecipientName = (recipient_name || recipientName || receiver_name || receiverName || '').toString().trim();
  const resolvedOriginAddress = (origin_address || originAddress || '').toString().trim();
  const resolvedDestinationAddress = (destination_address || destinationAddress || '').toString().trim();

  let resolvedTransportMode = transport_mode || transportMode || type || 'Air Freight';
  if (resolvedTransportMode === 'Air') resolvedTransportMode = 'Air Freight';
  if (resolvedTransportMode === 'Ocean') resolvedTransportMode = 'Ocean Freight';
  if (resolvedTransportMode === 'Ground') resolvedTransportMode = 'Ground Logistics';

  const resolvedSenderPhone    = sender_phone    || senderPhone    || null;
  const resolvedRecipientPhone = recipient_phone || recipientPhone || null;
  const resolvedRecipientEmail = recipient_email || recipientEmail || null;
  const resolvedDescription    = description     || packageDescription || package_description || null;

  if (!resolvedTrackingNumber || !resolvedSenderName || !resolvedRecipientName || !resolvedOriginAddress || !resolvedDestinationAddress) {
    return res.status(400).json({
      success: false,
      error: 'Missing required consignment manifest parameters.',
    });
  }

  try {
    // 1. Insert Parcel Record (including all expanded fields)
    const insertParcelSql = `
      INSERT INTO parcels (
        tracking_number,
        sender_name,
        recipient_name,
        origin_address,
        destination_address,
        origin_lat,
        origin_lng,
        dest_lat,
        dest_lng,
        current_lat,
        current_lng,
        transport_mode,
        status,
        estimated_delivery,
        current_location_name,
        weight_kg,
        volume_cbm,
        carrier_name,
        vessel_or_flight,
        sender_phone,
        recipient_phone,
        recipient_email,
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const parcelParams = [
      resolvedTrackingNumber,
      resolvedSenderName,
      resolvedRecipientName,
      resolvedOriginAddress,
      resolvedDestinationAddress,
      origin_lat || originLat || 0,
      origin_lng || originLng || 0,
      dest_lat   || destLat   || 0,
      dest_lng   || destLng   || 0,
      current_lat || currentLat || origin_lat || originLat || 0,
      current_lng || currentLng || origin_lng || originLng || 0,
      resolvedTransportMode,
      status || 'Order Received',
      estimated_delivery || estimatedDelivery || eta || null,
      current_location_name || currentLocationName || `${resolvedOriginAddress} Outbound Terminal`,
      (weight_kg || weightKg || weight) ? String(weight_kg || weightKg || weight) : null,
      (volume_cbm || volumeCbm) ? String(volume_cbm || volumeCbm) : null,
      carrier_name || carrierName || carrier || 'WWIL Global Logistics Network',
      vessel_or_flight || vesselOrFlight || conveyance || null,
      resolvedSenderPhone,
      resolvedRecipientPhone,
      resolvedRecipientEmail,
      resolvedDescription,
    ];

    const parcelResult = await query(insertParcelSql, parcelParams);
    const newParcel = parcelResult.rows[0];

    // 2. Insert Initial Creation Checkpoint into shipment_history
    const insertHistorySql = `
      INSERT INTO shipment_history (parcel_id, tracking_number, status, location_name, latitude, longitude, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const historyParams = [
      newParcel.id,
      newParcel.tracking_number,
      newParcel.status,
      newParcel.origin_address,
      newParcel.origin_lat,
      newParcel.origin_lng,
      'Shipment manifested and registered into WWIL international logistics network.',
    ];

    const historyResult = await query(insertHistorySql, historyParams);

    return res.status(201).json({
      success: true,
      message: `Consignment ${newParcel.tracking_number} manifested successfully!`,
      parcel: newParcel,
      initialHistory: historyResult.rows[0],
    });
  } catch (error) {
    console.error('[Create Parcel Error]:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: `A shipment with tracking number "${normalizedTracking}" already exists.`,
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to create parcel consignment.',
    });
  }
});

/**
 * PATCH /api/parcels/:id/status
 * Update parcel status and log to shipment history
 */
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, location_name, notes } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required.' });
  }

  try {
    const updateSql = `
      UPDATE parcels 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const updateResult = await query(updateSql, [status, id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parcel not found.' });
    }

    const parcel = updateResult.rows[0];

    // Log checkpoint to history
    const historySql = `
      INSERT INTO shipment_history (parcel_id, status, location_name, latitude, longitude, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const historyParams = [
      parcel.id,
      status,
      location_name || parcel.origin_address,
      parcel.current_lat,
      parcel.current_lng,
      notes || `Milestone updated to ${status}.`,
    ];
    await query(historySql, historyParams);

    return res.json({
      success: true,
      message: `Parcel ${parcel.tracking_number} status updated to "${status}".`,
      parcel,
    });
  } catch (error) {
    console.error('[Update Status Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
});

/**
 * PATCH /api/parcels/:id/location
 * Calibrate GPS coordinates and log waypoint event
 */
router.patch('/:id/location', async (req, res) => {
  const { id } = req.params;
  const { current_lat, current_lng, location_name, notes, status } = req.body;

  if (current_lat === undefined || current_lng === undefined) {
    return res.status(400).json({ success: false, error: 'Latitude and Longitude are required.' });
  }

  try {
    const updateSql = `
      UPDATE parcels 
      SET current_lat = $1, current_lng = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const updateResult = await query(updateSql, [current_lat, current_lng, id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parcel not found.' });
    }

    const parcel = updateResult.rows[0];

    // Log waypoint to history
    const historySql = `
      INSERT INTO shipment_history (parcel_id, status, location_name, latitude, longitude, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const historyParams = [
      parcel.id,
      status || parcel.status,
      location_name || `Waypoint (${Number(current_lat).toFixed(4)}°, ${Number(current_lng).toFixed(4)}°)`,
      current_lat,
      current_lng,
      notes || 'GPS waypoint telemetry calibrated by WWIL logistics controller.',
    ];
    await query(historySql, historyParams);

    return res.json({
      success: true,
      message: `GPS coordinates for ${parcel.tracking_number} calibrated.`,
      parcel,
    });
  } catch (error) {
    console.error('[Update Location Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update location coordinates.' });
  }
});

/**
 * DELETE /api/parcels/:id
 * Delete parcel (cascades to shipment_history)
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleteSql = 'DELETE FROM parcels WHERE id = $1 RETURNING tracking_number';
    const result = await query(deleteSql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Parcel not found.' });
    }

    return res.json({
      success: true,
      message: `Parcel ${result.rows[0].tracking_number} deleted successfully.`,
    });
  } catch (error) {
    console.error('[Delete Parcel Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete parcel.' });
  }
});

module.exports = router;
