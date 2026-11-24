'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Plane, Ship, Truck } from 'lucide-react';
import { Shipment } from '@/lib/trackingData';
import { calculateModeAwareRoute, RouteLegs, normalizeTransportMode } from '@/lib/routing';
import { calculateLivePosition } from '@/utils/routeInterpolation';

// Component to dynamically fit map bounds to route
function MapController({ coords }: { coords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.length > 0) {
      try {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
      } catch (err) {
        console.error('Error fitting bounds:', err);
      }
    }
  }, [coords, map]);

  return null;
}

interface LiveMapProps {
  shipment: Shipment;
}

// Tile provider options (100% free, keyless, no watermarks)
const TILE_PROVIDERS = {
  esriStreet: {
    name: 'Esri World Street',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom',
    maxZoom: 19,
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  esriSatellite: {
    name: 'Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    maxZoom: 18,
  },
};

export default function LiveMap({ shipment }: LiveMapProps) {
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof TILE_PROVIDERS>('esriStreet');
  
  // Real-time automatic position interpolation (updated via lightweight 15s interval)
  const [liveCoords, setLiveCoords] = useState<[number, number]>(() => {
    const pos = calculateLivePosition(shipment);
    return [pos.lat, pos.lng];
  });

  // Client-side 15-second interval: recalculates marker position locally without database hits or log entries
  useEffect(() => {
    const pos = calculateLivePosition(shipment);
    setLiveCoords([pos.lat, pos.lng]);

    const timer = setInterval(() => {
      const updated = calculateLivePosition(shipment);
      setLiveCoords([updated.lat, updated.lng]);
    }, 15000);

    return () => clearInterval(timer);
  }, [
    shipment.id,
    shipment.status,
    shipment.departure_at,
    shipment.departedAt,
    shipment.eta_at,
    shipment.eta,
    shipment.origin.lat,
    shipment.origin.lng,
    shipment.destination.lat,
    shipment.destination.lng,
    shipment.currentLocation.lat,
    shipment.currentLocation.lng,
  ]);

  const [routeData, setRouteData] = useState<RouteLegs>({
    fullRoute: [],
    completedLeg: [],
    remainingLeg: [],
    isHighway: false,
    mode: normalizeTransportMode(shipment.type),
  });
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Compute mode-aware route path asynchronously
  useEffect(() => {
    let isCancelled = false;

    async function computeRoute() {
      setIsLoadingRoute(true);
      const computed = await calculateModeAwareRoute({
        origin: [shipment.origin.lat, shipment.origin.lng],
        destination: [shipment.destination.lat, shipment.destination.lng],
        current: liveCoords,
        transportMode: (shipment as any).transport_mode || shipment.type,
        status: shipment.status,
        existingRoute: shipment.routeCoordinates,
      });

      if (!isCancelled) {
        setRouteData(computed);
        setIsLoadingRoute(false);
      }
    }

    computeRoute();

    return () => {
      isCancelled = true;
    };
  }, [
    shipment.id,
    shipment.origin.lat,
    shipment.origin.lng,
    shipment.destination.lat,
    shipment.destination.lng,
    liveCoords[0],
    liveCoords[1],
    shipment.type,
    shipment.status,
    shipment.routeCoordinates,
  ]);

  // Determine normalized active transport mode
  const activeMode = useMemo(() => {
    const raw = (
      (shipment as any).transport_mode || 
      (shipment as any).transportMode || 
      shipment.type || 
      ''
    ).toString();
    return normalizeTransportMode(raw);
  }, [shipment]);

  // 1. Origin Marker Icon (Cobalt Blue Badge with MapPin)
  const originIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-map-marker-origin',
      html: `
        <div style="
          background-color: #2563EB;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
            <circle cx="12" cy="10" r="3" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, []);

  // 2. Destination Marker Icon (Navy Slate Badge with Destination Flag)
  const destinationIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-map-marker-destination',
      html: `
        <div style="
          background-color: #0F172A;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, []);

  // 3. Dynamic Transport Vehicle / Vessel Icon for Live Position
  const currentIcon = useMemo(() => {
    let vehicleSvg = '';

    if (activeMode === 'Air') {
      // Airplane SVG
      vehicleSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
        </svg>
      `;
    } else if (activeMode === 'Ocean') {
      // Cargo Ship / Vessel SVG
      vehicleSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
          <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
          <path d="M12 10V2"/>
          <path d="M12 2h4"/>
        </svg>
      `;
    } else {
      // Freight Truck SVG (Ground)
      vehicleSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18.5" r="2.5"/>
          <circle cx="7" cy="18.5" r="2.5"/>
        </svg>
      `;
    }

    return L.divIcon({
      className: 'custom-map-marker-current',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <!-- Outer Pulsing Radiating Beacon Ring -->
          <span style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: rgba(37, 99, 235, 0.45);
            animation: beaconPulse 1.8s infinite ease-out;
          "></span>
          <!-- Dynamic Vehicle Badge Surface -->
          <div style="
            background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            position: relative;
            z-index: 10;
          ">
            ${vehicleSvg}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }, [activeMode]);

  const originCoords: [number, number] = [shipment.origin.lat, shipment.origin.lng];
  const destCoords: [number, number] = [shipment.destination.lat, shipment.destination.lng];
  const currentCoords: [number, number] = liveCoords;

  const currentTile = TILE_PROVIDERS[selectedProvider];

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      <MapContainer
        center={currentCoords}
        zoom={3}
        scrollWheelZoom={true}
        touchZoom={true}
        className="w-full h-full"
      >
        <MapController coords={routeData.fullRoute} />
        
        {/* Free, keyless, watermark-free TileLayer */}
        <TileLayer
          key={selectedProvider}
          attribution={currentTile.attribution}
          url={currentTile.url}
          maxZoom={currentTile.maxZoom}
        />

        {/* 1. COMPLETED ROUTE SEGMENT (Origin -> Current Live Position) */}
        {routeData.completedLeg.length > 1 && (
          <>
            {/* Contrast halo underlay */}
            <Polyline
              positions={routeData.completedLeg}
              pathOptions={{
                color: '#FFFFFF',
                weight: 6.5,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Solid vibrant active completed stroke */}
            <Polyline
              positions={routeData.completedLeg}
              pathOptions={{
                color: '#2563EB',
                weight: routeData.isHighway ? 5 : 4.5,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* 2. REMAINING ROUTE SEGMENT (Current Live Position -> Destination) */}
        {routeData.remainingLeg.length > 1 && (
          <>
            {/* Contrast halo underlay */}
            <Polyline
              positions={routeData.remainingLeg}
              pathOptions={{
                color: '#FFFFFF',
                weight: 5.5,
                opacity: 0.6,
                dashArray: '8, 8',
              }}
            />
            {/* Dashed upcoming remaining stroke */}
            <Polyline
              positions={routeData.remainingLeg}
              pathOptions={{
                color: '#2563EB',
                weight: 3.5,
                opacity: 0.85,
                dashArray: '8, 8',
              }}
            />
          </>
        )}

        {/* Origin Marker */}
        <Marker position={originCoords} icon={originIcon}>
          <Tooltip direction="top" offset={[0, -16]} opacity={1}>
            <div className="text-[11px] font-semibold text-slate-800">
              <span className="text-[#2563EB] font-bold">Origin:</span> {shipment.origin.name}
            </div>
          </Tooltip>
          <Popup>
            <div className="p-3 text-xs space-y-1">
              <span className="font-bold text-[#2563EB] uppercase tracking-wider block text-[10px]">Origin</span>
              <strong className="text-sm text-slate-900 block">{shipment.origin.name}</strong>
              <p className="text-slate-500">{shipment.origin.country}</p>
              <div className="text-[11px] text-slate-400 pt-1">Departed: {shipment.departedAt}</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destCoords} icon={destinationIcon}>
          <Tooltip direction="top" offset={[0, -16]} opacity={1}>
            <div className="text-[11px] font-semibold text-slate-800">
              <span className="text-slate-900 font-bold">Destination:</span> {shipment.destination.name}
            </div>
          </Tooltip>
          <Popup>
            <div className="p-3 text-xs space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">Destination</span>
              <strong className="text-sm text-slate-900 block">{shipment.destination.name}</strong>
              <p className="text-slate-500">{shipment.destination.country}</p>
              <div className="text-[11px] text-[#2563EB] font-semibold pt-1">ETA: {shipment.eta}</div>
            </div>
          </Popup>
        </Marker>

        {/* Current Live Location Marker (Dynamic Vehicle / Vessel) */}
        <Marker position={currentCoords} icon={currentIcon}>
          <Tooltip direction="top" offset={[0, -22]} opacity={1}>
            <div className="text-[11px] font-semibold text-slate-800">
              <span className="text-[#2563EB] font-bold">Live Position:</span> {shipment.currentLocation.name}
            </div>
          </Tooltip>
          <Popup>
            <div className="p-3 text-xs space-y-1 min-w-[200px]">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                <span className="font-bold text-[#2563EB] uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping"></span>
                  Live {activeMode} Telemetry
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {shipment.status}
                </span>
              </div>
              <strong className="text-sm text-slate-900 block">{shipment.currentLocation.name}</strong>
              <p className="text-slate-600 font-medium text-xs">{shipment.carrier}</p>
              <p className="text-slate-500 font-mono text-[11px]">{shipment.conveyance}</p>
              <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-slate-700 font-mono font-semibold">
                  {currentCoords[0].toFixed(4)}°, {currentCoords[1].toFixed(4)}°
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Map Layer Switcher Overlay */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-[400] flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-md">
        <span className="hidden xs:flex text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 sm:px-2 items-center gap-1">
          <Layers className="w-3 h-3 text-[#2563EB]" />
          Tiles
        </span>
        <button
          type="button"
          onClick={() => setSelectedProvider('esriStreet')}
          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors ${
            selectedProvider === 'esriStreet'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Street
        </button>
        <button
          type="button"
          onClick={() => setSelectedProvider('osm')}
          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors ${
            selectedProvider === 'osm'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          OSM
        </button>
        <button
          type="button"
          onClick={() => setSelectedProvider('esriSatellite')}
          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors ${
            selectedProvider === 'esriSatellite'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:right-auto sm:left-4 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-slate-200 shadow-lg text-xs space-y-1.5 sm:space-y-2 pointer-events-auto max-w-full sm:max-w-md">
        <div className="font-bold text-slate-900 text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] beacon-pulse"></span>
            <span>Live Telemetry &amp; Navigation</span>
          </div>

          {/* Mode-Aware Navigation Badge */}
          {activeMode === 'Ground' && (
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
              <Truck className="w-2.5 h-2.5 text-emerald-600" />
              <span>{routeData.isHighway ? 'OSRM Highway' : 'Road'}</span>
            </span>
          )}
          {activeMode === 'Ocean' && (
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-full font-bold">
              <Ship className="w-2.5 h-2.5 text-cyan-600" />
              <span>Sea Corridor</span>
            </span>
          )}
          {activeMode === 'Air' && (
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#2563EB] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full font-bold">
              <Plane className="w-2.5 h-2.5 text-[#2563EB]" />
              <span>Flight Arc</span>
            </span>
          )}
        </div>

        {/* Marker Key: Clean Origin, Live Vessel / Transit Position, Destination */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> Origin
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-blue-300"></span> Live Position
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0F172A]"></span> Destination
          </span>
        </div>

        {/* Leg Distinction Key (Completed vs Remaining) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 border-t border-slate-100 text-[9.5px] sm:text-[10.5px]">
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <span className="w-3 sm:w-4 h-1 bg-[#2563EB] rounded-full inline-block"></span>
            <span>Completed (Solid)</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <span className="w-3 sm:w-4 h-0 border-t-2 border-dashed border-[#2563EB] inline-block"></span>
            <span>Remaining (Dashed)</span>
          </span>
          {isLoadingRoute && (
            <span className="text-[9px] text-slate-400 font-normal ml-auto">Computing route...</span>
          )}
        </div>
      </div>
    </div>
  );
}
