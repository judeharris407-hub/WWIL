/**
 * ==============================================================================
 * TransGlobe-Logistics
 * Geodesic Route Interpolation Utility (/utils/routeInterpolation.ts)
 * ==============================================================================
 * Implements ETA-driven spherical linear interpolation (slerp) along great-circle
 * routes for real-time aircraft, vessel, and multimodal container positioning.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Robust timestamp parser supporting ISO strings, dates, Unix timestamps,
 * and relative duration strings (e.g., "In 3 Business Days", "In 48 Hours").
 */
export function parseTimestamp(value: any, baseMs: number = Date.now()): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Handle numeric epoch timestamps
  if (typeof value === 'number') {
    if (isNaN(value)) return null;
    return value > 1e11 ? value : value * 1000;
  }

  const str = String(value).trim();
  if (!str) return null;

  // Match relative duration expressions
  const bizDaysMatch = str.match(/in\s+(\d+)\s*(?:business\s*)?days?/i);
  if (bizDaysMatch) {
    const days = parseInt(bizDaysMatch[1], 10);
    const d = new Date(baseMs);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }
    return d.getTime();
  }

  const daysMatch = str.match(/in\s+(\d+)\s*days?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return baseMs + days * 24 * 60 * 60 * 1000;
  }

  const hoursMatch = str.match(/in\s+(\d+)\s*hours?/i);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    return baseMs + hours * 60 * 60 * 1000;
  }

  const weeksMatch = str.match(/in\s+(\d+)\s*weeks?/i);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    return baseMs + weeks * 7 * 24 * 60 * 60 * 1000;
  }

  // Standard date parsing
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return null;
}

/**
 * Spherical Linear Interpolation (slerp) along the Earth's great-circle arc.
 * Maps coordinates to 3D Cartesian space on a unit sphere to prevent pole
 * distortion and wrap-around longitude discontinuities.
 */
export function slerp(p1: LatLng, p2: LatLng, t: number): LatLng {
  if (t <= 0) return { lat: p1.lat, lng: p1.lng };
  if (t >= 1) return { lat: p2.lat, lng: p2.lng };

  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const phi1 = p1.lat * toRad;
  const lambda1 = p1.lng * toRad;
  const phi2 = p2.lat * toRad;
  const lambda2 = p2.lng * toRad;

  // Convert to 3D Cartesian coordinates on unit sphere
  const x1 = Math.cos(phi1) * Math.cos(lambda1);
  const y1 = Math.cos(phi1) * Math.sin(lambda1);
  const z1 = Math.sin(phi1);

  const x2 = Math.cos(phi2) * Math.cos(lambda2);
  const y2 = Math.cos(phi2) * Math.sin(lambda2);
  const z2 = Math.sin(phi2);

  // Dot product clamped to [-1, 1]
  let dot = x1 * x2 + y1 * y2 + z1 * z2;
  dot = Math.max(-1, Math.min(1, dot));

  const omega = Math.acos(dot);

  // Fall back to linear interpolation if coordinates are virtually identical
  if (Math.abs(omega) < 1e-6 || Math.sin(omega) === 0) {
    return {
      lat: p1.lat + (p2.lat - p1.lat) * t,
      lng: p1.lng + (p2.lng - p1.lng) * t,
    };
  }

  const sinOmega = Math.sin(omega);
  const a = Math.sin((1 - t) * omega) / sinOmega;
  const b = Math.sin(t * omega) / sinOmega;

  const x = a * x1 + b * x2;
  const y = a * y1 + b * y2;
  const z = a * z1 + b * z2;

  const r = Math.sqrt(x * x + y * y + z * z);
  const lat = Math.asin(Math.max(-1, Math.min(1, z / r))) * toDeg;
  const lng = Math.atan2(y, x) * toDeg;

  return { lat, lng };
}

/**
 * Calculates the current real-time progress fraction (0.0 to 1.0) of a shipment.
 */
export function calculateLiveProgress(parcel: any, now: number = Date.now()): number {
  if (!parcel) return 0;

  const rawStatus = (parcel.status || '').toString().trim().toLowerCase();
  if (rawStatus === 'delivered' || rawStatus.includes('deliver')) {
    return 1;
  }
  if (rawStatus === 'order received') {
    return 0;
  }

  const departureVal =
    parcel.departure_at ??
    parcel.departureAt ??
    parcel.created_at ??
    parcel.createdAt ??
    parcel.departedAt;

  const etaVal =
    parcel.eta_at ??
    parcel.etaAt ??
    parcel.estimated_delivery ??
    parcel.estimatedDelivery ??
    parcel.eta;

  const departureMs = parseTimestamp(departureVal, now) || now;
  const etaMs = parseTimestamp(etaVal, departureMs);

  if (!etaMs || etaMs <= departureMs) {
    return (parcel.progress_percent || parcel.progressPercent || 0) / 100;
  }

  return Math.min(1, Math.max(0, (now - departureMs) / (etaMs - departureMs)));
}

/**
 * Core Geodesic Position Interpolator:
 * 1. If 'Delivered', returns destination coordinates.
 * 2. If 'On Hold' / 'Customs Hold', returns frozen stored current coordinates.
 * 3. Computes progress t between departure and eta, performing great-circle slerp.
 * 4. Gracefully falls back to stored coordinates if timestamps or coordinates are missing.
 */
export function calculateLivePosition(parcel: any, now: number = Date.now()): LatLng {
  if (!parcel) {
    return { lat: 0, lng: 0 };
  }

  // 1. Resolve coordinates across camelCase, snake_case, and nested structure
  const rawDestLat = parcel.dest_lat ?? parcel.destLat ?? parcel.destination?.lat;
  const rawDestLng = parcel.dest_lng ?? parcel.destLng ?? parcel.destination?.lng;
  const hasDest =
    rawDestLat !== undefined &&
    rawDestLat !== null &&
    !isNaN(Number(rawDestLat)) &&
    rawDestLng !== undefined &&
    rawDestLng !== null &&
    !isNaN(Number(rawDestLng));
  const destLat = hasDest ? Number(rawDestLat) : 0;
  const destLng = hasDest ? Number(rawDestLng) : 0;

  const rawOriginLat = parcel.origin_lat ?? parcel.originLat ?? parcel.origin?.lat;
  const rawOriginLng = parcel.origin_lng ?? parcel.originLng ?? parcel.origin?.lng;
  const hasOrigin =
    rawOriginLat !== undefined &&
    rawOriginLat !== null &&
    !isNaN(Number(rawOriginLat)) &&
    rawOriginLng !== undefined &&
    rawOriginLng !== null &&
    !isNaN(Number(rawOriginLng));
  const originLat = hasOrigin ? Number(rawOriginLat) : destLat;
  const originLng = hasOrigin ? Number(rawOriginLng) : destLng;

  const rawCurrentLat =
    parcel.current_lat ?? parcel.currentLat ?? parcel.currentLocation?.lat ?? originLat;
  const rawCurrentLng =
    parcel.current_lng ?? parcel.currentLng ?? parcel.currentLocation?.lng ?? originLng;
  const currentLat = Number(rawCurrentLat ?? originLat);
  const currentLng = Number(rawCurrentLng ?? originLng);

  // 2. Status inspection
  const status = (parcel.status || '').toString().trim().toLowerCase();

  // If Delivered -> return destination coordinates
  if (status === 'delivered' || status.includes('deliver')) {
    if (hasDest) {
      return { lat: destLat, lng: destLng };
    }
    return { lat: currentLat, lng: currentLng };
  }

  // If On Hold / Customs Hold -> freeze movement at stored coordinates
  if (status === 'on hold' || status === 'customs hold' || status.includes('hold')) {
    return { lat: currentLat, lng: currentLng };
  }

  // If Order Received -> stay at origin
  if (status === 'order received') {
    if (hasOrigin) {
      return { lat: originLat, lng: originLng };
    }
    return { lat: currentLat, lng: currentLng };
  }

  // 3. Timestamps inspection
  const departureVal =
    parcel.departure_at ??
    parcel.departureAt ??
    parcel.created_at ??
    parcel.createdAt ??
    parcel.departedAt;

  const etaVal =
    parcel.eta_at ??
    parcel.etaAt ??
    parcel.estimated_delivery ??
    parcel.estimatedDelivery ??
    parcel.eta;

  const departureMs = parseTimestamp(departureVal, now) || parseTimestamp(parcel.created_at, now);
  const etaMs = parseTimestamp(etaVal, departureMs || now);

  // Fallback if missing destination or timestamps
  if (!departureMs || !etaMs || etaMs <= departureMs || !hasDest) {
    return { lat: currentLat, lng: currentLng };
  }

  // 4. Clamped progress computation
  const t = Math.min(1, Math.max(0, (now - departureMs) / (etaMs - departureMs)));

  if (t <= 0) {
    return { lat: originLat, lng: originLng };
  }
  if (t >= 1) {
    return { lat: destLat, lng: destLng };
  }

  // 5. Great-circle spherical linear interpolation
  return slerp({ lat: originLat, lng: originLng }, { lat: destLat, lng: destLng }, t);
}

export default calculateLivePosition;
