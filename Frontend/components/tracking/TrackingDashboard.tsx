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
  ShieldCheck,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { 
  getShipmentById, 
  Shipment, 
  transformBackendParcelToShipment, 
  mockShipments 
} from '@/lib/trackingData';
import { getApiBaseUrl } from '@/lib/api';

// Dynamically import LiveMap with SSR disabled (mandatory for Leaflet in Next.js)
const LiveMap = dynamic(() => import('@/components/tracking/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] sm:h-[420px] lg:h-[500px] rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
      <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300">Initializing Live Leaflet Satellite Telemetry...</p>
    </div>
  ),
});

interface TrackingDashboardProps {
  initialTrackingId?: string;
}

export default function TrackingDashboard({ initialTrackingId = '' }: TrackingDashboardProps) {
  const [searchInput, setSearchInput] = useState(initialTrackingId || '');
  const [currentId, setCurrentId] = useState(initialTrackingId || '');
  const [shipment, setShipment] = useState<Shipment | null>(() => (initialTrackingId ? getShipmentById(initialTrackingId) : null));
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch tracking data from Express API with fallback
  const fetchTrackingData = async (trackingCode: string) => {
    const code = trackingCode.trim().toUpperCase();
    if (!code) {
      setIsLoading(false);
      setShipment(null);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const apiUrl = getApiBaseUrl();

    try {
      // 1. Query the live Express backend endpoint: GET /api/tracking/:trackingNumber
      const response = await fetch(`${apiUrl}/tracking/${encodeURIComponent(code)}`);
      const data = await response.json();

      if (response.ok && data.success && data.parcel) {
        const transformed = transformBackendParcelToShipment(data.parcel);
        setShipment(transformed);
        setErrorMessage(null);
        setIsLoading(false);
        return;
      } else if (response.status === 404) {
        setShipment(null);
        setIsLoading(false);
        setErrorMessage(data.error || `No consignment matching "${code}" was found in our global logistics database. Please verify the tracking code or contact central operations.`);
        return;
      }
    } catch (networkErr) {
      console.warn('[Tracking] Live API unreachable, checking local dataset:', networkErr);
    }

    // 2. Fallback to local storage / mock dataset
    const local = getShipmentById(code);
    if (local && (local.id === code || mockShipments[code])) {
      setShipment(local);
      setErrorMessage(null);
      setIsLoading(false);
    } else {
      setShipment(null);
      setIsLoading(false);
      setErrorMessage(`No consignment matching "${code}" was found in our global logistics database. Please verify your tracking number and try again.`);
    }
  };

  // Sync with API on mount & on ID change
  useEffect(() => {
    if (currentId) {
      fetchTrackingData(currentId);
    }

    const handleUpdate = () => {
      if (currentId) {
        fetchTrackingData(currentId);
      }
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

  const copyId = () => {
    if (shipment) {
      navigator.clipboard.writeText(shipment.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Dynamic Background Image based on Means of Transportation
  const getBackgroundImage = () => {
    if (!shipment) return '/assets/banner1.jpg';

    const rawMode = (
      (shipment as any).transport_mode || 
      (shipment as any).transportMode || 
      shipment.type || 
      ''
    ).toString().toLowerCase();

    if (
      rawMode.includes('ocean') || 
      rawMode.includes('sea') || 
      rawMode.includes('marine') || 
      rawMode.includes('vessel') || 
      rawMode.includes('ship')
    ) {
      return '/assets/ship1.avif';
    }
    if (
      rawMode.includes('ground') || 
      rawMode.includes('truck') || 
      rawMode.includes('road') || 
      rawMode.includes('land')
    ) {
      return '/assets/Truck1.avif';
    }
    if (
      rawMode.includes('air') || 
      rawMode.includes('plane') || 
      rawMode.includes('express') || 
      rawMode.includes('flight') || 
      rawMode.includes('aviation')
    ) {
      return '/assets/plane1.avif';
    }
    return '/assets/banner1.jpg';
  };

  // Dynamic Transportation Badge & Icon
  const getTransportDetails = () => {
    if (!shipment) {
      return {
        icon: <Package className="w-5 h-5 text-white" />,
        label: 'Global Freight Routing',
        badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      };
    }

    switch (shipment.type) {
      case 'Air':
        return {
          icon: <Plane className="w-5 h-5 text-white" />,
          label: 'Air Freight Charter',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
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
            alt={shipment ? `${shipment.type} Freight Carrier` : 'TransGlobe Global Telemetry'}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105"
          />

          {/* Semi-transparent dark corporate slate/navy overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-900/35"></div>

          {/* Top Row: Meta Badge */}
          <div className="relative z-10 p-4 sm:p-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-white/10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-3 h-3 rounded-full bg-[#2563EB] beacon-pulse shrink-0"></span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#2563EB]">
                  TransGlobe Live Telemetry Gateway
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${transport.badgeClass}`}>
                  {transport.label}
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: Tracking Title & Search Input Box */}
          <div className="relative z-10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-7 space-y-2">
              {shipment ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
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
              ) : (
                <div className="space-y-1">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
                    Global Cargo Tracking
                  </h1>
                  <p className="text-xs text-slate-300">
                    Real-time satellite GPS coordinates, customs clearance status, and milestone progression
                  </p>
                </div>
              )}
            </div>

            {/* Tracking Search Input */}
            <div className="lg:col-span-5">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:relative items-stretch sm:items-center">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. TGL-2026-XXXX)"
                  className="w-full pl-4 pr-4 sm:pr-28 py-3.5 bg-slate-950/90 border border-slate-600 rounded-xl text-white placeholder-slate-400 font-mono text-xs uppercase focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/30 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="sm:absolute right-1.5 top-1.5 bottom-1.5 px-5 py-3 sm:py-0 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md disabled:opacity-50 shrink-0"
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

          {/* Bottom Row: Encryption & Status Info */}
          <div className="relative z-10 px-6 sm:px-8 py-3 bg-slate-950/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Direct connection to 140+ international container ports and air freight hubs</span>
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Telemetry Refreshed: {shipment?.lastUpdated || 'Active'}</span>
            </div>
          </div>

        </div>

        {/* =================================================================== */}
        {/* GRACEFUL 404 / NOT-FOUND NOTIFICATION BANNER                        */}
        {/* =================================================================== */}
        {errorMessage && (
          <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-800 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Verification Alert</span>
                <h3 className="font-display font-bold text-xl text-slate-900">Tracking ID Not Found</h3>
                <p className="text-sm text-slate-600 max-w-2xl">{errorMessage}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h5 className="font-bold text-slate-800 text-xs mb-1">Check Tracking Prefix</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verify the code matches your airway bill or bill of lading (e.g., <code className="font-mono text-slate-700">TGL-2026-XXXX</code>).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h5 className="font-bold text-slate-800 text-xs mb-1">Recent Booking</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Newly manifested consignments may require up to 30 minutes to propagate across the satellite telemetry network.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h5 className="font-bold text-slate-800 text-xs mb-1">Live Operations Support</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Contact central dispatch via WhatsApp, live chat, or email at operations@transglobe-logistics.com.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* EMPTY INITIAL STATE (When no shipment queried yet)                  */}
        {/* =================================================================== */}
        {!shipment && !errorMessage && !isLoading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] mx-auto shadow-sm">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">Enter a Consignment Number</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Query your tracking code in the search bar above to view real-time GPS telemetry, customs milestone verification, container inspection logs, and carrier manifest documents.
            </p>
          </div>
        )}

        {/* =================================================================== */}
        {/* ACTIVE SHIPMENT DETAILS (Only displayed when shipment exists)       */}
        {/* =================================================================== */}
        {shipment && (
          <>
            {/* 2. HORIZONTAL MILESTONE PROGRESSION BAR */}
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
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-[#2563EB] font-bold text-xs uppercase tracking-wider">
                    Current: {shipment.status}
                  </span>
                </div>
              </div>

              <div className="relative overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="min-w-[540px] md:min-w-0">
                  {/* Connecting Track Line */}
                  <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-100 transform -translate-y-1/2 z-0">
                    <div
                      className="h-full bg-[#2563EB] transition-all duration-500"
                      style={{
                        width: `${((shipment.statusStep - 1) / (milestones.length - 1)) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-5 gap-3 md:gap-4 relative z-10">
                    {milestones.map((m) => {
                      const isPassed = m.step < shipment.statusStep;
                      const isCurrent = m.step === shipment.statusStep;

                      return (
                        <div key={m.step} className="flex flex-col items-center text-center gap-2">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isCurrent
                                ? 'bg-[#2563EB] text-white ring-4 ring-blue-100 shadow-md scale-110'
                                : isPassed
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : m.step}
                          </div>

                          <div className="flex flex-col">
                            <span
                              className={`text-[11px] sm:text-xs font-bold leading-tight ${
                                isCurrent
                                  ? 'text-[#2563EB]'
                                  : isPassed
                                  ? 'text-slate-900'
                                  : 'text-slate-400'
                              }`}
                            >
                              {m.label}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                              {isCurrent ? 'Current Active Node' : isPassed ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SHIPMENT OVERVIEW CARD */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Origin Terminal</span>
                  <strong className="text-sm font-bold text-slate-900 block truncate">{shipment.origin.name}</strong>
                  <span className="text-[11px] text-slate-400 truncate block">{shipment.origin.country}</span>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Destination Port</span>
                  <strong className="text-sm font-bold text-slate-900 block truncate">{shipment.destination.name}</strong>
                  <span className="text-[11px] text-slate-400 truncate block">{shipment.destination.country}</span>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Estimated Arrival</span>
                  <strong className="text-sm font-bold text-[#2563EB] font-mono block truncate">{shipment.eta}</strong>
                  <span className="text-[11px] text-slate-400 truncate block">{shipment.serviceLevel}</span>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-500 block">Cargo Payload</span>
                  <strong className="text-sm font-bold text-slate-900 font-mono block truncate">{shipment.weight}</strong>
                  <span className="text-[11px] text-slate-400 font-mono truncate block">{shipment.pieces}</span>
                </div>
              </div>
            </div>

            {/* 4. INTERACTIVE REACT-LEAFLET MAP */}
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
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Active Waypoint: <strong>{shipment.currentLocation.name}</strong></span>
                </div>
              </div>

              {/* Leaflet Dynamic Component */}
              <LiveMap shipment={shipment} />
            </div>

            {/* 5. SHIPMENT HISTORY TIMELINE */}
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
                          ? 'bg-[#2563EB] ring-4 ring-blue-100'
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
          </>
        )}

      </div>
    </div>
  );
}
