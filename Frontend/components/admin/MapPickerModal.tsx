'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Check, MapPin, Search, Loader2, Compass, RotateCcw } from 'lucide-react';

const InteractiveMapPicker = dynamic(
  () => import('./InteractiveMapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white space-y-2">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-300">Loading High-Precision Leaflet Map...</p>
      </div>
    ),
  }
);

export interface MapPickedLocation {
  name: string;
  portCode: string;
  country: string;
  lat: number;
  lng: number;
}

interface MapPickerModalProps {
  isOpen: boolean;
  title: string;
  targetType: 'origin' | 'destination';
  initialLat: number;
  initialLng: number;
  initialName?: string;
  initialPortCode?: string;
  initialCountry?: string;
  onConfirm: (result: MapPickedLocation) => void;
  onClose: () => void;
}

export default function MapPickerModal({
  isOpen,
  title,
  targetType,
  initialLat,
  initialLng,
  initialName = '',
  initialPortCode = '',
  initialCountry = '',
  onConfirm,
  onClose,
}: MapPickerModalProps) {
  const [lat, setLat] = useState<number>(initialLat || 50.0);
  const [lng, setLng] = useState<number>(initialLng || 8.0);
  const [locationName, setLocationName] = useState<string>(initialName);
  const [portCode, setPortCode] = useState<string>(initialPortCode || 'HUB');
  const [country, setCountry] = useState<string>(initialCountry || 'Global');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Sync when opened
  useEffect(() => {
    if (isOpen) {
      setLat(initialLat || 50.0);
      setLng(initialLng || 8.0);
      setLocationName(initialName || '');
      setPortCode(initialPortCode || 'HUB');
      setCountry(initialCountry || 'Global');
    }
  }, [isOpen, initialLat, initialLng, initialName, initialPortCode, initialCountry]);

  // Reverse Geocoding when lat/lng change
  const performReverseGeocode = async (targetLat: number, targetLng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'TransGlobe-Logistics-Platform/2.0 (operations@transglobe-logistics.com)',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        const resolvedCountry = addr.country || country || 'International';
        const rawCity =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.suburb ||
          addr.port ||
          addr.county ||
          data.name ||
          data.display_name?.split(',')[0] ||
          'Terminal Waypoint';

        const prefix = targetType === 'origin' ? 'Origin' : 'Hub';
        const formattedName = `${rawCity} Terminal`;
        const code = (rawCity.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'HUB').toUpperCase();

        setLocationName(formattedName);
        setPortCode(code);
        setCountry(resolvedCountry);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Handler when map pin position changes
  const handleMapChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    performReverseGeocode(newLat, newLng);
  };

  // Quick search jump
  const handleSearchJump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'TransGlobe-Logistics-Platform/2.0 (operations@transglobe-logistics.com)',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const first = data[0];
          const newLat = parseFloat(first.lat);
          const newLng = parseFloat(first.lon);
          setLat(newLat);
          setLng(newLng);
          handleMapChange(newLat, newLng);
        }
      }
    } catch (err) {
      console.warn('Search jump error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = () => {
    onConfirm({
      name: locationName.trim() || `${targetType === 'origin' ? 'Origin' : 'Destination'} Waypoint`,
      portCode: (portCode.trim() || 'HUB').toUpperCase(),
      country: country.trim() || 'Global',
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-wwil-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 flex items-center justify-center text-[#2563EB]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-[#2563EB] tracking-wider block">
                Interactive Coordinates Selector
              </span>
              <h3 className="font-display font-bold text-base text-white">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Quick Search Bar to Jump Map */}
          <form onSubmit={handleSearchJump} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Jump map to city, port, or terminal name (e.g., Hamburg Port, Dubai Hub)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" /> : <Search className="w-3.5 h-3.5" />}
              <span>Jump to Map</span>
            </button>
          </form>

          {/* Interactive Leaflet Map Picker */}
          <InteractiveMapPicker lat={lat} lng={lng} onChange={handleMapChange} />

          {/* Live Geocoded Details Preview & Override Inputs */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                Geocoded Location Manifest
              </span>
              {isReverseGeocoding ? (
                <span className="text-[11px] text-[#2563EB] font-medium flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Resolving geography...
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => performReverseGeocode(lat, lng)}
                  className="text-[11px] text-slate-500 hover:text-[#2563EB] flex items-center gap-1 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Re-check Place
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Terminal / Port Name
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Rotterdam APM Terminal"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Port / Hub Code
                </label>
                <input
                  type="text"
                  value={portCode}
                  onChange={(e) => setPortCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RTM"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Netherlands"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Latitude (°)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Longitude (°)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors shadow-md uppercase tracking-wider"
          >
            <Check className="w-4 h-4" />
            <span>Apply Location &amp; Coordinates</span>
          </button>
        </div>

      </div>
    </div>
  );
}
