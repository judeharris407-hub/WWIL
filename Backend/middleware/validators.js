/**
 * ==============================================================================
 * TransGlobe-Logistics
 * Enterprise Input Validation & Sanitization Middleware (/middleware/validators.js)
 * ==============================================================================
 * Enforces strict typing, string length limits, coordinate boundaries,
 * and honeypot bot trap validation using Zod.
 */

const { z } = require('zod');

/**
 * Higher-order middleware to validate req.body against a Zod schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join('.') || 'body'}: ${err.message}`
      );
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages,
      });
    }
    // Assign validated and cleaned data back to req.body
    req.body = result.data;
    next();
  };
}

// ------------------------------------------------------------------------------
// 1. Admin Login Schema
// ------------------------------------------------------------------------------
const adminLoginSchema = z.object({
  email: z
    .string({ required_error: 'Corporate email is required' })
    .trim()
    .email('Invalid corporate email address')
    .max(128, 'Email must be under 128 characters'),
  password: z
    .string({ required_error: 'Operations security key is required' })
    .min(1, 'Security key cannot be empty')
    .max(128, 'Security key exceeds maximum allowed length'),
});

// ------------------------------------------------------------------------------
// 2. Freight Quotation Schema (with Honeypot Bot Trap)
// ------------------------------------------------------------------------------
const quoteSubmissionSchema = z.object({
  freightType: z.string().trim().max(64).optional(),
  freight_type: z.string().trim().max(64).optional(),
  departureCountry: z.string().trim().max(100).optional(),
  departure_country: z.string().trim().max(100).optional(),
  recipientCountry: z.string().trim().max(100).optional(),
  recipient_country: z.string().trim().max(100).optional(),
  weight: z.string().trim().max(64).optional(),
  weight_kg: z.string().trim().max(64).optional(),
  fullName: z.string().trim().max(128).optional(),
  full_name: z.string().trim().max(128).optional(),
  email: z.string().trim().email('Please provide a valid corporate email address').max(128),
  phone: z.string().trim().max(32).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  // Honeypot Field: Bots routinely fill this in; legitimate users never see it.
  company_website: z.string().optional().nullable(),
}).refine(
  (data) => {
    // If bot populated the honeypot field, reject
    if (data.company_website && data.company_website.trim().length > 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Automated submission rejected.',
    path: ['company_website'],
  }
).refine(
  (data) => {
    const fType = data.freightType || data.freight_type;
    const dep = data.departureCountry || data.departure_country;
    const rec = data.recipientCountry || data.recipient_country;
    const name = data.fullName || data.full_name;
    return !!(fType && dep && rec && name);
  },
  {
    message: 'freightType, departureCountry, recipientCountry, and fullName are mandatory.',
  }
);

// ------------------------------------------------------------------------------
// 3. Consignment Registration Schema (POST /api/parcels)
// ------------------------------------------------------------------------------
const coordinateSchema = z.coerce
  .number()
  .refine((val) => !isNaN(val), 'Coordinate must be a valid number');

const latitudeSchema = coordinateSchema.refine(
  (val) => val >= -90 && val <= 90,
  'Latitude must be between -90 and 90 degrees'
);

const longitudeSchema = coordinateSchema.refine(
  (val) => val >= -180 && val <= 180,
  'Longitude must be between -180 and 180 degrees'
);

const createParcelSchema = z.object({
  tracking_number: z.string().trim().min(3).max(64).optional(),
  trackingNumber: z.string().trim().min(3).max(64).optional(),
  sender_name: z.string().trim().min(1).max(255).optional(),
  senderName: z.string().trim().min(1).max(255).optional(),
  sender_phone: z.string().trim().max(64).optional().nullable(),
  senderPhone: z.string().trim().max(64).optional().nullable(),
  recipient_name: z.string().trim().min(1).max(255).optional(),
  recipientName: z.string().trim().min(1).max(255).optional(),
  receiver_name: z.string().trim().min(1).max(255).optional(),
  receiverName: z.string().trim().min(1).max(255).optional(),
  recipient_phone: z.string().trim().max(64).optional().nullable(),
  recipientPhone: z.string().trim().max(64).optional().nullable(),
  recipient_email: z.string().trim().email().max(128).optional().nullable(),
  recipientEmail: z.string().trim().email().max(128).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  origin_address: z.string().trim().min(2).max(255).optional(),
  originAddress: z.string().trim().min(2).max(255).optional(),
  destination_address: z.string().trim().min(2).max(255).optional(),
  destinationAddress: z.string().trim().min(2).max(255).optional(),
  origin_lat: latitudeSchema.optional().nullable(),
  originLat: latitudeSchema.optional().nullable(),
  origin_lng: longitudeSchema.optional().nullable(),
  originLng: longitudeSchema.optional().nullable(),
  dest_lat: latitudeSchema.optional().nullable(),
  destLat: latitudeSchema.optional().nullable(),
  dest_lng: longitudeSchema.optional().nullable(),
  destLng: longitudeSchema.optional().nullable(),
  current_lat: latitudeSchema.optional().nullable(),
  currentLat: latitudeSchema.optional().nullable(),
  current_lng: longitudeSchema.optional().nullable(),
  currentLng: longitudeSchema.optional().nullable(),
  current_location_name: z.string().trim().max(255).optional().nullable(),
  currentLocationName: z.string().trim().max(255).optional().nullable(),
  transport_mode: z.string().trim().max(64).optional(),
  transportMode: z.string().trim().max(64).optional(),
  type: z.string().trim().max(64).optional(),
  status: z.string().trim().max(64).optional(),
  estimated_delivery: z.string().trim().max(128).optional().nullable(),
  estimatedDelivery: z.string().trim().max(128).optional().nullable(),
  eta: z.string().trim().max(128).optional().nullable(),
  carrier_name: z.string().trim().max(128).optional().nullable(),
  carrierName: z.string().trim().max(128).optional().nullable(),
  carrier: z.string().trim().max(128).optional().nullable(),
  vessel_or_flight: z.string().trim().max(128).optional().nullable(),
  vesselOrFlight: z.string().trim().max(128).optional().nullable(),
  conveyance: z.string().trim().max(128).optional().nullable(),
  weight_kg: z.any().optional(),
  weightKg: z.any().optional(),
  weight: z.any().optional(),
  volume_cbm: z.any().optional(),
  volumeCbm: z.any().optional(),
}).refine(
  (data) => {
    const trk = data.tracking_number || data.trackingNumber;
    const sender = data.sender_name || data.senderName;
    const rec = data.recipient_name || data.recipientName || data.receiver_name || data.receiverName;
    const orig = data.origin_address || data.originAddress;
    const dest = data.destination_address || data.destinationAddress;
    return !!(trk && sender && rec && orig && dest);
  },
  {
    message: 'tracking_number, sender_name, recipient_name, origin_address, and destination_address are required.',
  }
);

// ------------------------------------------------------------------------------
// 4. Live Waypoint Location Adjustment Schema (PATCH /api/parcels/:id/location)
// ------------------------------------------------------------------------------
const patchLocationSchema = z.object({
  current_lat: latitudeSchema.optional(),
  currentLat: latitudeSchema.optional(),
  lat: latitudeSchema.optional(),
  latitude: latitudeSchema.optional(),
  current_lng: longitudeSchema.optional(),
  currentLng: longitudeSchema.optional(),
  lng: longitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  location_name: z.string().trim().max(255).optional().nullable(),
  locationName: z.string().trim().max(255).optional().nullable(),
  status: z.string().trim().max(64).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
}).refine(
  (data) => {
    const hasLat = data.current_lat !== undefined || data.currentLat !== undefined || data.lat !== undefined || data.latitude !== undefined;
    const hasLng = data.current_lng !== undefined || data.currentLng !== undefined || data.lng !== undefined || data.longitude !== undefined;
    return hasLat && hasLng;
  },
  {
    message: 'Valid coordinates (latitude and longitude) are required.',
  }
);

module.exports = {
  validateBody,
  adminLoginSchema,
  quoteSubmissionSchema,
  createParcelSchema,
  patchLocationSchema,
};
