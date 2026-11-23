'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { unwrapLongitudes, splitRouteAtCurrentPosition } from '@/lib/routing';

interface AdminLocationMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  shipmentId?: string;
  routeCoords?: [number, number][];
  originCoords?: [number, number];
  destCoords?: [number, number];
}

// Map Click Listener Component
function MapClickEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Center Updater
function CenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function AdminLocationMap({
  lat,
  lng,
  onChange,
  shipmentId,
  routeCoords,
  originCoords,
  destCoords,
}: AdminLocationMapProps) {
  const markerRef = useRef<L.Marker>(null);

  // Compute clean unwrapped route and split dynamically at current pin position
  const { completedSegment, remainingSegment } = useMemo(() => {
    let baseRoute: [number, number][] = [];

    if (routeCoords && routeCoords.length > 1) {
      baseRoute = unwrapLongitudes(routeCoords);
    } else if (originCoords && destCoords) {
      baseRoute = unwrapLongitudes([originCoords, [lat, lng], destCoords]);
    }

    if (baseRoute.length < 2) {
      return { completedSegment: [], remainingSegment: [] };
    }

    const split = splitRouteAtCurrentPosition(baseRoute, [lat, lng]);
    return {
      completedSegment: split.completedLeg,
      remainingSegment: split.remainingLeg,
    };
  }, [routeCoords, originCoords, destCoords, lat, lng]);

  // Custom draggable marker icon
  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-admin-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <span style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: rgba(37, 99, 235, 0.4);
            animation: beaconPulse 1.6s infinite ease-out;
          "></span>
          <div style="
            background-color: #2563EB;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #FFFFFF;
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            position: relative;
            z-index: 10;
          ">
            📍
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }, []);

  const originIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-admin-origin',
      html: `
        <div style="
          background-color: #2563EB;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(37,99,235,0.4);
        ">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
            <circle cx="12" cy="10" r="2.5" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  }, []);

  const destIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-admin-dest',
      html: `
        <div style="
          background-color: #0F172A;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(15,23,42,0.4);
        ">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-slate-300 shadow-inner">
      <MapContainer
        center={[lat, lng]}
        zoom={5}
        scrollWheelZoom={true}
        touchZoom={true}
        className="w-full h-full"
      >
        {/* Esri World Street - free, keyless, zero watermarks */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, TomTom'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        <CenterUpdater lat={lat} lng={lng} />

        <MapClickEvents
          onMapClick={(clickedLat, clickedLng) => {
            onChange(clickedLat, clickedLng);
          }}
        />

        {/* 1. Completed Segment (Solid) */}
        {completedSegment.length > 1 && (
          <>
            <Polyline
              positions={completedSegment}
              pathOptions={{
                color: '#FFFFFF',
                weight: 5.5,
                opacity: 0.75,
              }}
            />
            <Polyline
              positions={completedSegment}
              pathOptions={{
                color: '#2563EB',
                weight: 4,
                opacity: 1.0,
              }}
            />
          </>
        )}

        {/* 2. Remaining Segment (Dashed) */}
        {remainingSegment.length > 1 && (
          <>
            <Polyline
              positions={remainingSegment}
              pathOptions={{
                color: '#FFFFFF',
                weight: 4.5,
                opacity: 0.5,
                dashArray: '6, 6',
              }}
            />
            <Polyline
              positions={remainingSegment}
              pathOptions={{
                color: '#2563EB',
                weight: 3,
                opacity: 0.85,
                dashArray: '6, 6',
              }}
            />
          </>
        )}

        {/* Origin Marker */}
        {originCoords && (
          <Marker position={originCoords} icon={originIcon}>
            <Popup>
              <div className="p-1 text-xs font-semibold text-slate-800">
                <span className="text-[#2563EB] font-bold">Origin:</span> Departure Terminal
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destCoords && (
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div className="p-1 text-xs font-semibold text-slate-800">
                <span className="text-slate-900 font-bold">Destination:</span> Arrival Hub
              </div>
            </Popup>
          </Marker>
        )}

        {/* Draggable Active Waypoint Marker */}
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[lat, lng]}
          ref={markerRef}
          icon={markerIcon}
        >
          <Popup>
            <div className="p-2 text-xs space-y-1">
              <strong className="text-slate-900 block font-bold">Consignment {shipmentId}</strong>
              <p className="text-slate-600">Drag this pin or click anywhere on the map to reposition.</p>
              <div className="text-[11px] font-mono text-[#2563EB] pt-1 font-bold">
                Lat: {lat.toFixed(4)}°, Lng: {lng.toFixed(4)}°
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating map hint */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-lg text-xs flex flex-wrap items-center justify-between gap-3 border border-slate-700 shadow-md pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] beacon-pulse"></span>
          <span>Click map or drag live waypoint pin to set GPS coordinates</span>
        </div>
        <div className="flex items-center gap-2.5 text-[10.5px] border-t sm:border-t-0 sm:border-l border-slate-700 pt-1 sm:pt-0 sm:pl-3">
          <span className="flex items-center gap-1 font-semibold text-white">
            <span className="w-3.5 h-1 bg-[#2563EB] rounded-full inline-block"></span> Solid (Completed)
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className="w-3.5 h-0 border-t-2 border-dashed border-[#2563EB] inline-block"></span> Dashed (Remaining)
          </span>
        </div>
      </div>
    </div>
  );
}
