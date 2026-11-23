'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface InteractiveMapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

// Click listener to move pin on map click
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Keep map center synced when lat/lng change from external inputs
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function InteractiveMapPicker({
  lat,
  lng,
  onChange,
}: InteractiveMapPickerProps) {
  const markerRef = useRef<L.Marker>(null);

  // Custom vibrant WWIL orange pin
  const customPinIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-picker-pin',
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
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
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
    <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer
        center={[lat, lng]}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Esri World Street Map - Free, Keyless, High-Detail */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, TomTom'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        <RecenterMap lat={lat} lng={lng} />

        <MapEvents onClick={(cLat, cLng) => onChange(cLat, cLng)} />

        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[lat, lng]}
          ref={markerRef}
          icon={customPinIcon}
        >
          <Popup>
            <div className="p-1 text-xs">
              <strong className="text-slate-900 block font-bold">Selected Pin Location</strong>
              <div className="text-slate-600 font-mono text-[11px] pt-1">
                {lat.toFixed(4)}°, {lng.toFixed(4)}°
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating Instructions Banner */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-slate-700 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></span>
        <span>Click map or drag the orange pin to place terminal coordinates</span>
      </div>
    </div>
  );
}
