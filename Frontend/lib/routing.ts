/**
 * ==============================================================================
 * Worldwide International Logistics (WWIL)
 * High-Precision Multi-Modal Routing Engine (/lib/routing.ts)
 * ==============================================================================
 * Supports:
 * 1. Ground Freight: OSRM highway driving geometry (Origin -> Current -> Destination)
 * 2. Ocean Freight: Realistic maritime corridors through oceanic straits & choke points
 * 3. Air Freight: Geodesic Great-Circle spherical interpolation arcs
 * 4. Antimeridian Handling: Prevents horizontal line shooting across the 180° meridian
 * 5. Completed vs. Remaining Leg splitting for dynamic visual progress rendering
 */

export type TransportCategory = 'Air' | 'Ocean' | 'Ground';

export interface RouteLegs {
  fullRoute: [number, number][];
  completedLeg: [number, number][];
  remainingLeg: [number, number][];
  isHighway: boolean;
  mode: TransportCategory;
}

// In-memory route cache to minimize network roundtrips
const routeCache = new Map<string, [number, number][]>();

/**
 * Normalizes any string transport mode into 'Air' | 'Ocean' | 'Ground'
 */
export function normalizeTransportMode(modeString?: string): TransportCategory {
  if (!modeString) return 'Air';
  const m = modeString.toLowerCase().trim();
  if (m.includes('ocean') || m.includes('sea') || m.includes('marine') || m.includes('vessel') || m.includes('ship')) {
    return 'Ocean';
  }
  if (m.includes('ground') || m.includes('road') || m.includes('land') || m.includes('truck') || m.includes('rail')) {
    return 'Ground';
  }
  return 'Air';
}

// -----------------------------------------------------------------------------
// 1. ANTIMERIDIAN & LONGITUDE UNWRAPPING
// -----------------------------------------------------------------------------

/**
 * Unwraps longitudes continuously so that no two consecutive coordinates
 * jump across the 180° Antimeridian / International Date Line.
 * Prevents Leaflet polylines from shooting horizontally across the entire map.
 */
export function unwrapLongitudes(coords: [number, number][]): [number, number][] {
  if (!coords || coords.length < 2) return coords;

  const result: [number, number][] = [[coords[0][0], coords[0][1]]];

  for (let i = 1; i < coords.length; i++) {
    const prevLng = result[i - 1][1];
    let curLng = coords[i][1];

    // Adjust longitude until the distance to previous longitude is <= 180 degrees
    while (curLng - prevLng > 180) {
      curLng -= 360;
    }
    while (curLng - prevLng < -180) {
      curLng += 360;
    }

    result.push([coords[i][0], curLng]);
  }

  return result;
}

// -----------------------------------------------------------------------------
// 2. GEODESIC GREAT-CIRCLE INTERPOLATION (AIR FREIGHT)
// -----------------------------------------------------------------------------

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Computes a smooth Geodesic Great-Circle arc between two geographic points
 * using Spherical Linear Interpolation (SLERP) on a unit sphere.
 */
export function generateGreatCircleArc(
  start: [number, number],
  end: [number, number],
  numPoints = 40
): [number, number][] {
  const lat1 = toRad(start[0]);
  let lng1 = start[1];
  const lat2 = toRad(end[0]);
  let lng2 = end[1];

  // Take the shortest longitudinal delta
  let diffLng = lng2 - lng1;
  if (diffLng > 180) lng2 -= 360;
  if (diffLng < -180) lng2 += 360;

  const radLng1 = toRad(lng1);
  const radLng2 = toRad(lng2);

  // Convert to Cartesian 3D unit vectors
  const p1 = [
    Math.cos(lat1) * Math.cos(radLng1),
    Math.cos(lat1) * Math.sin(radLng1),
    Math.sin(lat1),
  ];
  const p2 = [
    Math.cos(lat2) * Math.cos(radLng2),
    Math.cos(lat2) * Math.sin(radLng2),
    Math.sin(lat2),
  ];

  // Angular distance between vectors
  let dot = p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2];
  dot = Math.max(-1, Math.min(1, dot));
  const omega = Math.acos(dot);

  if (omega < 0.0001) {
    return [start, end];
  }

  const sinOmega = Math.sin(omega);
  const points: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const a = Math.sin((1 - f) * omega) / sinOmega;
    const b = Math.sin(f * omega) / sinOmega;

    const x = a * p1[0] + b * p2[0];
    const y = a * p1[1] + b * p2[1];
    const z = a * p1[2] + b * p2[2];

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lng = toDeg(Math.atan2(y, x));

    points.push([Number(lat.toFixed(4)), Number(lng.toFixed(4))]);
  }

  return unwrapLongitudes(points);
}

// -----------------------------------------------------------------------------
// 3. MARITIME CORRIDOR ROUTING (OCEAN FREIGHT)
// -----------------------------------------------------------------------------

/**
 * Key global maritime choke points & nautical waypoints.
 * Real container ships navigate through these channels instead of crossing land.
 */
const MARITIME_WAYPOINTS = {
  ENGLISH_CHANNEL: [50.2, -0.5] as [number, number],
  GIBRALTAR: [35.95, -5.5] as [number, number],
  SUEZ_NORTH: [31.25, 32.3] as [number, number],
  BAB_EL_MANDEB: [12.6, 43.3] as [number, number],
  MALACCA: [1.3, 103.8] as [number, number],
  PANAMA_CARIBBEAN: [9.35, -79.9] as [number, number],
  PANAMA_PACIFIC: [8.9, -79.55] as [number, number],
  CAPE_GOOD_HOPE: [-34.8, 19.5] as [number, number],
  MID_NORTH_ATLANTIC: [38.0, -42.0] as [number, number],
  MID_NORTH_PACIFIC: [32.0, -165.0] as [number, number],
  SOUTH_CHINA_SEA: [14.0, 114.0] as [number, number],
  ARABIAN_SEA: [20.0, 64.0] as [number, number],
  BAY_OF_BENGAL: [8.0, 85.0] as [number, number],
  ROTTERDAM_COAST: [52.1, 3.8] as [number, number],
  HAMBURG_COAST: [54.0, 7.8] as [number, number],
  SHANGHAI_COAST: [31.2, 122.5] as [number, number],
  TOKYO_COAST: [34.8, 140.2] as [number, number],
  DUBAI_COAST: [25.3, 55.4] as [number, number],
  SINGAPORE_COAST: [1.25, 103.85] as [number, number],
  US_EAST_COAST: [36.0, -74.5] as [number, number],
  US_WEST_COAST: [33.5, -119.0] as [number, number],
  GULF_OF_MEXICO: [26.0, -88.0] as [number, number],
};

/**
 * Finds intermediate maritime navigation waypoints for ocean shipping
 * to keep vessels in international shipping lanes and open waters.
 */
function getMaritimeCorridorWaypoints(
  origin: [number, number],
  destination: [number, number]
): [number, number][] {
  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;

  const isEurope1 = lat1 > 35 && lng1 > -15 && lng1 < 30;
  const isEurope2 = lat2 > 35 && lng2 > -15 && lng2 < 30;

  const isNorthAmericaEast1 = lat1 > 20 && lat1 < 55 && lng1 < -55 && lng1 > -100;
  const isNorthAmericaEast2 = lat2 > 20 && lat2 < 55 && lng2 < -55 && lng2 > -100;

  const isNorthAmericaWest1 = lat1 > 25 && lat1 < 60 && lng1 < -110 && lng1 > -130;
  const isNorthAmericaWest2 = lat2 > 25 && lat2 < 60 && lng2 < -110 && lng2 > -130;

  const isEastAsia1 = lat1 > 10 && lat1 < 45 && lng1 > 100 && lng1 < 145;
  const isEastAsia2 = lat2 > 10 && lat2 < 45 && lng2 > 100 && lng2 < 145;

  const isMiddleEast1 = lat1 > 15 && lat1 < 32 && lng1 > 45 && lng1 < 65;
  const isMiddleEast2 = lat2 > 15 && lat2 < 32 && lng2 > 45 && lng2 < 65;

  // Case 1: Transatlantic (Europe <-> North America East)
  if ((isEurope1 && isNorthAmericaEast2) || (isEurope2 && isNorthAmericaEast1)) {
    return [
      MARITIME_WAYPOINTS.ENGLISH_CHANNEL,
      MARITIME_WAYPOINTS.MID_NORTH_ATLANTIC,
      MARITIME_WAYPOINTS.US_EAST_COAST,
    ];
  }

  // Case 2: Europe <-> East Asia (via English Channel, Gibraltar, Suez, Bab-el-Mandeb, Malacca)
  if ((isEurope1 && isEastAsia2) || (isEurope2 && isEastAsia1)) {
    const waypoints = [
      MARITIME_WAYPOINTS.ENGLISH_CHANNEL,
      MARITIME_WAYPOINTS.GIBRALTAR,
      MARITIME_WAYPOINTS.SUEZ_NORTH,
      MARITIME_WAYPOINTS.BAB_EL_MANDEB,
      MARITIME_WAYPOINTS.BAY_OF_BENGAL,
      MARITIME_WAYPOINTS.MALACCA,
      MARITIME_WAYPOINTS.SOUTH_CHINA_SEA,
    ];
    return isEurope1 ? waypoints : waypoints.slice().reverse();
  }

  // Case 3: Europe <-> Middle East (via Gibraltar, Suez, Bab-el-Mandeb, Arabian Sea)
  if ((isEurope1 && isMiddleEast2) || (isEurope2 && isMiddleEast1)) {
    const waypoints = [
      MARITIME_WAYPOINTS.ENGLISH_CHANNEL,
      MARITIME_WAYPOINTS.GIBRALTAR,
      MARITIME_WAYPOINTS.SUEZ_NORTH,
      MARITIME_WAYPOINTS.BAB_EL_MANDEB,
      MARITIME_WAYPOINTS.ARABIAN_SEA,
    ];
    return isEurope1 ? waypoints : waypoints.slice().reverse();
  }

  // Case 4: Transpacific (East Asia <-> North America West)
  if ((isEastAsia1 && isNorthAmericaWest2) || (isEastAsia2 && isNorthAmericaWest1)) {
    return [
      MARITIME_WAYPOINTS.TOKYO_COAST,
      MARITIME_WAYPOINTS.MID_NORTH_PACIFIC,
      MARITIME_WAYPOINTS.US_WEST_COAST,
    ];
  }

  // Case 5: East Asia <-> Middle East (via South China Sea, Malacca, Indian Ocean, Arabian Sea)
  if ((isEastAsia1 && isMiddleEast2) || (isEastAsia2 && isMiddleEast1)) {
    const waypoints = [
      MARITIME_WAYPOINTS.SOUTH_CHINA_SEA,
      MARITIME_WAYPOINTS.MALACCA,
      MARITIME_WAYPOINTS.BAY_OF_BENGAL,
      MARITIME_WAYPOINTS.ARABIAN_SEA,
    ];
    return isEastAsia1 ? waypoints : waypoints.slice().reverse();
  }

  // Case 6: US East Coast <-> US West Coast (via Panama Canal)
  if ((isNorthAmericaEast1 && isNorthAmericaWest2) || (isNorthAmericaEast2 && isNorthAmericaWest1)) {
    const waypoints = [
      MARITIME_WAYPOINTS.US_EAST_COAST,
      MARITIME_WAYPOINTS.GULF_OF_MEXICO,
      MARITIME_WAYPOINTS.PANAMA_CARIBBEAN,
      MARITIME_WAYPOINTS.PANAMA_PACIFIC,
      MARITIME_WAYPOINTS.US_WEST_COAST,
    ];
    return isNorthAmericaEast1 ? waypoints : waypoints.slice().reverse();
  }

  // Fallback: If both points are far apart, use mid-ocean navigation arc
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  // Subtle oceanic curve offset
  const oceanOffset = midLat > 0 ? -4 : 4;
  return [[midLat + oceanOffset, midLng]];
}

/**
 * Generates a realistic maritime route through water bodies and choke points
 */
export function generateMaritimeRoute(
  origin: [number, number],
  destination: [number, number],
  waypoints?: [number, number][]
): [number, number][] {
  const corridorPoints = getMaritimeCorridorWaypoints(origin, destination);
  const fullSeq = [origin, ...(waypoints || corridorPoints), destination];

  const fullPath: [number, number][] = [];

  for (let i = 0; i < fullSeq.length - 1; i++) {
    const pA = fullSeq[i];
    const pB = fullSeq[i + 1];
    const seg = generateGreatCircleArc(pA, pB, 15);
    if (i > 0) seg.shift(); // Avoid duplicating joining vertex
    fullPath.push(...seg);
  }

  return unwrapLongitudes(fullPath);
}

// -----------------------------------------------------------------------------
// 4. OSRM ROAD ROUTING (GROUND FREIGHT)
// -----------------------------------------------------------------------------

/**
 * Fetch realistic road highway routing from public OSRM.
 * Note: OSRM expects coordinates in {longitude},{latitude} order!
 */
export async function fetchRoadRoute(
  origin: [number, number],
  destination: [number, number],
  waypoints?: [number, number][]
): Promise<[number, number][] | null> {
  try {
    const formatCoord = (c: [number, number]) => `${c[0].toFixed(3)},${c[1].toFixed(3)}`;
    const allPoints = [origin, ...(waypoints || []), destination];
    const cacheKey = allPoints.map(formatCoord).join('|');

    if (routeCache.has(cacheKey)) {
      return routeCache.get(cacheKey) || null;
    }

    // OSRM format: lng1,lat1;lng2,lat2;...
    const osrmPoints = allPoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${osrmPoints}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const leafletCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      const unwrapped = unwrapLongitudes(leafletCoords);
      routeCache.set(cacheKey, unwrapped);
      return unwrapped;
    }

    return null;
  } catch (error) {
    console.warn('OSRM routing fetch failed:', error);
    return null;
  }
}

// -----------------------------------------------------------------------------
// 5. COMPLETED VS. REMAINING ROUTE SPLITTING
// -----------------------------------------------------------------------------

/**
 * Calculates the Euclidean squared distance between two coordinates
 */
function distSq(c1: [number, number], c2: [number, number]): number {
  const dLat = c1[0] - c2[0];
  const dLng = c1[1] - c2[1];
  return dLat * dLat + dLng * dLng;
}

/**
 * Splits a full coordinate route into a Completed Leg and a Remaining Leg
 * based on the current position or shipment status.
 */
export function splitRouteAtCurrentPosition(
  routeCoords: [number, number][],
  currentPos: [number, number],
  status?: string
): { completedLeg: [number, number][]; remainingLeg: [number, number][] } {
  if (!routeCoords || routeCoords.length < 2) {
    return {
      completedLeg: routeCoords || [],
      remainingLeg: [],
    };
  }

  // Edge cases based on status
  if (status === 'Delivered') {
    return {
      completedLeg: routeCoords,
      remainingLeg: [],
    };
  }

  if (status === 'Order Received') {
    return {
      completedLeg: [routeCoords[0]],
      remainingLeg: routeCoords,
    };
  }

  // Find the index on the route closest to the current position
  let closestIndex = 0;
  let minDist = Infinity;

  for (let i = 0; i < routeCoords.length; i++) {
    const d = distSq(routeCoords[i], currentPos);
    if (d < minDist) {
      minDist = d;
      closestIndex = i;
    }
  }

  // Ensure completed leg has at least 2 points (origin to current)
  // and remaining leg has at least 2 points (current to destination)
  const completedLeg = routeCoords.slice(0, closestIndex + 1);
  if (completedLeg.length === 1 && routeCoords.length > 1) {
    completedLeg.push(currentPos);
  } else if (completedLeg.length > 0) {
    completedLeg[completedLeg.length - 1] = currentPos;
  }

  const remainingLeg = [currentPos, ...routeCoords.slice(closestIndex + 1)];

  return {
    completedLeg: unwrapLongitudes(completedLeg),
    remainingLeg: unwrapLongitudes(remainingLeg),
  };
}

// -----------------------------------------------------------------------------
// 6. PRIMARY MODE-AWARE ROUTE BUILDER
// -----------------------------------------------------------------------------

/**
 * Primary helper: dynamically computes the full route, completed leg,
 * and remaining leg tailored specifically to the shipment's mode of transport.
 */
export async function calculateModeAwareRoute(options: {
  origin: [number, number];
  destination: [number, number];
  current?: [number, number];
  transportMode?: string;
  status?: string;
  existingRoute?: [number, number][];
}): Promise<RouteLegs> {
  const { origin, destination, current, transportMode, status, existingRoute } = options;
  const mode = normalizeTransportMode(transportMode);
  const currentPos = current || origin;

  // 1. Ground Freight: Query OSRM over road network
  if (mode === 'Ground') {
    // If in transit, pass current position as waypoint
    const waypoints = (status !== 'Order Received' && current) ? [current] : undefined;
    const roadPoints = await fetchRoadRoute(origin, destination, waypoints);

    if (roadPoints && roadPoints.length > 2) {
      const split = splitRouteAtCurrentPosition(roadPoints, currentPos, status);
      return {
        fullRoute: roadPoints,
        completedLeg: split.completedLeg,
        remainingLeg: split.remainingLeg,
        isHighway: true,
        mode: 'Ground',
      };
    }
  }

  // 2. Ocean Freight: Maritime corridors through straits & choke points
  if (mode === 'Ocean') {
    const oceanPoints = generateMaritimeRoute(origin, destination, current ? [current] : undefined);
    const split = splitRouteAtCurrentPosition(oceanPoints, currentPos, status);
    return {
      fullRoute: oceanPoints,
      completedLeg: split.completedLeg,
      remainingLeg: split.remainingLeg,
      isHighway: false,
      mode: 'Ocean',
    };
  }

  // 3. Air Freight: Geodesic Great-Circle spherical interpolation
  if (mode === 'Air') {
    let airPoints: [number, number][];

    if (current && status !== 'Order Received' && status !== 'Delivered') {
      const leg1 = generateGreatCircleArc(origin, current, 25);
      const leg2 = generateGreatCircleArc(current, destination, 25);
      leg2.shift();
      airPoints = unwrapLongitudes([...leg1, ...leg2]);
    } else {
      airPoints = generateGreatCircleArc(origin, destination, 50);
    }

    const split = splitRouteAtCurrentPosition(airPoints, currentPos, status);
    return {
      fullRoute: airPoints,
      completedLeg: split.completedLeg,
      remainingLeg: split.remainingLeg,
      isHighway: false,
      mode: 'Air',
    };
  }

  // Fallback to existing route if provided or direct line
  const fallbackPoints = existingRoute && existingRoute.length > 1
    ? unwrapLongitudes(existingRoute)
    : unwrapLongitudes([origin, currentPos, destination]);

  const split = splitRouteAtCurrentPosition(fallbackPoints, currentPos, status);

  return {
    fullRoute: fallbackPoints,
    completedLeg: split.completedLeg,
    remainingLeg: split.remainingLeg,
    isHighway: false,
    mode,
  };
}
