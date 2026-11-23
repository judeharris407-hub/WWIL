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

export const mockShipments: Record<string, Shipment> = {
  'TGL-2026-001234': {
    id: 'TGL-2026-001234',
    type: 'Air',
    carrier: 'TransGlobe Air Express Alliance',
    conveyance: 'Flight TG-904 (Boeing 777F)',
    senderName: 'Siemens Industrial AG (Frankfurt)',
    receiverName: 'Apex Machinery Components (Chicago)',
    origin: {
      name: 'Frankfurt Hub (FRA)',
      portCode: 'FRA',
      country: 'Germany',
      lat: 50.0379,
      lng: 8.5622,
    },
    destination: {
      name: "Chicago O'Hare Terminal (ORD)",
      portCode: 'ORD',
      country: 'United States',
      lat: 41.9742,
      lng: -87.9073,
    },
    currentLocation: {
      name: 'Mid-Atlantic Transit Waypoint (46.2° N, 35.8° W)',
      lat: 46.2,
      lng: -35.8,
    },
    status: 'In Transit',
    statusStep: 2,
    eta: 'Tomorrow by 14:00 CST',
    departedAt: 'Nov 21, 2026 - 08:30 CET',
    pieces: '6 Skids / Palletized Freight',
    weight: '2,140 kg (4,717 lbs)',
    serviceLevel: 'Guaranteed Priority Air Freight',
    routeCoordinates: [
      [50.0379, 8.5622],
      [51.5074, -0.1278],
      [52.5, -15.0],
      [46.2, -35.8],
      [45.0, -55.0],
      [44.0, -70.0],
      [41.9742, -87.9073],
    ],
    checkpoints: [
      {
        time: 'Nov 20, 2026 - 11:00 CET',
        location: 'Frankfurt CargoCity South, Germany',
        title: 'Shipment Received & Scanned',
        detail: 'Consignment verified, weight checked, export manifest finalized.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 06:15 CET',
        location: 'Frankfurt Gateway Customs',
        title: 'Export Customs Released',
        detail: 'Single-window Zoll approval granted with zero tariff holds.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 08:30 CET',
        location: 'Frankfurt Int Airport (FRA)',
        title: 'Departed on Flight WW-904',
        detail: "Aircraft airborne en route to Chicago O'Hare International Airport.",
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 15:45 CST',
        location: "Chicago O'Hare Terminal (ORD)",
        title: 'US CBP Import Pre-Clearance',
        detail: 'Automated ACE electronic manifest validated.',
        completed: false,
      },
      {
        time: 'Estimated Nov 22, 2026',
        location: 'Chicago Metropolitan Hub, IL',
        title: 'Out for Final Delivery',
        detail: 'Consignee dock receiving team notified for delivery window.',
        completed: false,
      },
    ],
    lastUpdated: 'Nov 21, 2026 - 16:20 CET',
  },
  'AWB-78942-FRA': {
    id: 'AWB-78942-FRA',
    type: 'Air',
    carrier: 'Lufthansa Cargo / TransGlobe Air Express',
    conveyance: 'Flight LH-8220 (MD-11F Cargo)',
    senderName: 'BioHealth Pharma GmbH',
    receiverName: 'Metropolitan Medical Network (Newark)',
    origin: {
      name: 'Frankfurt Hub (FRA)',
      portCode: 'FRA',
      country: 'Germany',
      lat: 50.0379,
      lng: 8.5622,
    },
    destination: {
      name: "Newark Liberty Int'l (EWR)",
      portCode: 'EWR',
      country: 'United States',
      lat: 40.6895,
      lng: -74.1745,
    },
    currentLocation: {
      name: 'North Atlantic Flight Path (52.1° N, 22.4° W)',
      lat: 52.1,
      lng: -22.4,
    },
    status: 'In Transit',
    statusStep: 2,
    eta: 'Today at 18:45 EST',
    departedAt: 'Nov 21, 2026 - 11:20 CET',
    pieces: '4 Euro Pallets',
    weight: '1,840 kg',
    serviceLevel: 'Express Air Freight Direct',
    routeCoordinates: [
      [50.0379, 8.5622],
      [52.1, -22.4],
      [48.5, -50.0],
      [40.6895, -74.1745],
    ],
    checkpoints: [
      {
        time: 'Nov 20, 2026 - 14:30',
        location: 'FRA CargoCity, Germany',
        title: 'Cargo Received & Bonded',
        detail: 'Consignment secured in cold-chain regulated warehouse.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 08:15',
        location: 'Frankfurt Terminal 1',
        title: 'Customs Clear & Pallet Build',
        detail: 'Loaded onto air cargo ULD containers.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 11:20',
        location: 'Frankfurt Int Airport',
        title: 'Flight Departed on Schedule',
        detail: 'Non-stop transatlantic cargo flight en route to Newark.',
        completed: true,
      },
      {
        time: 'Estimated 18:45',
        location: 'Newark Terminal (EWR)',
        title: 'Arrival & Customs Inspection',
        detail: 'Awaiting ramp handling and US CBP clearance.',
        completed: false,
      },
    ],
    lastUpdated: 'Nov 21, 2026 - 14:15 CET',
  },
  'MSKU-982341-0': {
    id: 'MSKU-982341-0',
    type: 'Ocean',
    carrier: 'Maersk Line / TransGlobe Ocean Alliance',
    conveyance: 'Vessel: MAERSK MC-KINNEY MOLLER (Voyage 2608W)',
    senderName: 'Cosco Electronics Export Corp (Shanghai)',
    receiverName: 'EuroTech Distribution Logistics BV',
    origin: {
      name: 'Port of Shanghai (CNSHA)',
      portCode: 'CNSHA',
      country: 'China',
      lat: 31.2304,
      lng: 121.4737,
    },
    destination: {
      name: 'Port of Rotterdam (NLRTM)',
      portCode: 'NLRTM',
      country: 'Netherlands',
      lat: 51.9244,
      lng: 4.4777,
    },
    currentLocation: {
      name: 'Port of Rotterdam APM Terminal Berth 4',
      lat: 51.95,
      lng: 4.35,
    },
    status: 'On Hold / Customs',
    statusStep: 3,
    eta: 'Tomorrow at 06:00 CET',
    departedAt: 'Nov 02, 2026 - 04:00 CST',
    pieces: '1 x 40ft High Cube Container',
    weight: '24,650 kg gross',
    serviceLevel: 'Guaranteed Ocean Liner FCL',
    routeCoordinates: [
      [31.2304, 121.4737],
      [1.3521, 103.8198],
      [12.8, 45.0],
      [27.8, 34.0],
      [31.2, 32.3],
      [36.1, -5.3],
      [48.5, -5.0],
      [51.95, 4.35],
      [51.9244, 4.4777],
    ],
    checkpoints: [
      {
        time: 'Nov 02, 2026 - 04:00 CST',
        location: 'Yangshan Port, Shanghai',
        title: 'Vessel Departed Shanghai',
        detail: 'Container stowed in bay 42, verified seal applied.',
        completed: true,
      },
      {
        time: 'Nov 14, 2026 - 16:20 UTC',
        location: 'Suez Canal Convoy',
        title: 'Canal Passage Completed',
        detail: 'Clear passage through Mediterranean maritime lane.',
        completed: true,
      },
      {
        time: 'Nov 20, 2026 - 22:40 CET',
        location: 'Port of Rotterdam, Netherlands',
        title: 'Vessel Berthed at APM Terminal',
        detail: 'Gantry cranes operating for scheduled container discharge.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 05:30 CET',
        location: 'Rotterdam Customs Bonded Hub',
        title: 'European Union Customs Document Audit',
        detail: 'Documentary inspection underway by Dutch Customs authority.',
        completed: true,
      },
      {
        time: 'Pending Release',
        location: 'Rotterdam Intermodal Rail',
        title: 'Awaiting Intermodal Rail Transfer',
        detail: 'Scheduled for dispatch to central European distribution depot upon fiscal release.',
        completed: false,
      },
    ],
    lastUpdated: 'Nov 21, 2026 - 06:45 CET',
  },
  'WW-TRK-44019': {
    id: 'WW-TRK-44019',
    type: 'Ground',
    carrier: 'TransGlobe Overland Freight Network',
    conveyance: 'Fleet Unit: EV-Semi #TX-4890',
    senderName: 'Texas Industrial Assemblies (Dallas)',
    receiverName: 'Silicon Hills Fab Center (Austin)',
    origin: {
      name: 'Dallas Logistics Center',
      portCode: 'DFW-HUB',
      country: 'USA',
      lat: 32.7767,
      lng: -96.797,
    },
    destination: {
      name: 'Austin Industrial Park',
      portCode: 'ATX-HUB',
      country: 'USA',
      lat: 30.2672,
      lng: -97.7431,
    },
    currentLocation: {
      name: 'Interstate 35 South Corridor, Temple TX',
      lat: 31.0982,
      lng: -97.3428,
    },
    status: 'Out for Delivery',
    statusStep: 4,
    eta: 'Today by 16:30 CST',
    departedAt: 'Nov 21, 2026 - 06:15 CST',
    pieces: '12 Master Cartons',
    weight: '480 kg',
    serviceLevel: 'Dedicated Express Road Freight',
    routeCoordinates: [
      [32.7767, -96.797],
      [31.5493, -97.1467],
      [31.0982, -97.3428],
      [30.5083, -97.6789],
      [30.2672, -97.7431],
    ],
    checkpoints: [
      {
        time: 'Nov 21, 2026 - 06:15 CST',
        location: 'Dallas Regional Logistics Terminal',
        title: 'Departed Sorting Facility',
        detail: 'Loaded onto dedicated electric heavy-haul tractor unit.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 09:40 CST',
        location: 'Waco Highway Inspection Station',
        title: 'GPS Telemetry Validated',
        detail: 'Tire pressure, speed, and seal integrity verified on I-35.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 13:10 CST',
        location: 'Austin Metro Depot',
        title: 'Arrived Local Dispatch Depot',
        detail: 'Sorted to designated local delivery manifest.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 14:05 CST',
        location: 'Austin Commercial Corridor',
        title: 'Out for Final Delivery',
        detail: 'Driver en route to recipient dock bay 4.',
        completed: true,
      },
      {
        time: 'Estimated 16:30 CST',
        location: 'Consignee Loading Dock, Austin',
        title: 'Electronic POD Handoff',
        detail: 'Signature and barcode scan required upon cargo receipt.',
        completed: false,
      },
    ],
    lastUpdated: 'Nov 21, 2026 - 15:10 CST',
  },
};

const STORAGE_KEY = 'wwil_enterprise_shipments_v1';

// Safe LocalStorage getter
export function getStoredShipments(): Record<string, Shipment> {
  if (typeof window === 'undefined') {
    return mockShipments;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockShipments));
      return mockShipments;
    }
    const parsed = JSON.parse(raw);
    return { ...mockShipments, ...parsed };
  } catch (err) {
    console.warn('Error reading from localStorage:', err);
    return mockShipments;
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

// Retrieve single shipment
export function getShipmentById(id: string): Shipment {
  const normalizedId = id.trim().toUpperCase();
  const all = getStoredShipments();

  if (all[normalizedId]) {
    return all[normalizedId];
  }

  // Dynamic fallback for any arbitrary tracking code
  return {
    id: normalizedId || 'TGL-2026-001234',
    type: 'Air',
    carrier: 'TransGlobe Global Multimodal Network',
    conveyance: 'Transport Unit: TGL-INT-' + Math.floor(1000 + Math.random() * 9000),
    senderName: 'International Logistics Gateway Client',
    receiverName: 'Designated Consignee Terminal',
    origin: {
      name: 'London Heathrow Gateway (LHR)',
      portCode: 'LHR',
      country: 'United Kingdom',
      lat: 51.47,
      lng: -0.4543,
    },
    destination: {
      name: "John F. Kennedy Int'l (JFK)",
      portCode: 'JFK',
      country: 'United States',
      lat: 40.6413,
      lng: -73.7781,
    },
    currentLocation: {
      name: 'Mid-Atlantic Air Route (50.5° N, -32.4° W)',
      lat: 50.5,
      lng: -32.4,
    },
    status: 'In Transit',
    statusStep: 2,
    eta: 'Estimated 2 Business Days',
    departedAt: 'Nov 20, 2026 - 14:00 GMT',
    pieces: 'Consolidated Commercial Freight',
    weight: '1,650 kg',
    serviceLevel: 'Standard Enterprise Multimodal',
    routeCoordinates: [
      [51.47, -0.4543],
      [52.0, -15.0],
      [50.5, -32.4],
      [46.0, -50.0],
      [40.6413, -73.7781],
    ],
    checkpoints: [
      {
        time: 'Nov 19, 2026 - 10:00 GMT',
        location: 'London Heathrow Cargo Terminal',
        title: 'Consignment Logged & Manifested',
        detail: 'Cargo inspected and allocated to flight manifest.',
        completed: true,
      },
      {
        time: 'Nov 20, 2026 - 14:00 GMT',
        location: 'London Gateway Airport',
        title: 'Export Customs Released',
        detail: 'Cleared under single-window UK customs protocol.',
        completed: true,
      },
      {
        time: 'Nov 21, 2026 - 02:30 UTC',
        location: 'Mid-Atlantic Corridors',
        title: 'Satellite Checkpoint Confirmed',
        detail: 'Telemetry confirms on-schedule progress.',
        completed: true,
      },
      {
        time: 'Upcoming',
        location: 'New York JFK Terminal',
        title: 'US Customs Inbound Clearance',
        detail: 'Pending destination ramp breakdown.',
        completed: false,
      },
      {
        time: 'Upcoming',
        location: 'Destination Consignee',
        title: 'Delivered',
        detail: 'Final delivery completion.',
        completed: false,
      },
    ],
    lastUpdated: 'Nov 21, 2026 - 12:00 UTC',
  };
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

// Quick status updater helper
export function updateShipmentStatus(
  id: string,
  newStatus: Shipment['status'],
  statusStep?: Shipment['statusStep']
): Shipment {
  const shipment = getShipmentById(id);
  const stepMap: Record<Shipment['status'], Shipment['statusStep']> = {
    'Order Received': 1,
    'In Transit': 2,
    'On Hold / Customs': 3,
    'Out for Delivery': 4,
    'Delivered': 5,
  };

  const updated: Shipment = {
    ...shipment,
    status: newStatus,
    statusStep: statusStep || stepMap[newStatus] || 2,
    lastUpdated: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  upsertShipment(updated);
  return updated;
}

// Quick transport mode updater helper
export function updateShipmentMode(id: string, newMode: Shipment['type']): Shipment {
  const shipment = getShipmentById(id);
  const updated: Shipment = {
    ...shipment,
    type: newMode,
    lastUpdated: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  upsertShipment(updated);
  return updated;
}

// Live Coordinate & Checkpoint updater
export function updateShipmentLocation(
  id: string,
  lat: number,
  lng: number,
  locationName: string,
  checkpointTitle = 'Manual GPS Telemetry Update',
  checkpointDetail = 'Position verified and recorded by TransGlobe operations controller.'
): Shipment {
  const shipment = getShipmentById(id);
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newCheckpoint: Checkpoint = {
    time: timeFormatted,
    location: locationName || `Coordinate Waypoint (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
    title: checkpointTitle,
    detail: checkpointDetail,
    completed: true,
  };

  // Add coordinates to route line if not already present
  const updatedRoute: [number, number][] = [...shipment.routeCoordinates, [lat, lng]];

  const updated: Shipment = {
    ...shipment,
    currentLocation: {
      name: locationName || `Waypoint (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
      lat,
      lng,
    },
    routeCoordinates: updatedRoute,
    checkpoints: [newCheckpoint, ...shipment.checkpoints],
    lastUpdated: timeFormatted,
  };

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockShipments));
  window.dispatchEvent(new CustomEvent('wwil:shipments-updated', { detail: mockShipments }));
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
  const statStr = (parcel.status || '').toLowerCase();
  if (statStr.includes('transit')) {
    status = 'In Transit';
    statusStep = 2;
  } else if (statStr.includes('hold') || statStr.includes('custom')) {
    status = 'On Hold / Customs';
    statusStep = 3;
  } else if (statStr.includes('out') || statStr.includes('delivery')) {
    status = 'Out for Delivery';
    statusStep = 4;
  } else if (statStr.includes('deliver')) {
    status = 'Delivered';
    statusStep = 5;
  }

  // Checkpoints
  const historyList = parcel.audit_log || parcel.history || [];
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
