'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, Compass, Anchor } from 'lucide-react';

export interface PlaceResult {
  name: string;
  portCode: string;
  country: string;
  lat: number;
  lng: number;
  displayName: string;
}

interface PlaceAutocompleteProps {
  label: string;
  value: string;
  onSelect: (place: PlaceResult) => void;
  onPickOnMap?: () => void;
  placeholder?: string;
  required?: boolean;
}

// Major global maritime and airport hub presets for one-click fill
const LOGISTICS_PRESETS: PlaceResult[] = [
  {
    name: 'Frankfurt Cargo Hub (FRA)',
    portCode: 'FRA',
    country: 'Germany',
    lat: 50.0379,
    lng: 8.5622,
    displayName: 'Frankfurt Airport CargoCity, Hessen, Germany',
  },
  {
    name: 'Port of Rotterdam (NLRTM)',
    portCode: 'NLRTM',
    country: 'Netherlands',
    lat: 51.9244,
    lng: 4.4777,
    displayName: 'Port of Rotterdam APM Terminals, South Holland, Netherlands',
  },
  {
    name: "Chicago O'Hare Terminal (ORD)",
    portCode: 'ORD',
    country: 'United States',
    lat: 41.9742,
    lng: -87.9073,
    displayName: "Chicago O'Hare International Airport, Illinois, USA",
  },
  {
    name: 'Port of Shanghai (CNSHA)',
    portCode: 'CNSHA',
    country: 'China',
    lat: 31.2304,
    lng: 121.4737,
    displayName: 'Port of Shanghai Yangshan Deepwater Terminal, China',
  },
  {
    name: 'Dallas Logistics Center (DFW)',
    portCode: 'DFW-HUB',
    country: 'United States',
    lat: 32.7767,
    lng: -96.797,
    displayName: 'Dallas Fort Worth Logistics Gateway, Texas, USA',
  },
  {
    name: 'Austin Industrial Depot (ATX)',
    portCode: 'ATX-HUB',
    country: 'United States',
    lat: 30.2672,
    lng: -97.7431,
    displayName: 'Austin Metro Commercial Depot, Texas, USA',
  },
  {
    name: "Newark Liberty Terminal (EWR)",
    portCode: 'EWR',
    country: 'United States',
    lat: 40.6895,
    lng: -74.1745,
    displayName: "Newark Liberty Gateway Cargo Center, New Jersey, USA",
  },
  {
    name: 'Jebel Ali Port / Dubai (DXB)',
    portCode: 'DXB',
    country: 'United Arab Emirates',
    lat: 25.0113,
    lng: 55.0617,
    displayName: 'Jebel Ali Free Zone Port (JAFZA), Dubai, UAE',
  },
];

export default function PlaceAutocomplete({
  label,
  value,
  onSelect,
  onPickOnMap,
  placeholder = 'Type city, terminal, or port...',
  required = false,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Nominatim Geocoding API lookup
  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'WWIL-Logistics-Platform/2.0 (operations@wwil-logistics.com)',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const results: PlaceResult[] = data.map((item: any) => {
            const country = item.address?.country || 'International';
            const city =
              item.address?.city ||
              item.address?.town ||
              item.address?.port ||
              item.name ||
              item.display_name.split(',')[0];

            return {
              name: city,
              portCode: (city.substring(0, 3) || 'HUB').toUpperCase(),
              country,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              displayName: item.display_name,
            };
          });

          setSuggestions(results);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn('Geocoding query error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    setIsOpen(false);
    onSelect(place);
  };

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-[#FF6200]">*</span>}
        </label>
        {onPickOnMap && (
          <button
            type="button"
            onClick={onPickOnMap}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6200] hover:text-[#E05600] hover:bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 transition-all shadow-xs"
            title="Open interactive Leaflet map to pinpoint coordinates"
          >
            <Compass className="w-3 h-3 text-[#FF6200]" />
            <span>Pick on Map</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-4 h-4 text-[#FF6200]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0 || !query) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#FF6200] focus:ring-1 focus:ring-[#FF6200] transition-colors"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6200]" />
          </div>
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
          {suggestions.length > 0 ? (
            <div className="p-1">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                OpenStreetMap Geocoded Locations
              </span>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-start gap-2.5 transition-colors group"
                >
                  <Compass className="w-4 h-4 text-[#FF6200] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900 group-hover:text-[#FF6200] transition-colors truncate">
                        {item.name}
                      </strong>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.displayName}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Major Gateway Presets
              </span>
              <div className="space-y-1">
                {LOGISTICS_PRESETS.slice(0, 4).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(preset)}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-slate-800">{preset.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {preset.lat.toFixed(2)}°, {preset.lng.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Preset Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] text-slate-400 font-medium">Quick Hubs:</span>
        {LOGISTICS_PRESETS.slice(0, 3).map((hub, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(hub)}
            className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors font-medium"
          >
            {hub.portCode} ({hub.name.split(' ')[0]})
          </button>
        ))}
        {onPickOnMap && (
          <button
            type="button"
            onClick={onPickOnMap}
            className="text-[10px] ml-auto px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#FF6200] border border-orange-200 rounded-md transition-colors font-semibold flex items-center gap-1"
          >
            <MapPin className="w-2.5 h-2.5" />
            <span>Pick on Map</span>
          </button>
        )}
      </div>
    </div>
  );
}
