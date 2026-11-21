'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Navigation, Plane, Ship, Truck } from 'lucide-react';
import { Shipment } from '@/lib/trackingData';
import { calculateModeAwareRoute, RouteLegs, normalizeTransportMode } from '@/lib/routing';

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
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
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
  const [selectedProvider, setSelectedProvider] = useState<'esriStreet' | 'osm' | 'esriSatellite'>('esriStreet');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  // High-precision mode-aware route legs state
  const [routeData, setRouteData] = useState<RouteLegs>({
    fullRoute: shipment.routeCoordinates,
    completedLeg: [
      [shipment.origin.lat, shipment.origin.lng],
      [shipment.currentLocation.lat, shipment.currentLocation.lng],
    ],
    remainingLeg: [
      [shipment.currentLocation.lat, shipment.currentLocation.lng],
      [shipment.destination.lat, shipment.destination.lng],
    ],
    isHighway: false,
    mode: normalizeTransportMode(shipment.type),
  });

  // Calculate high-fidelity mode-aware route (OSRM for Ground, Maritime for Ocean, Great-Circle for Air)
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingRoute(true);

    calculateModeAwareRoute({
      origin: [shipment.origin.lat, shipment.origin.lng],
      destination: [shipment.destination.lat, shipment.destination.lng],
      current: [shipment.currentLocation.lat, shipment.currentLocation.lng],
      transportMode: shipment.type,
      status: shipment.status,
      existingRoute: shipment.routeCoordinates,
    })
      .then((legs) => {
        if (!isCancelled) {
          setRouteData(legs);
          setIsLoadingRoute(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Mode-aware route calculation fallback:', err);
          setIsLoadingRoute(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    shipment.id,
    shipment.origin.lat,
    shipment.origin.lng,
    shipment.destination.lat,
    shipment.destination.lng,
    shipment.currentLocation.lat,
    shipment.currentLocation.lng,
    shipment.type,
    shipment.status,
    shipment.routeCoordinates,
  ]);

  // Origin Marker Icon (Blue Ring)
  const originIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: #2563EB;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 800;
        font-family: sans-serif;
      ">
        A
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // Current Live Location Marker (Vibrant Orange Beacon with Pulse)
  const currentIcon = L.divIcon({
    className: 'custom-map-marker-current',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <span style="
          position: absolute;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: rgba(255, 98, 0, 0.45);
          animation: beaconPulse 1.8s infinite ease-out;
        "></span>
        <div style="
          background-color: #FF6200;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 0 15px rgba(255, 98, 0, 0.7);
          position: relative;
          z-index: 10;
        "></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

  // Destination Marker Icon (Dark Corporate Slate Ring)
  const destinationIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: #0F172A;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 800;
        font-family: sans-serif;
      ">
        B
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const originCoords: [number, number] = [shipment.origin.lat, shipment.origin.lng];
  const destCoords: [number, number] = [shipment.destination.lat, shipment.destination.lng];
  const currentCoords: [number, number] = [shipment.currentLocation.lat, shipment.currentLocation.lng];

  const currentTile = TILE_PROVIDERS[selectedProvider];

  return (
    <div className="relative w-full h-[440px] sm:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      <MapContainer
        center={currentCoords}
        zoom={3}
        scrollWheelZoom={false}
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
                color: '#FF6200',
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
            {/* Dashed vibrant upcoming remaining stroke */}
            <Polyline
              positions={routeData.remainingLeg}
              pathOptions={{
                color: '#FF6200',
                weight: 3.5,
                opacity: 0.85,
                dashArray: '8, 8',
              }}
            />
          </>
        )}

        {/* Origin Marker */}
        <Marker position={originCoords} icon={originIcon}>
          <Popup>
            <div className="p-3 text-xs space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">Origin Port</span>
              <strong className="text-sm text-slate-900 block">{shipment.origin.name}</strong>
              <p className="text-slate-500">{shipment.origin.country}</p>
              <div className="text-[11px] text-slate-400 pt-1">Departed: {shipment.departedAt}</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destCoords} icon={destinationIcon}>
          <Popup>
            <div className="p-3 text-xs space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">Destination Hub</span>
              <strong className="text-sm text-slate-900 block">{shipment.destination.name}</strong>
              <p className="text-slate-500">{shipment.destination.country}</p>
              <div className="text-[11px] text-[#FF6200] font-semibold pt-1">ETA: {shipment.eta}</div>
            </div>
          </Popup>
        </Marker>

        {/* Current Live Location Marker */}
        <Marker position={currentCoords} icon={currentIcon}>
          <Popup>
            <div className="p-3 text-xs space-y-1">
              <span className="font-bold text-[#FF6200] uppercase tracking-wider block text-[10px]">Active Position Telemetry</span>
              <strong className="text-sm text-slate-900 block">{shipment.currentLocation.name}</strong>
              <p className="text-slate-600 font-medium">{shipment.carrier}</p>
              <p className="text-slate-500 font-mono text-[11px]">{shipment.conveyance}</p>
              <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-bold">{shipment.status}</span>
                <span className="text-slate-500 font-mono">
                  {shipment.currentLocation.lat.toFixed(2)}°, {shipment.currentLocation.lng.toFixed(2)}°
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Map Layer Switcher & Legend Overlay */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#FF6200]" />
          Tiles
        </span>
        <button
          type="button"
          onClick={() => setSelectedProvider('esriStreet')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
            selectedProvider === 'esriStreet'
              ? 'bg-[#FF6200] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Esri Street
        </button>
        <button
          type="button"
          onClick={() => setSelectedProvider('osm')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
            selectedProvider === 'osm'
              ? 'bg-[#FF6200] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          OSM
        </button>
        <button
          type="button"
          onClick={() => setSelectedProvider('esriSatellite')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
            selectedProvider === 'esriSatellite'
              ? 'bg-[#FF6200] text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-lg text-xs space-y-2 pointer-events-auto max-w-sm sm:max-w-md">
        <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF6200] beacon-pulse"></span>
            <span>Live Telemetry &amp; Navigation</span>
          </div>

          {/* Mode-Aware Navigation Badge */}
          {routeData.mode === 'Ground' && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              <Truck className="w-2.5 h-2.5 text-emerald-600" />
              <span>{routeData.isHighway ? 'OSRM Highway Route' : 'Road Routing'}</span>
            </span>
          )}
          {routeData.mode === 'Ocean' && (
            <span className="flex items-center gap-1 text-[10px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full font-bold">
              <Ship className="w-2.5 h-2.5 text-cyan-600" />
              <span>Maritime Sea Corridor</span>
            </span>
          )}
          {routeData.mode === 'Air' && (
            <span className="flex items-center gap-1 text-[10px] text-[#FF6200] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-bold">
              <Plane className="w-2.5 h-2.5 text-[#FF6200]" />
              <span>Geodesic Flight Arc</span>
            </span>
          )}
        </div>

        {/* Marker Key */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Origin (A)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6200]"></span> Live Position
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Destination (B)
          </span>
        </div>

        {/* Leg Distinction Key (Completed vs Remaining) */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-[10.5px]">
          <span className="flex items-center gap-1.5 font-semibold text-slate-800">
            <span className="w-4 h-1 bg-[#FF6200] rounded-full inline-block"></span>
            <span>Completed Leg (Solid)</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-500">
            <span className="w-4 h-0 border-t-2 border-dashed border-[#FF6200] inline-block"></span>
            <span>Remaining Leg (Dashed)</span>
          </span>
          {isLoadingRoute && (
            <span className="text-[10px] text-slate-400 font-normal ml-auto">Computing...</span>
          )}
        </div>
      </div>
    </div>
  );
}
