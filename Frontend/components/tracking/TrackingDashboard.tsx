'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Plane, 
  Ship, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  Download, 
  Copy, 
  Search,
  Settings,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { getShipmentById, Shipment, getStoredShipments, transformBackendParcelToShipment, mockShipments } from '@/lib/trackingData';

// Dynamically import LiveMap with SSR disabled (mandatory for Leaflet in Next.js)
const LiveMap = dynamic(() => import('@/components/tracking/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] sm:h-[500px] rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
      <div className="w-10 h-10 border-4 border-[#FF6200] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-semibold tracking-wide text-slate-300">Initializing Live Leaflet Satellite Telemetry...</p>
    </div>
  ),
});

interface TrackingDashboardProps {
  initialTrackingId?: string;
}

export default function TrackingDashboard({ initialTrackingId = 'TRK-2024-001234' }: TrackingDashboardProps) {
  const [searchInput, setSearchInput] = useState(initialTrackingId);
  const [currentId, setCurrentId] = useState(initialTrackingId);
  const [shipment, setShipment] = useState<Shipment>(() => getShipmentById(initialTrackingId));
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch tracking data from Express API with fallback
  const fetchTrackingData = async (trackingCode: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const code = trackingCode.trim().toUpperCase();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      // 1. Query the live Express backend endpoint: GET /api/tracking/:trackingNumber
      const response = await fetch(`${apiUrl}/tracking/${encodeURIComponent(code)}`);
      const data = await response.json();

      if (response.ok && data.success && data.parcel) {
        const transformed = transformBackendParcelToShipment(data.parcel);
        setShipment(transformed);
        setIsLoading(false);
        return;
      } else if (response.status === 404) {
        setIsLoading(false);
        setErrorMessage(data.error || `Consignment "${code}" was not found in our global logistics database. Please verify the code or contact operations.`);
        return;
      }
    } catch (networkErr) {
      console.warn('[Tracking] Live API unreachable, falling back to local dataset:', networkErr);
    }

    // 2. Fallback to local storage / mock dataset
    const local = getShipmentById(code);
    if (local && (local.id === code || mockShipments[code])) {
      setShipment(local);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setErrorMessage(`Shipment "${code}" was not found. Please verify your tracking number and try again.`);
    }
  };

  // Sync with API on mount & on ID change
  useEffect(() => {
    fetchTrackingData(currentId);

    const handleUpdate = () => {
      fetchTrackingData(currentId);
    };

    window.addEventListener('wwil:shipments-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('wwil:shipments-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const code = searchInput.trim().toUpperCase();
      setCurrentId(code);
      fetchTrackingData(code);
    }
  };

  const handleQuickSelect = (id: string) => {
    setSearchInput(id);
    setCurrentId(id);
    fetchTrackingData(id);
  };

  const copyId = () => {
    navigator.clipboard.writeText(shipment.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Dynamic Background Image based on Means of Transportation
  const getBackgroundImage = () => {
    switch (shipment.type) {
      case 'Air':
        return '/assets/plane1.avif';
      case 'Ocean':
        return '/assets/ship1.avif';
      case 'Ground':
        return '/assets/Truck1.avif';
      default:
        return '/assets/banner1.jpg';
    }
  };

  // Dynamic Transportation Badge & Icon
  const getTransportDetails = () => {
    switch (shipment.type) {
      case 'Air':
        return {
          icon: <Plane className="w-5 h-5 text-white" />,
          label: 'Air Freight Charter',
          badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        };
      case 'Ocean':
        return {
          icon: <Ship className="w-5 h-5 text-white" />,
          label: 'Ocean Liner Shipping',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
      case 'Ground':
        return {
          icon: <Truck className="w-5 h-5 text-white" />,
          label: 'Overland Road Freight',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          icon: <Package className="w-5 h-5 text-white" />,
          label: 'Multimodal Freight',
          badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        };
    }
  };

  const transport = getTransportDetails();

  // 5 Stages of Milestone Progression
  const milestones = [
    { step: 1, label: 'Order Received' },
    { step: 2, label: 'In Transit' },
    { step: 3, label: 'On Hold / Customs' },
    { step: 4, label: 'Out for Delivery' },
    { step: 5, label: 'Delivered' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* =================================================================== */}
        {/* 1. UPGRADED TRACKING CARD WITH DYNAMIC TRANSPORTATION BACKGROUND   */}
        {/* =================================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 text-white min-h-[260px] flex flex-col justify-between">
          
          {/* Dynamic Background Image */}
          <img
            src={getBackgroundImage()}
            alt={`${shipment.type} Freight Carrier`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105"
          />

          {/* Clean Dark Corporate Slate Gradient Overlay (bg-slate-900/75) */}
          <div className="absolute inset-0 bg-slate-900/75 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-900/75 backdrop-blur-[3px]"></div>

          {/* Top Row: Meta Badge & Admin Portal Link */}
          <div className="relative z-10 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#FF6200] beacon-pulse"></span>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#FF6200]">
                  WWIL Live Telemetry Gateway
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${transport.badgeClass}`}>
                  {transport.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 hover:text-white backdrop-blur-md transition-colors border border-white/10"
                title="Open Administrative Dashboard"
              >
                <Settings className="w-3.5 h-3.5 text-[#FF6200]" />
                <span>Admin Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Middle Row: Tracking Title & Search Input Box */}
          <div className="relative z-10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FF6200] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                  {transport.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
                      {shipment.id}
                    </h1>
                    <button
                      onClick={copyId}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                      title="Copy Tracking Number"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copied && (
                      <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        Copied
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Carrier: <strong className="text-white">{shipment.carrier}</strong> &bull; {shipment.conveyance}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Search Input */}
            <div className="lg:col-span-5">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Query another ID (e.g. TRK-2024-001234)"
                  className="w-full pl-4 pr-28 py-3.5 bg-slate-950/90 border border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-xs uppercase focus:outline-none focus:border-[#FF6200] focus:ring-2 focus:ring-[#FF6200]/30 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#FF6200] hover:bg-[#E05600] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>{isLoading ? 'Loading' : 'Track'}</span>
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Row: Quick Preset Chips */}
          <div className="relative z-10 px-6 sm:px-8 py-3 bg-slate-950/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-[11px] font-medium">Quick Test Codes:</span>
              <button
                type="button"
                onClick={() => handleQuickSelect('TRK-2024-001234')}
                className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] transition-colors ${
                  currentId === 'TRK-2024-001234'
                    ? 'bg-[#FF6200] text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                TRK-2024-001234 (Air)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('MSKU-982341-0')}
                className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] transition-colors ${
                  currentId === 'MSKU-982341-0'
                    ? 'bg-[#FF6200] text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                MSKU-982341-0 (Ocean)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('WW-TRK-44019')}
                className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] transition-colors ${
                  currentId === 'WW-TRK-44019'
                    ? 'bg-[#FF6200] text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                WW-TRK-44019 (Ground)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('WWIL-BOL-4091')}
                className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] transition-colors ${
                  currentId === 'WWIL-BOL-4091'
                    ? 'bg-[#FF6200] text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                WWIL-BOL-4091 (Delivered)
              </button>
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF6200]" />
              <span>Telemetry Refreshed: {shipment.lastUpdated || 'Active'}</span>
            </div>
          </div>

        </div>

        {/* =================================================================== */}
        {/* GRACEFUL 404 ALERT BANNER                                           */}
        {/* =================================================================== */}
        {errorMessage && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 shadow-sm text-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-rose-900 text-base">Consignment Lookup Notice</h4>
                <p className="text-xs text-rose-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. HORIZONTAL MILESTONE PROGRESSION BAR                            */}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Consignment Pipeline Progression
              </span>
              <h2 className="font-display font-extrabold text-xl text-slate-900">
                Milestone Status Verification
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-100 text-[#FF6200] font-bold text-xs uppercase tracking-wider">
                Current: {shipment.status}
              </span>
            </div>
          </div>

          <div className="relative">
            {/* Connecting Track Line */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-100 transform -translate-y-1/2 z-0">
              <div
                className="h-full bg-[#FF6200] transition-all duration-500"
                style={{
                  width: `${((shipment.statusStep - 1) / (milestones.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
              {milestones.map((m) => {
                const isPassed = m.step < shipment.statusStep;
                const isCurrent = m.step === shipment.statusStep;

                return (
                  <div key={m.step} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-[#FF6200] text-white ring-4 ring-orange-100 shadow-md scale-110'
                          : isPassed
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : m.step}
                    </div>

                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-[#FF6200]'
                            : isPassed
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {m.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isCurrent ? 'Current Active Node' : isPassed ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. SHIPMENT OVERVIEW CARD                                          */}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Consignment Overview
              </span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                Logistics Routing &amp; Manifest Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shipper: <strong className="text-slate-800">{shipment.senderName || 'Authorized Enterprise Shipper'}</strong> &bull; Consignee: <strong className="text-slate-800">{shipment.receiverName || 'Destination Terminal Client'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => alert(`Official Manifest for ${shipment.id} successfully generated and downloaded.`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Manifest PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Origin Terminal</span>
              <strong className="text-sm font-bold text-slate-900 block truncate">{shipment.origin.name}</strong>
              <span className="text-[11px] text-slate-400">{shipment.origin.country}</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Destination Port</span>
              <strong className="text-sm font-bold text-slate-900 block truncate">{shipment.destination.name}</strong>
              <span className="text-[11px] text-slate-400">{shipment.destination.country}</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Estimated Arrival</span>
              <strong className="text-sm font-bold text-[#FF6200] block truncate">{shipment.eta}</strong>
              <span className="text-[11px] text-slate-400">{shipment.serviceLevel}</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Cargo Payload</span>
              <strong className="text-sm font-bold text-slate-900 block truncate">{shipment.weight}</strong>
              <span className="text-[11px] text-slate-400">{shipment.pieces}</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. INTERACTIVE REACT-LEAFLET MAP                                   */}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Real-Time Telemetry &amp; Checkpoints
              </span>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                Interactive Global GPS Map
              </h3>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF6200]" />
              <span>Active Waypoint: <strong>{shipment.currentLocation.name}</strong></span>
            </div>
          </div>

          {/* Leaflet Dynamic Component */}
          <LiveMap shipment={shipment} />
        </div>

        {/* =================================================================== */}
        {/* 5. SHIPMENT HISTORY TIMELINE                                       */}
        {/* =================================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Audited Sensor Event Log
              </span>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                Chronological Transit Checkpoint Log
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {shipment.checkpoints.length} Logged Checkpoints
            </span>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
            {shipment.checkpoints.map((cp, idx) => (
              <div key={idx} className="relative pl-6">
                <div
                  className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                    idx === 0
                      ? 'bg-[#FF6200] ring-4 ring-orange-100'
                      : cp.completed
                      ? 'bg-emerald-500'
                      : 'bg-slate-300'
                  }`}
                ></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-slate-900 text-sm">{cp.title}</h4>
                  <span className="text-slate-400 font-mono text-xs">{cp.time}</span>
                </div>
                <p className="text-xs text-[#2563EB] font-medium mt-0.5">{cp.location}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cp.detail}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
