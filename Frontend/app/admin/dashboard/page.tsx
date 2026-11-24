'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plane, 
  Ship, 
  Truck, 
  Plus, 
  Search, 
  MapPin, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Boxes, 
  X, 
  Save, 
  ShieldCheck, 
  Layers, 
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
  LogOut,
  User,
  Compass,
  Navigation
} from 'lucide-react';
import { 
  Shipment, 
  getStoredShipments, 
  upsertShipment, 
  updateShipmentStatus, 
  updateShipmentMode, 
  updateShipmentLocation, 
  deleteShipment, 
  resetShipmentsToDefault,
  transformBackendParcelToShipment
} from '@/lib/trackingData';
import { getAdminSession, logoutAdmin, AdminUser } from '@/lib/auth';
import PlaceAutocomplete, { PlaceResult } from '@/components/admin/PlaceAutocomplete';
import { MapPickedLocation } from '@/components/admin/MapPickerModal';
import { calculateModeAwareRoute } from '@/lib/routing';
import { getApiBaseUrl } from '@/lib/api';

// Dynamically import AdminLocationMap and MapPickerModal with SSR disabled for Leaflet
const AdminLocationMap = dynamic(() => import('@/components/admin/AdminLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white space-y-2">
      <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-slate-300">Loading Leaflet Coordinate Adjuster...</p>
    </div>
  ),
});

const MapPickerModal = dynamic(() => import('@/components/admin/MapPickerModal'), {
  ssr: false,
});

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [shipments, setShipments] = useState<Record<string, Shipment>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'All' | 'Air' | 'Ocean' | 'Ground'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState<'origin' | 'destination' | null>(null);
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);

  // Location Adjuster Form State
  const [editLat, setEditLat] = useState<number>(50.0);
  const [editLng, setEditLng] = useState<number>(8.0);
  const [checkpointLocation, setCheckpointLocation] = useState('');
  const [checkpointTitle, setCheckpointTitle] = useState('Waypoint Telemetry Scan');
  const [checkpointDetail, setCheckpointDetail] = useState('Container GPS ping validated at regional terminal.');

  // Create Shipment Form State
  const [newShipment, setNewShipment] = useState({
    id: `TGL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'Air' as Shipment['type'],
    carrier: 'TransGlobe Global Multimodal Network',
    conveyance: 'Flight TG-810 (Cargo Carrier)',
    senderName: 'Apex Precision Engineering AG',
    senderPhone: '+49 69 798 2834',
    receiverName: 'Nexus Global Logistics LLC',
    recipientPhone: '+1 (312) 555-0194',
    recipientEmail: 'dispatch@nexuslogistics.com',
    originName: 'Frankfurt Hub (FRA)',
    originPortCode: 'FRA',
    originCountry: 'Germany',
    originLat: 50.0379,
    originLng: 8.5622,
    destName: "Chicago O'Hare Terminal (ORD)",
    destPortCode: 'ORD',
    destCountry: 'United States',
    destLat: 41.9742,
    destLng: -87.9073,
    weight: '1,850 kg',
    pieces: '4 Pallets',
    description: 'Precision avionics spare components (Class 9 cargo). Handle with extreme care.',
    serviceLevel: 'Guaranteed Priority Freight',
    eta: 'In 3 Business Days',
    status: 'In Transit' as Shipment['status'],
    statusStep: 2 as Shipment['statusStep'],
  });

  // Verify Admin Authentication on Mount
  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    setAdminUser(session);
    setIsAuthChecking(false);
  }, [router]);

  // Load shipments on mount and listen to updates
  useEffect(() => {
    loadShipments();

    const handleUpdate = () => {
      loadShipments();
    };

    window.addEventListener('wwil:shipments-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('wwil:shipments-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadShipments = async () => {
    const apiUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${apiUrl}/parcels`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.parcels)) {
        const shipmentMap: Record<string, Shipment> = {};
        data.parcels.forEach((p: any) => {
          const transformed = transformBackendParcelToShipment(p);
          shipmentMap[transformed.id] = transformed;
        });
        setShipments(shipmentMap);
        return;
      }
    } catch (err) {
      console.warn('[Admin Dashboard] Live API offline, loading stored local shipments:', err);
    }
    setShipments(getStoredShipments());
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generateNewId = () => {
    const genId = `TGL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setNewShipment((prev) => ({ ...prev, id: genId }));
  };

  // Status Change Handler (PUT /api/parcels/:id)
  const handleStatusChange = async (id: string, newStatus: Shipment['status']) => {
    const targetShipment = shipments[id];
    const apiUrl = getApiBaseUrl();
    const dbIdentifier = targetShipment?.dbId || id;

    try {
      await fetch(`${apiUrl}/parcels/${dbIdentifier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser?.token || ''}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated to "${newStatus}" by dispatch controller.`,
        }),
      });
    } catch (err) {
      console.warn('API update fallback:', err);
    }

    updateShipmentStatus(id, newStatus);
    showToast(`Consignment ${id} status updated to "${newStatus}"`);
    loadShipments();
  };

  // Mode Change Handler (PUT /api/parcels/:id)
  const handleModeChange = async (id: string, newMode: Shipment['type']) => {
    const targetShipment = shipments[id];
    const apiUrl = getApiBaseUrl();
    const dbIdentifier = targetShipment?.dbId || id;

    try {
      await fetch(`${apiUrl}/parcels/${dbIdentifier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser?.token || ''}`,
        },
        body: JSON.stringify({
          transport_mode: newMode === 'Air' ? 'Air Freight' : newMode === 'Ocean' ? 'Ocean Freight' : 'Ground Logistics',
        }),
      });
    } catch (err) {
      console.warn('API mode update fallback:', err);
    }

    updateShipmentMode(id, newMode);
    showToast(`Consignment ${id} transport mode switched to "${newMode}"`);
    loadShipments();
  };

  // Delete Handler (DELETE /api/parcels/:id)
  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete shipment ${id}?`)) {
      const targetShipment = shipments[id];
      const apiUrl = getApiBaseUrl();
      const dbIdentifier = targetShipment?.dbId || id;

      try {
        await fetch(`${apiUrl}/parcels/${dbIdentifier}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminUser?.token || ''}`,
          },
        });
      } catch (err) {
        console.warn('API delete fallback:', err);
      }

      deleteShipment(id);
      showToast(`Shipment ${id} removed.`);
      loadShipments();
    }
  };

  // Open Location Adjuster Modal
  const openLocationAdjuster = (shipment: Shipment) => {
    setActiveShipmentId(shipment.id);
    setEditLat(shipment.currentLocation.lat);
    setEditLng(shipment.currentLocation.lng);
    setCheckpointLocation(shipment.currentLocation.name);
    setCheckpointTitle(`GPS Telemetry Update`);
    setCheckpointDetail(`Waypoint verified at coordinates (${shipment.currentLocation.lat.toFixed(2)}°, ${shipment.currentLocation.lng.toFixed(2)}°).`);
    setLocationModalOpen(true);
  };

  // Save Location & Add Checkpoint (PATCH /api/parcels/:id/location)
  const handleSaveLocation = async () => {
    if (!activeShipmentId) return;

    const targetShipment = shipments[activeShipmentId];
    const apiUrl = getApiBaseUrl();
    const dbIdentifier = targetShipment?.dbId || activeShipmentId;

    try {
      await fetch(`${apiUrl}/parcels/${dbIdentifier}/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser?.token || ''}`,
        },
        body: JSON.stringify({
          current_lat: editLat,
          current_lng: editLng,
          location_name: checkpointLocation || `Waypoint (${editLat.toFixed(2)}°, ${editLng.toFixed(2)}°)`,
          notes: checkpointDetail || 'Location telemetry recorded by TransGlobe logistics controller.',
        }),
      });
    } catch (err) {
      console.warn('API location patch fallback:', err);
    }

    updateShipmentLocation(
      activeShipmentId,
      editLat,
      editLng,
      checkpointLocation || `Waypoint (${editLat.toFixed(2)}°, ${editLng.toFixed(2)}°)`,
      checkpointTitle || 'Terminal Waypoint Checkpoint',
      checkpointDetail || 'Location telemetry recorded by TransGlobe logistics controller.'
    );

    setLocationModalOpen(false);
    showToast(`Updated GPS coordinates for ${activeShipmentId} & logged new checkpoint!`);
    loadShipments();
  };

  // Create Shipment Handler
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingShipment(true);

    try {
      // Mode-aware route calculation: OSRM highway for Ground, Maritime straits for Ocean, Great-Circle arcs for Air
      let routeCoords: [number, number][];
      try {
        const routeCalc = await calculateModeAwareRoute({
          origin: [Number(newShipment.originLat), Number(newShipment.originLng)],
          destination: [Number(newShipment.destLat), Number(newShipment.destLng)],
          transportMode: newShipment.type,
          status: newShipment.status,
        });
        routeCoords = routeCalc.fullRoute;
      } catch (calcErr) {
        console.warn('Mode-aware route calculation fallback:', calcErr);
        routeCoords = [
          [Number(newShipment.originLat), Number(newShipment.originLng)],
          [Number(newShipment.destLat), Number(newShipment.destLng)],
        ];
      }

      const shipmentToAdd: Shipment = {
        id: newShipment.id.trim().toUpperCase(),
        type: newShipment.type,
        carrier: newShipment.carrier,
        conveyance: newShipment.conveyance,
        senderName: newShipment.senderName,
        senderPhone: newShipment.senderPhone,
        receiverName: newShipment.receiverName,
        recipientPhone: newShipment.recipientPhone,
        recipientEmail: newShipment.recipientEmail,
        description: newShipment.description,
        origin: {
          name: newShipment.originName,
          portCode: newShipment.originPortCode,
          country: newShipment.originCountry,
          lat: Number(newShipment.originLat),
          lng: Number(newShipment.originLng),
        },
        destination: {
          name: newShipment.destName,
          portCode: newShipment.destPortCode,
          country: newShipment.destCountry,
          lat: Number(newShipment.destLat),
          lng: Number(newShipment.destLng),
        },
        currentLocation: {
          name: `${newShipment.originName} Outbound Terminal`,
          lat: Number(newShipment.originLat),
          lng: Number(newShipment.originLng),
        },
        status: newShipment.status,
        statusStep: newShipment.statusStep,
        eta: newShipment.eta,
        departedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        pieces: newShipment.pieces,
        weight: newShipment.weight,
        serviceLevel: newShipment.serviceLevel,
        routeCoordinates: routeCoords,
        checkpoints: [
          {
            time: 'Just now',
            location: newShipment.originName,
            title: 'Shipment Created & Manifested',
            detail: 'Consignment entered into TransGlobe enterprise logistics network.',
            completed: true,
          },
        ],
        lastUpdated: 'Just now',
      };

      // Connect to live Express endpoint: POST /api/parcels
      const apiUrl = getApiBaseUrl();
      try {
        const backendRes = await fetch(`${apiUrl}/parcels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser?.token || ''}`,
          },
          body: JSON.stringify({
            tracking_number: newShipment.id.trim().toUpperCase(),
            sender_name: newShipment.senderName,
            sender_phone: newShipment.senderPhone,
            recipient_name: newShipment.receiverName,
            recipient_phone: newShipment.recipientPhone,
            recipient_email: newShipment.recipientEmail,
            description: newShipment.description,
            origin_address: `${newShipment.originName}, ${newShipment.originCountry}`,
            destination_address: `${newShipment.destName}, ${newShipment.destCountry}`,
            origin_lat: Number(newShipment.originLat),
            origin_lng: Number(newShipment.originLng),
            dest_lat: Number(newShipment.destLat),
            dest_lng: Number(newShipment.destLng),
            current_lat: Number(newShipment.originLat),
            current_lng: Number(newShipment.originLng),
            transport_mode: newShipment.type === 'Air' ? 'Air Freight' : newShipment.type === 'Ocean' ? 'Ocean Freight' : 'Ground Logistics',
            status: newShipment.status,
            estimated_delivery: newShipment.eta,
            carrier_name: newShipment.carrier,
            vessel_or_flight: newShipment.conveyance,
            weight_kg: newShipment.weight,
          }),
        });

        const createdData = await backendRes.json();
        if (createdData.success && createdData.parcel) {
          shipmentToAdd.dbId = createdData.parcel.id;
        }
      } catch (err) {
        console.warn('API create shipment fallback:', err);
      }

      upsertShipment(shipmentToAdd);
      setCreateModalOpen(false);
      generateNewId();
      showToast(`New shipment ${shipmentToAdd.id} created successfully!`);
      loadShipments();
    } catch (err) {
      console.error('Error creating shipment:', err);
      showToast('Error registering shipment. Please check coordinates and inputs.');
    } finally {
      setIsCreatingShipment(false);
    }
  };

  // Filtered Shipments
  const shipmentList = Object.values(shipments);
  const filteredShipments = shipmentList.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.senderName && s.senderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.receiverName && s.receiverName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMode = modeFilter === 'All' || s.type === modeFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesMode && matchesStatus;
  });

  // Calculate Metrics
  const totalShipments = shipmentList.length;
  const inTransitCount = shipmentList.filter((s) => s.status === 'In Transit').length;
  const customsHoldCount = shipmentList.filter((s) => s.status === 'On Hold / Customs').length;
  const deliveredCount = shipmentList.filter((s) => s.status === 'Delivered').length;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-wwil-navy-950 flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-xl shadow-blue-500/30">
            <span className="font-display font-extrabold text-3xl tracking-tighter text-white">W</span>
          </div>
          <div className="absolute -inset-2 rounded-2xl border border-[#2563EB]/40 animate-ping"></div>
        </div>
        <div className="flex items-center gap-3 text-slate-300 font-semibold text-sm">
          <RefreshCw className="w-4 h-4 text-[#2563EB] animate-spin" />
          <span>Verifying TransGlobe-Logistics Operations clearance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 lg:py-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl bg-slate-900 border border-[#2563EB] text-white text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Authenticated Admin Operator Session Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wwil-navy-900 border-2 border-[#2563EB] flex items-center justify-center font-bold text-white text-xs shadow-md">
              {adminUser?.avatarInitials || 'MV'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{adminUser?.name || 'Authorized Operator'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Active Session
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {adminUser?.role} &bull; <span className="font-mono text-slate-600">{adminUser?.department}</span> ({adminUser?.terminalCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/track-order"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Customer Tracking View</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
              title="Terminate Operations Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Top Header & Breadcrumb */}
        <div className="relative overflow-hidden bg-wwil-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <img
            src="/assets/bgpic1.avif"
            alt="TransGlobe Operations Network"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Semi-transparent dark corporate slate/navy overlay (bg-slate-900/80) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/35"></div>

          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] beacon-pulse"></span>
              <span className="text-xs uppercase font-bold tracking-widest text-[#2563EB]">
                Enterprise Operations Portal
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Logistics Dispatch &amp; Telemetry Management
            </h1>
            <p className="text-xs text-slate-300">
              Manage international consignments, update milestone progression, and calibrate GPS coordinates
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                generateNewId();
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Shipment</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Consignments</span>
              <Boxes className="w-5 h-5 text-[#2563EB]" />
            </div>
            <strong className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2 block">
              {totalShipments}
            </strong>
            <span className="text-[11px] text-slate-400 mt-1 block">Active across all corridors</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active In Transit</span>
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <strong className="font-display font-extrabold text-2xl sm:text-3xl text-blue-600 mt-2 block">
              {inTransitCount}
            </strong>
            <span className="text-[11px] text-slate-400 mt-1 block">Linehaul telemetry active</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customs / On Hold</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <strong className="font-display font-extrabold text-2xl sm:text-3xl text-amber-500 mt-2 block">
              {customsHoldCount}
            </strong>
            <span className="text-[11px] text-slate-400 mt-1 block">Awaiting border release</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered &bull; Closed</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <strong className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-500 mt-2 block">
              {deliveredCount}
            </strong>
            <span className="text-[11px] text-slate-400 mt-1 block">Signed electronic e-POD</span>
          </div>
        </div>

        {/* Parcel Management Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Controls Bar: Search & Filters */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by Tracking ID, City, or Consignee..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            {/* Mode & Status Filters */}
            <div className="relative z-10 flex flex-wrap items-center gap-3">
              {/* Mode Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                {(['All', 'Air', 'Ocean', 'Ground'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setModeFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      modeFilter === mode
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#2563EB]"
              >
                <option value="All">All Statuses</option>
                <option value="Order Received">Order Received</option>
                <option value="In Transit">In Transit</option>
                <option value="On Hold / Customs">On Hold / Customs</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

          </div>

          {/* Shipments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Shipment ID / Type</th>
                  <th className="px-6 py-3.5">Trade Route</th>
                  <th className="px-6 py-3.5">Pipeline Status</th>
                  <th className="px-6 py-3.5">Live Coordinates</th>
                  <th className="px-6 py-3.5">ETA / Weight</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      {searchQuery
                        ? `No matching consignments found for query "${searchQuery}".`
                        : "No active consignments in database. Click 'Create New Shipment' to register your first cargo parcel."}
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* ID & Mode Selector */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            {s.type === 'Air' && <Plane className="w-4 h-4 text-[#2563EB]" />}
                            {s.type === 'Ocean' && <Ship className="w-4 h-4 text-blue-600" />}
                            {s.type === 'Ground' && <Truck className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <div>
                            <strong className="font-mono text-slate-900 block font-bold text-xs">{s.id}</strong>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <select
                                value={s.type}
                                onChange={(e) => handleModeChange(s.id, e.target.value as Shipment['type'])}
                                className="bg-transparent border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-[#2563EB]"
                              >
                                <option value="Air">Air</option>
                                <option value="Ocean">Ocean</option>
                                <option value="Ground">Ground</option>
                              </select>
                              <span className="text-[10px] text-slate-400">{s.conveyance.split(' ')[0]}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="text-slate-800 font-medium truncate max-w-[200px]">
                            {s.origin.name} &rarr; {s.destination.name}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {s.senderName || 'Enterprise Client'}
                          </span>
                        </div>
                      </td>

                      {/* Quick Status Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(s.id, e.target.value as Shipment['status'])}
                          className={`font-semibold text-xs px-2.5 py-1 rounded-lg border focus:outline-none transition-colors ${
                            s.status === 'In Transit'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : s.status === 'On Hold / Customs'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : s.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.status === 'Out for Delivery'
                              ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Order Received">Order Received</option>
                          <option value="In Transit">In Transit</option>
                          <option value="On Hold / Customs">On Hold / Customs</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>

                      {/* Current Location & GPS */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-700 block truncate max-w-[180px]">
                            {s.currentLocation.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#2563EB] block">
                            {s.currentLocation.lat.toFixed(2)}°, {s.currentLocation.lng.toFixed(2)}°
                          </span>
                        </div>
                      </td>

                      {/* ETA & Weight */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <strong className="text-slate-800 block text-xs">{s.eta}</strong>
                          <span className="text-[10px] text-slate-400 block">{s.weight} ({s.pieces})</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openLocationAdjuster(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors shadow-sm"
                            title="Open interactive Leaflet map to adjust location"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Adjust Pin</span>
                          </button>

                          <Link
                            href={`/track-order?id=${s.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                            title="View in Customer Tracking Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete shipment record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredShipments.length} of {totalShipments} consignments</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Synchronized with client `/track-order` views in real-time
            </span>
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: INTERACTIVE LEAFLET LOCATION ADJUSTER                       */}
      {/* ===================================================================== */}
      {locationModalOpen && activeShipmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[95vw] max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 sm:p-6 bg-wwil-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-[#2563EB] tracking-wider block">
                  Interactive Telemetry Calibrator
                </span>
                <h3 className="font-display font-bold text-lg text-white">
                  Adjust Location Coordinates for {activeShipmentId}
                </h3>
              </div>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Embedded Interactive Leaflet Map */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Click map or drag the orange pin to reposition:
                </label>
                <AdminLocationMap
                  lat={editLat}
                  lng={editLng}
                  shipmentId={activeShipmentId}
                  routeCoords={activeShipmentId && shipments[activeShipmentId] ? shipments[activeShipmentId].routeCoordinates : undefined}
                  originCoords={activeShipmentId && shipments[activeShipmentId] ? [shipments[activeShipmentId].origin.lat, shipments[activeShipmentId].origin.lng] : undefined}
                  destCoords={activeShipmentId && shipments[activeShipmentId] ? [shipments[activeShipmentId].destination.lat, shipments[activeShipmentId].destination.lng] : undefined}
                  onChange={(newLat, newLng) => {
                    setEditLat(newLat);
                    setEditLng(newLng);
                  }}
                />
              </div>

              {/* Coordinates Preview Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Latitude (°)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLat}
                    onChange={(e) => setEditLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Longitude (°)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLng}
                    onChange={(e) => setEditLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* New Checkpoint Information */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  New Checkpoint Log Entry
                </span>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Waypoint / Location Name</label>
                  <input
                    type="text"
                    value={checkpointLocation}
                    onChange={(e) => setCheckpointLocation(e.target.value)}
                    placeholder="e.g. Rotterdam APM Terminal Maasvlakte"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Checkpoint Event Title</label>
                  <input
                    type="text"
                    value={checkpointTitle}
                    onChange={(e) => setCheckpointTitle(e.target.value)}
                    placeholder="e.g. Inbound Customs Cleared &amp; Unloaded"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Checkpoint Log Detail</label>
                  <textarea
                    rows={2}
                    value={checkpointDetail}
                    onChange={(e) => setCheckpointDetail(e.target.value)}
                    placeholder="Provide operational inspection notes..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Confirm &amp; Log Checkpoint</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CREATE NEW PARCEL SHIPMENT                                  */}
      {/* ===================================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[95vw] max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 sm:p-6 bg-wwil-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-[#2563EB] tracking-wider block">
                  New Consignment Entry
                </span>
                <h3 className="font-display font-bold text-lg text-white">
                  Register International Shipment
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Tracking ID & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tracking Number *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={newShipment.id}
                      onChange={(e) => setNewShipment({ ...newShipment, id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#2563EB]"
                    />
                    <button
                      type="button"
                      onClick={generateNewId}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 shrink-0"
                      title="Generate New Tracking ID"
                    >
                      Regen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Means of Transportation *</label>
                  <select
                    value={newShipment.type}
                    onChange={(e) => setNewShipment({ ...newShipment, type: e.target.value as Shipment['type'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Air">Air Freight (Airplane)</option>
                    <option value="Ocean">Ocean Freight (Vessel)</option>
                    <option value="Ground">Ground Logistics (Truck / Rail)</option>
                  </select>
                </div>
              </div>

              {/* Carrier & Conveyance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Carrier Name *</label>
                  <input
                    type="text"
                    required
                    value={newShipment.carrier}
                    onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Flight / Vessel / Truck ID *</label>
                  <input
                    type="text"
                    required
                    value={newShipment.conveyance}
                    onChange={(e) => setNewShipment({ ...newShipment, conveyance: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sender Name / Company *</label>
                  <input
                    type="text"
                    required
                    value={newShipment.senderName}
                    onChange={(e) => setNewShipment({ ...newShipment, senderName: e.target.value })}
                    placeholder="e.g. Apex Precision Engineering AG"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sender Phone</label>
                  <input
                    type="tel"
                    value={newShipment.senderPhone}
                    onChange={(e) => setNewShipment({ ...newShipment, senderPhone: e.target.value })}
                    placeholder="e.g. +49 69 798 2834"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Receiver Name / Consignee *</label>
                  <input
                    type="text"
                    required
                    value={newShipment.receiverName}
                    onChange={(e) => setNewShipment({ ...newShipment, receiverName: e.target.value })}
                    placeholder="e.g. Nexus Global Logistics LLC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Phone</label>
                  <input
                    type="tel"
                    value={newShipment.recipientPhone}
                    onChange={(e) => setNewShipment({ ...newShipment, recipientPhone: e.target.value })}
                    placeholder="e.g. +1 (312) 555-0194"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email (Notifications)</label>
                  <input
                    type="email"
                    value={newShipment.recipientEmail}
                    onChange={(e) => setNewShipment({ ...newShipment, recipientEmail: e.target.value })}
                    placeholder="e.g. dispatch@nexuslogistics.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Origin Place Lookup & Geocoding */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <PlaceAutocomplete
                  label="Origin Terminal / Port / City"
                  value={newShipment.originName}
                  placeholder="Type origin city, maritime port, or cargo hub..."
                  required
                  onPickOnMap={() => setMapPickerTarget('origin')}
                  onSelect={(place: PlaceResult) => {
                    setNewShipment((prev) => ({
                      ...prev,
                      originName: place.name,
                      originPortCode: place.portCode,
                      originCountry: place.country,
                      originLat: place.lat,
                      originLng: place.lng,
                    }));
                  }}
                />

                {/* Resolved Geocoding Metadata Preview */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className="font-semibold text-slate-500">Port / Hub Code:</span>
                  <input
                    type="text"
                    value={newShipment.originPortCode}
                    onChange={(e) => setNewShipment({ ...newShipment, originPortCode: e.target.value.toUpperCase() })}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="font-semibold text-slate-500 ml-2">Coordinates:</span>
                  <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-bold">
                    {newShipment.originLat.toFixed(4)}°, {newShipment.originLng.toFixed(4)}°
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('origin')}
                    className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold ml-auto flex items-center gap-1 hover:underline"
                  >
                    <MapPin className="w-3 h-3 text-[#2563EB]" />
                    Adjust on Map
                  </button>
                </div>
              </div>

              {/* Destination Place Lookup & Geocoding */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <PlaceAutocomplete
                  label="Destination Terminal / Port / City"
                  value={newShipment.destName}
                  placeholder="Type destination city, port, or hub..."
                  required
                  onPickOnMap={() => setMapPickerTarget('destination')}
                  onSelect={(place: PlaceResult) => {
                    setNewShipment((prev) => ({
                      ...prev,
                      destName: place.name,
                      destPortCode: place.portCode,
                      destCountry: place.country,
                      destLat: place.lat,
                      destLng: place.lng,
                    }));
                  }}
                />

                {/* Resolved Geocoding Metadata Preview */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className="font-semibold text-slate-500">Port / Hub Code:</span>
                  <input
                    type="text"
                    value={newShipment.destPortCode}
                    onChange={(e) => setNewShipment({ ...newShipment, destPortCode: e.target.value.toUpperCase() })}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="font-semibold text-slate-500 ml-2">Coordinates:</span>
                  <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-bold">
                    {newShipment.destLat.toFixed(4)}°, {newShipment.destLng.toFixed(4)}°
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('destination')}
                    className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold ml-auto flex items-center gap-1 hover:underline"
                  >
                    <MapPin className="w-3 h-3 text-[#2563EB]" />
                    Adjust on Map
                  </button>
                </div>
              </div>

              {/* Weight, Pieces & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight *</label>
                  <input
                    type="text"
                    required
                    value={newShipment.weight}
                    onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pieces / Packaging</label>
                  <input
                    type="text"
                    value={newShipment.pieces}
                    onChange={(e) => setNewShipment({ ...newShipment, pieces: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newShipment.status}
                    onChange={(e) => {
                      const stat = e.target.value as Shipment['status'];
                      const step = stat === 'Order Received' ? 1 : stat === 'In Transit' ? 2 : stat === 'On Hold / Customs' ? 3 : stat === 'Out for Delivery' ? 4 : 5;
                      setNewShipment({ ...newShipment, status: stat, statusStep: step });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Order Received">Order Received</option>
                    <option value="In Transit">In Transit</option>
                    <option value="On Hold / Customs">On Hold / Customs</option>
                  </select>
                </div>
              </div>

              {/* Package / Consignment Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Package / Consignment Description
                </label>
                <textarea
                  rows={2}
                  value={newShipment.description}
                  onChange={(e) => setNewShipment({ ...newShipment, description: e.target.value })}
                  placeholder="e.g. High-value avionics spare parts, temperature-controlled, fragile container class 9..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isCreatingShipment}
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingShipment}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors disabled:opacity-50"
                >
                  {isCreatingShipment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Computing Route &amp; Manifesting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>+ REGISTER CONSIGNMENT</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: INTERACTIVE LEAFLET MAP PICKER FOR ORIGIN / DESTINATION     */}
      {/* ===================================================================== */}
      <MapPickerModal
        isOpen={mapPickerTarget !== null}
        targetType={mapPickerTarget || 'origin'}
        title={mapPickerTarget === 'origin' ? 'Pick Origin Terminal on Map' : 'Pick Destination Hub on Map'}
        initialLat={mapPickerTarget === 'origin' ? newShipment.originLat : newShipment.destLat}
        initialLng={mapPickerTarget === 'origin' ? newShipment.originLng : newShipment.destLng}
        initialName={mapPickerTarget === 'origin' ? newShipment.originName : newShipment.destName}
        initialPortCode={mapPickerTarget === 'origin' ? newShipment.originPortCode : newShipment.destPortCode}
        initialCountry={mapPickerTarget === 'origin' ? newShipment.originCountry : newShipment.destCountry}
        onClose={() => setMapPickerTarget(null)}
        onConfirm={(result: MapPickedLocation) => {
          if (mapPickerTarget === 'origin') {
            setNewShipment((prev) => ({
              ...prev,
              originName: result.name,
              originPortCode: result.portCode,
              originCountry: result.country,
              originLat: result.lat,
              originLng: result.lng,
            }));
            showToast(`Origin location set to ${result.name} (${result.lat.toFixed(2)}°, ${result.lng.toFixed(2)}°)`);
          } else if (mapPickerTarget === 'destination') {
            setNewShipment((prev) => ({
              ...prev,
              destName: result.name,
              destPortCode: result.portCode,
              destCountry: result.country,
              destLat: result.lat,
              destLng: result.lng,
            }));
            showToast(`Destination set to ${result.name} (${result.lat.toFixed(2)}°, ${result.lng.toFixed(2)}°)`);
          }
        }}
      />

    </div>
  );
}
