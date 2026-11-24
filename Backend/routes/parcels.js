/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * Parcel Management Routes (/routes/parcels.js)
 * ==============================================================================
 * Endpoints:
 * - POST  /api/parcels          (Create new shipment record & initial audit log)
 * - PUT   /api/parcels/:id      (Update existing shipment details/status/mode)
 * - PATCH /api/parcels/:id/location (Live map position adjustments & audit log)
 * - GET   /api/parcels          (List consignments)
 * - DELETE /api/parcels/:id     (Delete consignment)
 */

const express = require('express');
const pool = require('../config/db');
const { verifyAdminToken } = require('../middleware/auth');
const { sendShipmentCreatedEmail, sendStatusUpdateEmail } = require('../services/emailService');
const { validateBody, createParcelSchema, patchLocationSchema } = require('../middleware/validators');

/**
 * Robust helper to convert ETA string or duration to an ISO timestamp
 */
function parseEtaToTimestamp(etaInput, departureDate = new Date()) {
  if (!etaInput) {
    const d = new Date(departureDate);
    d.setDate(d.getDate() + 3);
    return d.toISOString();
  }

  const str = String(etaInput).trim();

  // Match relative expressions like "In 3 Business Days", "In 5 Days", "In 48 Hours"
  const bizDaysMatch = str.match(/in\s+(\d+)\s*(?:business\s*)?days?/i);
  if (bizDaysMatch) {
    const days = parseInt(bizDaysMatch[1], 10);
    const d = new Date(departureDate);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }
    return d.toISOString();
  }

  const hoursMatch = str.match(/in\s+(\d+)\s*hours?/i);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    const d = new Date(departureDate);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  }

  const weeksMatch = str.match(/in\s+(\d+)\s*weeks?/i);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    const d = new Date(departureDate);
    d.setDate(d.getDate() + weeks * 7);
    return d.toISOString();
  }

  // Check direct date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  // Default fallback: 3 days after departure
  const fallback = new Date(departureDate);
  fallback.setDate(fallback.getDate() + 3);
  return fallback.toISOString();
}

const router = express.Router();

/**
 * GET /api/parcels
 * List all parcel records (Supports query filters: search, mode, status)
 */
router.get('/', async (req, res) => {
  const { search, mode, status } = req.query;

  try {
    let sql = `
      SELECT 
        p.*,
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

    const result = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      parcels: result.rows,
    });
  } catch (error) {
    console.error('❌ [Get Parcels Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve consignments from the database.',
    });
  }
});

/**
 * POST /api/parcels
 * Create a new shipment record in 'parcels' and append the initial entry to 'shipment_history'
 * Protected by admin authentication
 */
router.post('/', verifyAdminToken, validateBody(createParcelSchema), async (req, res) => {
  const {
    // Standard snake_case
    tracking_number,
    sender_name,
    recipient_name,
    receiver_name,
    origin_address,
    destination_address,
    origin_lat,
    origin_lng,
    dest_lat,
    dest_lng,
    current_lat,
    current_lng,
    transport_mode,
    status = 'Order Received',
    estimated_delivery,
    current_location_name,
    weight_kg,
    volume_cbm,
    carrier_name,
    vessel_or_flight,
    sender_phone,
    recipient_phone,
    recipient_email,
    description,
    package_description,

    // camelCase & frontend naming variants
    trackingNumber,
    senderName,
    senderPhone,
    recipientName,
    recipientPhone,
    recipientEmail,
    receiverName,
    originAddress,
    destinationAddress,
    originLat,
    originLng,
    destLat,
    destLng,
    currentLat,
    currentLng,
    transportMode,
    type,
    estimatedDelivery,
    eta,
    currentLocationName,
    weightKg,
    weight,
    volumeCbm,
    carrierName,
    carrier,
    vesselOrFlight,
    conveyance,
    packageDescription,
  } = req.body;

  // Normalize camelCase and snake_case inputs
  const resolvedTrackingNumber = (tracking_number || trackingNumber || req.body.id || '').toString().trim().toUpperCase();
  const resolvedSenderName = (sender_name || senderName || '').toString().trim();
  const resolvedRecipientName = (recipient_name || recipientName || receiver_name || receiverName || '').toString().trim();
  const resolvedOriginAddress = (origin_address || originAddress || '').toString().trim();
  const resolvedDestinationAddress = (destination_address || destinationAddress || '').toString().trim();

  let resolvedTransportMode = transport_mode || transportMode || type || 'Air Freight';
  if (resolvedTransportMode === 'Air') resolvedTransportMode = 'Air Freight';
  if (resolvedTransportMode === 'Ocean') resolvedTransportMode = 'Ocean Freight';
  if (resolvedTransportMode === 'Ground') resolvedTransportMode = 'Ground Logistics';

  const resolvedSenderPhone = (sender_phone || senderPhone || null)?.toString?.().trim?.() || null;
  const resolvedRecipientPhone = (recipient_phone || recipientPhone || null)?.toString?.().trim?.() || null;
  const resolvedRecipientEmail = (recipient_email || recipientEmail || null)?.toString?.().trim?.() || null;
  const resolvedDescription = (description || packageDescription || package_description || null)?.toString?.().trim?.() || null;

  const resolvedStatus = status || 'Order Received';
  const resolvedEstimatedDelivery = estimated_delivery || estimatedDelivery || eta || null;

  // Origin & destination coordinate defaulting
  let rawOriginLat = origin_lat ?? originLat;
  let rawOriginLng = origin_lng ?? originLng;
  let rawCurrentLat = current_lat ?? currentLat;
  let rawCurrentLng = current_lng ?? currentLng;

  // Default origin_lat/origin_lng to initial current_lat/current_lng if separate origin coordinates aren't provided
  if ((rawOriginLat === undefined || rawOriginLat === null || isNaN(Number(rawOriginLat))) && rawCurrentLat !== undefined && !isNaN(Number(rawCurrentLat))) {
    rawOriginLat = rawCurrentLat;
  }
  if ((rawOriginLng === undefined || rawOriginLng === null || isNaN(Number(rawOriginLng))) && rawCurrentLng !== undefined && !isNaN(Number(rawCurrentLng))) {
    rawOriginLng = rawCurrentLng;
  }

  const resolvedOriginLat = Number(rawOriginLat ?? 0);
  const resolvedOriginLng = Number(rawOriginLng ?? 0);
  const resolvedDestLat = Number(dest_lat ?? destLat ?? 0);
  const resolvedDestLng = Number(dest_lng ?? destLng ?? 0);
  const resolvedCurrentLat = Number(rawCurrentLat ?? resolvedOriginLat);
  const resolvedCurrentLng = Number(rawCurrentLng ?? resolvedOriginLng);

  // Departure & ETA timestamps
  const rawDeparture = req.body.departure_at || req.body.departureAt || null;
  const resolvedDepartureAt = (rawDeparture && !isNaN(new Date(rawDeparture).getTime()))
    ? new Date(rawDeparture).toISOString()
    : new Date().toISOString();

  const rawEta = req.body.eta_at || req.body.etaAt || null;
  const resolvedEtaAt = (rawEta && !isNaN(new Date(rawEta).getTime()))
    ? new Date(rawEta).toISOString()
    : parseEtaToTimestamp(resolvedEstimatedDelivery, new Date(resolvedDepartureAt));

  const resolvedCurrentLocationName = (current_location_name || currentLocationName || `${resolvedOriginAddress} Outbound Terminal`).toString().trim();
  const resolvedWeight = (weight_kg || weightKg || weight) ? String(weight_kg || weightKg || weight).trim() : null;
  const resolvedVolume = (volume_cbm || volumeCbm) ? String(volume_cbm || volumeCbm).trim() : null;
  const resolvedCarrier = (carrier_name || carrierName || carrier || 'TransGlobe Global Logistics Network').toString().trim();
  const resolvedConveyance = (vessel_or_flight || vesselOrFlight || conveyance || null)?.toString?.().trim?.() || null;

  // Input Validation
  if (!resolvedTrackingNumber || !resolvedSenderName || !resolvedRecipientName || !resolvedOriginAddress || !resolvedDestinationAddress || !resolvedTransportMode) {
    return res.status(400).json({
      success: false,
      error: 'Missing required consignment parameters: tracking_number, sender_name, recipient_name (or receiver_name), origin_address, destination_address, and transport_mode are mandatory.',
    });
  }

  const client = await pool.connect();

  try {
    // Check if tracking number already exists
    const checkSql = 'SELECT id FROM parcels WHERE LOWER(tracking_number) = LOWER($1) LIMIT 1';
    const checkRes = await client.query(checkSql, [resolvedTrackingNumber]);

    if (checkRes.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Consignment with tracking number "${resolvedTrackingNumber}" already exists.`,
      });
    }

    await client.query('BEGIN');

    // 1. Insert into 'parcels' table
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
        departure_at,
        eta_at,
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `;

    const parcelValues = [
      resolvedTrackingNumber,
      resolvedSenderName,
      resolvedRecipientName,
      resolvedOriginAddress,
      resolvedDestinationAddress,
      resolvedOriginLat,
      resolvedOriginLng,
      resolvedDestLat,
      resolvedDestLng,
      resolvedCurrentLat,
      resolvedCurrentLng,
      resolvedTransportMode,
      resolvedStatus,
      resolvedEstimatedDelivery,
      resolvedDepartureAt,
      resolvedEtaAt,
      resolvedCurrentLocationName,
      resolvedWeight,
      resolvedVolume,
      resolvedCarrier,
      resolvedConveyance,
      resolvedSenderPhone,
      resolvedRecipientPhone,
      resolvedRecipientEmail,
      resolvedDescription,
    ];

    const parcelResult = await client.query(insertParcelSql, parcelValues);
    const newParcel = parcelResult.rows[0];

    // 2. Insert initial milestone entry into 'shipment_history' table
    const insertHistorySql = `
      INSERT INTO shipment_history (
        parcel_id,
        tracking_number,
        status,
        location_name,
        latitude,
        longitude,
        notes,
        timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const historyValues = [
      newParcel.id,
      newParcel.tracking_number,
      newParcel.status,
      newParcel.origin_address,
      newParcel.origin_lat,
      newParcel.origin_lng,
      'Shipment manifested and registered into TransGlobe international logistics network.',
    ];

    const historyResult = await client.query(insertHistorySql, historyValues);

    await client.query('COMMIT');

    // Asynchronous non-blocking email dispatch (never halts or blocks JSON response)
    sendShipmentCreatedEmail(newParcel).catch((err) => {
      console.warn('[Email Skipped - Non-blocking notice]:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: `Consignment ${newParcel.tracking_number} created successfully.`,
      parcel: newParcel,
      initialHistory: historyResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Create Parcel Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create parcel consignment in database.',
    });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/parcels/:id
 * Update existing shipment details, transport mode, or status
 * Protected by admin authentication
 */
router.put('/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const {
    sender_name,
    recipient_name,
    origin_address,
    destination_address,
    origin_lat,
    origin_lng,
    dest_lat,
    dest_lng,
    transport_mode,
    status,
    estimated_delivery,
    carrier_name,
    vessel_or_flight,
    weight_kg,
    volume_cbm,
    progress_percent,
    sender_phone,
    senderPhone,
    recipient_phone,
    recipientPhone,
    recipient_email,
    recipientEmail,
    description,
    notes,
  } = req.body;

  const resolvedSenderPhone = sender_phone || senderPhone || null;
  const resolvedRecipientPhone = recipient_phone || recipientPhone || null;
  const resolvedRecipientEmail = recipient_email || recipientEmail || null;
  const resolvedDescription = description || null;

  const rawDeparture = req.body.departure_at || req.body.departureAt || null;
  const resolvedDepartureAt = rawDeparture && !isNaN(new Date(rawDeparture).getTime()) ? new Date(rawDeparture).toISOString() : null;

  const rawEta = req.body.eta_at || req.body.etaAt || null;
  let resolvedEtaAt = rawEta && !isNaN(new Date(rawEta).getTime()) ? new Date(rawEta).toISOString() : null;

  const client = await pool.connect();

  try {
    // 1. Fetch current parcel
    const findSql = 'SELECT * FROM parcels WHERE id = $1 LIMIT 1';
    const findRes = await client.query(findSql, [id]);

    if (findRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Parcel with ID ${id} not found.`,
      });
    }

    const existingParcel = findRes.rows[0];
    const statusChanged = status && status !== existingParcel.status;

    if (!resolvedEtaAt && estimated_delivery) {
      resolvedEtaAt = parseEtaToTimestamp(
        estimated_delivery,
        resolvedDepartureAt ? new Date(resolvedDepartureAt) : new Date(existingParcel.departure_at || existingParcel.created_at || Date.now())
      );
    }

    await client.query('BEGIN');

    // 2. Update parcel record
    const updateSql = `
      UPDATE parcels
      SET
        sender_name = COALESCE($1, sender_name),
        recipient_name = COALESCE($2, recipient_name),
        origin_address = COALESCE($3, origin_address),
        destination_address = COALESCE($4, destination_address),
        origin_lat = COALESCE($5, origin_lat),
        origin_lng = COALESCE($6, origin_lng),
        dest_lat = COALESCE($7, dest_lat),
        dest_lng = COALESCE($8, dest_lng),
        transport_mode = COALESCE($9, transport_mode),
        status = COALESCE($10, status),
        estimated_delivery = COALESCE($11, estimated_delivery),
        departure_at = COALESCE($12, departure_at),
        eta_at = COALESCE($13, eta_at),
        carrier_name = COALESCE($14, carrier_name),
        vessel_or_flight = COALESCE($15, vessel_or_flight),
        weight_kg = COALESCE($16, weight_kg),
        volume_cbm = COALESCE($17, volume_cbm),
        progress_percent = COALESCE($18, progress_percent),
        sender_phone = COALESCE($19, sender_phone),
        recipient_phone = COALESCE($20, recipient_phone),
        recipient_email = COALESCE($21, recipient_email),
        description = COALESCE($22, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $23
      RETURNING *
    `;

    const updateValues = [
      sender_name,
      recipient_name,
      origin_address,
      destination_address,
      origin_lat,
      origin_lng,
      dest_lat,
      dest_lng,
      transport_mode,
      status,
      estimated_delivery,
      resolvedDepartureAt,
      resolvedEtaAt,
      carrier_name,
      vessel_or_flight,
      weight_kg ? String(weight_kg) : null,
      volume_cbm ? String(volume_cbm) : null,
      progress_percent,
      resolvedSenderPhone,
      resolvedRecipientPhone,
      resolvedRecipientEmail,
      resolvedDescription,
      id,
    ];

    const updateRes = await client.query(updateSql, updateValues);
    const updatedParcel = updateRes.rows[0];

    // 3. If status changed, automatically append to shipment_history
    let auditLogEntry = null;
    if (statusChanged) {
      const historySql = `
        INSERT INTO shipment_history (
          parcel_id,
          tracking_number,
          status,
          location_name,
          latitude,
          longitude,
          notes,
          timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const historyValues = [
        updatedParcel.id,
        updatedParcel.tracking_number,
        updatedParcel.status,
        updatedParcel.current_location_name || updatedParcel.origin_address,
        updatedParcel.current_lat,
        updatedParcel.current_lng,
        notes || `Consignment status updated to "${updatedParcel.status}".`,
      ];

      const historyRes = await client.query(historySql, historyValues);
      auditLogEntry = historyRes.rows[0];
    }

    await client.query('COMMIT');

    // Asynchronous non-blocking email dispatch if status changed
    if (statusChanged) {
      sendStatusUpdateEmail(updatedParcel, auditLogEntry || {}).catch((err) => {
        console.warn('[Email Skipped - Non-blocking notice]:', err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: `Shipment ${updatedParcel.tracking_number} updated successfully.`,
      parcel: updatedParcel,
      auditLogEntry,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Update Parcel Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update consignment details.',
    });
  } finally {
    client.release();
  }
});

/**
 * PATCH /api/parcels/:id/location
 * Specifically handle live map position adjustments
 * Updates current_lat, current_lng and appends new row to shipment_history
 * Protected by admin authentication
 */
router.patch('/:id/location', verifyAdminToken, validateBody(patchLocationSchema), async (req, res) => {
  const { id } = req.params;
  const { current_lat, current_lng, location_name, notes, status } = req.body;

  // Validate coordinates
  if (current_lat === undefined || current_lng === undefined || isNaN(Number(current_lat)) || isNaN(Number(current_lng))) {
    return res.status(400).json({
      success: false,
      error: 'Valid numeric current_lat and current_lng coordinates are required.',
    });
  }

  const latNum = Number(current_lat);
  const lngNum = Number(current_lng);

  const client = await pool.connect();

  try {
    // 1. Fetch existing parcel
    const findSql = 'SELECT * FROM parcels WHERE id = $1 LIMIT 1';
    const findRes = await client.query(findSql, [id]);

    if (findRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Parcel with ID ${id} not found.`,
      });
    }

    const parcel = findRes.rows[0];

    await client.query('BEGIN');

    // 2. Update parcels coordinates and optional location name
    const updateSql = `
      UPDATE parcels
      SET
        current_lat = $1,
        current_lng = $2,
        current_location_name = COALESCE($3, current_location_name),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const updateValues = [
      latNum,
      lngNum,
      location_name || null,
      status || null,
      id,
    ];

    const updateRes = await client.query(updateSql, updateValues);
    const updatedParcel = updateRes.rows[0];

    // 3. Automatically append new row to shipment_history for chronological tracking
    const historySql = `
      INSERT INTO shipment_history (
        parcel_id,
        tracking_number,
        status,
        location_name,
        latitude,
        longitude,
        notes,
        timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const resolvedLocationName = location_name || 
      `Waypoint (${latNum.toFixed(4)}°, ${lngNum.toFixed(4)}°)`;

    const historyValues = [
      updatedParcel.id,
      updatedParcel.tracking_number,
      updatedParcel.status,
      resolvedLocationName,
      latNum,
      lngNum,
      notes || 'Live GPS telemetry calibrated via enterprise dispatch console.',
    ];

    const historyRes = await client.query(historySql, historyValues);
    const newHistoryEntry = historyRes.rows[0];

    await client.query('COMMIT');

    // Asynchronous non-blocking status/location email dispatch
    sendStatusUpdateEmail(updatedParcel, newHistoryEntry || {}).catch((err) => {
      console.warn('[Email Skipped - Non-blocking notice]:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: `Live map position for ${updatedParcel.tracking_number} adjusted successfully.`,
      parcel: updatedParcel,
      newCheckpoint: newHistoryEntry,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Adjust Location Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to adjust parcel location.',
    });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/parcels/:id
 * Delete parcel by ID (Cascades to shipment_history)
 * Protected by admin authentication
 */
router.delete('/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleteSql = 'DELETE FROM parcels WHERE id = $1 RETURNING tracking_number';
    const result = await pool.query(deleteSql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Parcel with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Parcel ${result.rows[0].tracking_number} deleted successfully.`,
    });
  } catch (error) {
    console.error('❌ [Delete Parcel Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete parcel.',
    });
  }
});

module.exports = router;
