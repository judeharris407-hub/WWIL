export interface Checkpoint {
  time: string;
  location: string;
  title: string;
  detail: string;
  completed: boolean;
}

export interface Shipment {
  id: string;
  dbId?: number;
  type: 'Air' | 'Ocean' | 'Ground';
  carrier: string;
  conveyance: string;
  senderName?: string;
  senderPhone?: string;
  receiverName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  description?: string;
  origin: {
    name: string;
    portCode: string;
    country: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    portCode: string;
    country: string;
    lat: number;
    lng: number;
  };
  currentLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  status: 'Order Received' | 'In Transit' | 'On Hold / Customs' | 'Out for Delivery' | 'Delivered';
  statusStep: 1 | 2 | 3 | 4 | 5; // 1: Order Received, 2: In Transit, 3: On Hold/Customs, 4: Out for Delivery, 5: Delivered
  eta: string;
  departedAt: string;
  pieces: string;
  weight: string;
  serviceLevel: string;
  routeCoordinates: [number, number][];
  checkpoints: Checkpoint[];
  lastUpdated?: string;
}

// Zero hardcoded mock parcels — live PostgreSQL is the sole source of truth
export const mockShipments: Record<string, Shipment> = {};

const STORAGE_KEY = 'transglobe_enterprise_shipments_v1';

// Safe LocalStorage getter
export function getStoredShipments(): Record<string, Shipment> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed || {};
  } catch (err) {
    console.warn('Error reading from localStorage:', err);
    return {};
  }
}

// Safe LocalStorage setter
export function saveAllShipments(shipments: Record<string, Shipment>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    window.dispatchEvent(new CustomEvent('wwil:shipments-updated', { detail: shipments }));
  } catch (err) {
    console.error('Error saving shipments to localStorage:', err);
  }
}

// Retrieve single shipment from local storage (or null if not stored)
export function getShipmentById(id: string): Shipment | null {
  if (!id) return null;
  const normalizedId = id.trim().toUpperCase();
  const all = getStoredShipments();

  if (all[normalizedId]) {
    return all[normalizedId];
  }

  return null;
}

// Add or update a shipment in storage
export function upsertShipment(shipment: Shipment): void {
  const current = getStoredShipments();
  current[shipment.id] = {
    ...shipment,
    lastUpdated: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  saveAllShipments(current);
}

// Update specific shipment status
export function updateShipmentStatus(
  id: string,
  newStatus: Shipment['status'],
  notes?: string
): Shipment | null {
  const current = getStoredShipments();
  if (!current[id]) return null;

  const target = current[id];
  let statusStep: Shipment['statusStep'] = 1;

  if (newStatus === 'Order Received') statusStep = 1;
  else if (newStatus === 'In Transit') statusStep = 2;
  else if (newStatus === 'On Hold / Customs') statusStep = 3;
  else if (newStatus === 'Out for Delivery') statusStep = 4;
  else if (newStatus === 'Delivered') statusStep = 5;

  const newCheckpoint: Checkpoint = {
    time: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    location: target.currentLocation.name,
    title: `Status: ${newStatus}`,
    detail: notes || `Shipment progression transitioned to ${newStatus}.`,
    completed: true,
  };

  const updated: Shipment = {
    ...target,
    status: newStatus,
    statusStep,
    checkpoints: [...target.checkpoints, newCheckpoint],
    lastUpdated: 'Just now',
  };

  upsertShipment(updated);
  return updated;
}

// Update shipment transport mode
export function updateShipmentMode(
  id: string,
  newMode: Shipment['type']
): Shipment | null {
  const current = getStoredShipments();
  if (!current[id]) return null;

  const target = current[id];
  const updated: Shipment = {
    ...target,
    type: newMode,
    lastUpdated: 'Just now',
  };

  upsertShipment(updated);
  return updated;
}

// Update shipment current live location
export function updateShipmentLocation(
  id: string,
  lat: number,
  lng: number,
  locationName: string,
  checkpointTitle = 'Waypoint Checkpoint',
  checkpointDetail = 'Position verified and recorded by TransGlobe operations controller.'
): Shipment | null {
  const current = getStoredShipments();
  if (!current[id]) return null;

  const target = current[id];

  const newCheckpoint: Checkpoint = {
    time: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    location: locationName,
    title: checkpointTitle,
    detail: checkpointDetail,
    completed: true,
  };

  const updated: Shipment = {
    ...target,
    currentLocation: {
      name: locationName,
      lat,
      lng,
    },
    routeCoordinates: [...target.routeCoordinates, [lat, lng]],
    checkpoints: [...target.checkpoints, newCheckpoint],
    lastUpdated: 'Just now',
  };

  upsertShipment(updated);
  return updated;
}

// Append custom checkpoint
export function appendCheckpoint(
  id: string,
  checkpoint: Checkpoint,
  lat?: number,
  lng?: number
): Shipment | null {
  const current = getStoredShipments();
  if (!current[id]) return null;

  const target = current[id];
  const updated: Shipment = {
    ...target,
    checkpoints: [...target.checkpoints, checkpoint],
    lastUpdated: 'Just now',
  };

  if (lat !== undefined && lng !== undefined) {
    updated.currentLocation = {
      name: checkpoint.location,
      lat,
      lng,
    };
    updated.routeCoordinates = [...target.routeCoordinates, [lat, lng]];
  }

  upsertShipment(updated);
  return updated;
}

// Delete shipment
export function deleteShipment(id: string): void {
  const current = getStoredShipments();
  delete current[id];
  saveAllShipments(current);
}

// Reset shipments to factory defaults
export function resetShipmentsToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('wwil:shipments-updated', { detail: {} }));
}

/**
 * Transforms a backend PostgreSQL parcel record into the frontend Shipment model
 */
export function transformBackendParcelToShipment(parcel: any): Shipment {
  const originLat = Number(parcel.origin_lat || 50.0);
  const originLng = Number(parcel.origin_lng || 8.0);
  const destLat = Number(parcel.dest_lat || 40.0);
  const destLng = Number(parcel.dest_lng || -74.0);
  const currentLat = Number(parcel.current_lat || originLat);
  const currentLng = Number(parcel.current_lng || originLng);

  // Determine transport type
  let type: Shipment['type'] = 'Air';
  const modeStr = (parcel.transport_mode || '').toLowerCase();
  if (modeStr.includes('ocean') || modeStr.includes('sea') || modeStr.includes('vessel') || modeStr.includes('ship')) {
    type = 'Ocean';
  } else if (modeStr.includes('ground') || modeStr.includes('truck') || modeStr.includes('road') || modeStr.includes('rail')) {
    type = 'Ground';
  }

  // Determine status & statusStep
  let status: Shipment['status'] = 'Order Received';
  let statusStep: Shipment['statusStep'] = 1;

  const rawStatus = (parcel.status || '').toLowerCase();
  if (rawStatus.includes('deliver') && !rawStatus.includes('out')) {
    status = 'Delivered';
    statusStep = 5;
  } else if (rawStatus.includes('out for delivery')) {
    status = 'Out for Delivery';
    statusStep = 4;
  } else if (rawStatus.includes('hold') || rawStatus.includes('customs')) {
    status = 'On Hold / Customs';
    statusStep = 3;
  } else if (rawStatus.includes('transit')) {
    status = 'In Transit';
    statusStep = 2;
  } else {
    status = 'Order Received';
    statusStep = 1;
  }

  // Checkpoints parsing
  const historyList = Array.isArray(parcel.history) ? parcel.history : [];
  const checkpoints: Checkpoint[] = historyList.map((h: any, index: number) => ({
    time: h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) : `Milestone ${index + 1}`,
    location: h.location_name || 'Terminal Waypoint',
    title: h.status || 'Checkpoint Event',
    detail: h.notes || 'Status confirmed in TransGlobe global tracking system.',
    completed: true,
  }));

  // Route Coordinates
  let routeCoordinates: [number, number][] = [
    [originLat, originLng],
    [destLat, destLng],
  ];
  if (historyList.length > 0) {
    const waypointCoords: [number, number][] = historyList
      .filter((h: any) => h.latitude && h.longitude)
      .map((h: any) => [Number(h.latitude), Number(h.longitude)] as [number, number]);
    if (waypointCoords.length > 0) {
      routeCoordinates = [
        [originLat, originLng],
        ...waypointCoords,
        [destLat, destLng],
      ];
    }
  }

  return {
    id: parcel.tracking_number,
    dbId: parcel.id,
    type,
    carrier: parcel.carrier_name || (type === 'Air' ? 'TransGlobe Air Express Alliance' : type === 'Ocean' ? 'TransGlobe Ocean Liner Alliance' : 'TransGlobe Overland Freight Network'),
    conveyance: parcel.vessel_or_flight || (type === 'Air' ? 'Flight TG-904 (Cargo Charter)' : type === 'Ocean' ? 'Vessel MAERSK (Voyage 2608W)' : 'Freight EV-Semi Unit #TX-4890'),
    senderName: parcel.sender_name,
    senderPhone: parcel.sender_phone,
    receiverName: parcel.recipient_name,
    recipientPhone: parcel.recipient_phone,
    recipientEmail: parcel.recipient_email,
    description: parcel.description,
    origin: {
      name: parcel.origin_address,
      portCode: (parcel.origin_address.match(/\b([A-Z]{3,4})\b/) || [null, 'HUB'])[1] || 'HUB',
      country: parcel.origin_address.split(',').pop()?.trim() || 'Global',
      lat: originLat,
      lng: originLng,
    },
    destination: {
      name: parcel.destination_address,
      portCode: (parcel.destination_address.match(/\b([A-Z]{3,4})\b/) || [null, 'HUB'])[1] || 'HUB',
      country: parcel.destination_address.split(',').pop()?.trim() || 'Global',
      lat: destLat,
      lng: destLng,
    },
    currentLocation: {
      name: parcel.current_location_name || parcel.origin_address,
      lat: currentLat,
      lng: currentLng,
    },
    status,
    statusStep,
    eta: parcel.estimated_delivery || 'In 2 Business Days',
    departedAt: parcel.created_at ? new Date(parcel.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Dispatch',
    pieces: 'Commercial Pallets',
    weight: parcel.weight_kg ? (parcel.weight_kg.includes('kg') ? parcel.weight_kg : `${parcel.weight_kg} kg`) : 'Standard Consignment',
    serviceLevel: type === 'Air' ? 'Guaranteed Priority Air Freight' : type === 'Ocean' ? 'Guaranteed Ocean Liner FCL' : 'Dedicated Interstate Linehaul',
    routeCoordinates,
    checkpoints: checkpoints.length > 0 ? checkpoints : [
      {
        time: 'Initial Manifest',
        location: parcel.origin_address,
        title: 'Shipment Manifested',
        detail: 'Consignment entered into TransGlobe international logistics network.',
        completed: true,
      },
    ],
    lastUpdated: parcel.updated_at ? new Date(parcel.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Live Telemetry Active',
  };
}
