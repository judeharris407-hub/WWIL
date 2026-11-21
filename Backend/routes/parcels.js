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
router.post('/', verifyAdminToken, async (req, res) => {
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
  const resolvedOriginLat = Number(origin_lat ?? originLat ?? 0);
  const resolvedOriginLng = Number(origin_lng ?? originLng ?? 0);
  const resolvedDestLat = Number(dest_lat ?? destLat ?? 0);
  const resolvedDestLng = Number(dest_lng ?? destLng ?? 0);
  const resolvedCurrentLat = Number(current_lat ?? currentLat ?? resolvedOriginLat);
  const resolvedCurrentLng = Number(current_lng ?? currentLng ?? resolvedOriginLng);
  const resolvedCurrentLocationName = (current_location_name || currentLocationName || `${resolvedOriginAddress} Outbound Terminal`).toString().trim();
  const resolvedWeight = (weight_kg || weightKg || weight) ? String(weight_kg || weightKg || weight).trim() : null;
  const resolvedVolume = (volume_cbm || volumeCbm) ? String(volume_cbm || volumeCbm).trim() : null;
  const resolvedCarrier = (carrier_name || carrierName || carrier || 'WWIL Global Logistics Network').toString().trim();
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
      'Shipment manifested and registered into WWIL international logistics network.',
    ];

    const historyResult = await client.query(insertHistorySql, historyValues);

    await client.query('COMMIT');

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
        carrier_name = COALESCE($12, carrier_name),
        vessel_or_flight = COALESCE($13, vessel_or_flight),
        weight_kg = COALESCE($14, weight_kg),
        volume_cbm = COALESCE($15, volume_cbm),
        progress_percent = COALESCE($16, progress_percent),
        sender_phone = COALESCE($17, sender_phone),
        recipient_phone = COALESCE($18, recipient_phone),
        recipient_email = COALESCE($19, recipient_email),
        description = COALESCE($20, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $21
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
router.patch('/:id/location', verifyAdminToken, async (req, res) => {
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
