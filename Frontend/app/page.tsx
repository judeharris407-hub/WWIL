import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Boxes, 
  MapPin, 
  Satellite, 
  ShieldCheck, 
  Check, 
  Star, 
  Truck, 
  Plane, 
  Ship, 
  Building2, 
  FileCheck 
} from 'lucide-react';
import TrackingSearchCard from '@/components/tracking/TrackingSearchCard';
import StaticQuoteForm from '@/components/quote/StaticQuoteForm';
import GlobalSupportSection from '@/components/home/GlobalSupportSection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ===================================================================== */}
      {/* 1. HERO SECTION (Asymmetric Split with Clean White Tracking Card)     */}
      {/* ===================================================================== */}
      <section className="relative bg-wwil-navy-950 text-white overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Logistics Photography Background & Dark Corporate Translucent Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/assets/containers1.webp"
            alt="TransGlobe-Logistics Multimodal Container Operations"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          {/* Semi-transparent dark corporate slate/navy overlay (bg-slate-900/80) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/35"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Side: Bold Typography & Stat Badges (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold tracking-wider uppercase text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] beacon-pulse"></span>
                <span>International Multimodal Freight Network</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-6xl tracking-tight leading-[1.1] text-white">
                Scheduled International <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  Freight Forwarding &amp;
                </span>
                <span className="text-[#2563EB]"> Logistics</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
                Connecting enterprise supply chains across 140+ countries with scheduled freight corridors, secured carrier allocations, single-window customs brokerage, and verified live GPS telemetry.
              </p>

              {/* Crisp Stat Badges Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-1 max-w-xl">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-center">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight block">140+</span>
                  <span className="text-xs font-medium text-slate-400 mt-0.5 block">Countries</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-center">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight block">2.4M+</span>
                  <span className="text-xs font-medium text-slate-400 mt-0.5 block">Tons Shipped</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-center">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-[#2563EB] tracking-tight block">99.4%</span>
                  <span className="text-xs font-medium text-slate-400 mt-0.5 block">On-Time</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/request-quote"
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Request Instant Tariff</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-base transition-colors"
                >
                  <Boxes className="w-5 h-5 text-[#2563EB]" />
                  <span>Explore Services</span>
                </Link>
              </div>

              {/* Live Status Ticker */}
              <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] tracking-wide uppercase">
                  Telemetry Active
                </span>
                <span className="truncate">
                  Direct liner corridors linking Europe, North America, and Asia-Pacific.
                </span>
              </div>

            </div>

            {/* Right Side: Clean White Tracking Card (5 Cols) */}
            <div className="lg:col-span-5">
              <TrackingSearchCard initialCode="" />
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. STATS COUNTER BANNER (Deep Corporate Slate with Orange Accents)    */}
      {/* ===================================================================== */}
      <section className="relative bg-wwil-navy-900 text-white py-12 lg:py-16 border-y border-slate-800 overflow-hidden">
        {/* Logistics Photography Background & Dark Corporate Translucent Overlay */}
        <img
          src="/assets/bgpic1.avif"
          alt="TransGlobe-Logistics Global Freight Hub Telemetry"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-wrap items-center justify-between pb-8 mb-8 border-b border-slate-800 text-xs text-slate-400 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
              <span className="font-semibold text-slate-300 uppercase tracking-wide">Operational Benchmark Metrics</span>
            </div>
            <div className="flex items-center flex-wrap gap-4 sm:gap-8 font-medium">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#2563EB]" /> IATA Cargo Member</span>
              <span className="flex items-center gap-1.5"><Ship className="w-4 h-4 text-[#2563EB]" /> FIATA Licensed Forwarder</span>
              <span className="flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-[#2563EB]" /> FMC Certified NVOCC</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#2563EB]" /> C-TPAT &amp; AEO Validated</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            <div className="border-l-4 border-blue-500 pl-5 py-2 bg-slate-900/40 rounded-r-xl">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">140+</span>
                <span className="text-[#2563EB] font-bold text-xl">Lanes</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mt-1">Global Trade Corridors</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Direct liner services linking North America, Europe, Asia-Pacific, and Latin America.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-5 py-2 bg-slate-900/40 rounded-r-xl">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">99.8%</span>
                <span className="text-[#2563EB] font-bold text-xl">Clear</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mt-1">Zero-Hold Customs Accuracy</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Single-window customs declaration verification ensuring expedited border release.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-5 py-2 bg-slate-900/40 rounded-r-xl">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">2.4M+</span>
                <span className="text-[#2563EB] font-bold text-xl">Tons</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mt-1">Multimodal Volume Capacity</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Over two million metric tons and ocean container TEUs coordinated across major trade lanes annually.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-5 py-2 bg-slate-900/40 rounded-r-xl">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">&lt; 15</span>
                <span className="text-[#2563EB] font-bold text-xl">Min</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mt-1">Average Dispatch Response</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Rapid booking confirmation, secured carrier space allocation, and 24/7 dispatch support.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. LIVE MAP TRACKING FEATURE HIGHLIGHT                                */}
      {/* ===================================================================== */}
      <section className="py-20 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
                <Satellite className="w-3.5 h-3.5" />
                Live Satellite Telemetry
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Real-Time GPS Route Mapping &amp; <span className="text-[#2563EB]">Waypoint Telemetry</span>
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Never wonder where your critical cargo is. TransGlobe-Logistics integrates satellite AIS vessel tracking, ADS-B flight telemetry, and terrestrial GPS sensors into an interactive tracking map interface.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-sm text-slate-700">
                    <strong>Direct Port &amp; Terminal Telemetry:</strong> Milestone confirmations as containers clear gantry cranes, container yards, and customs gates.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-sm text-slate-700">
                    <strong>Dynamic Milestone Timeline:</strong> 5-stage progression from initial pickup to final dockside signature.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-sm text-slate-700">
                    <strong>Direct URL Query Integration:</strong> Shareable live tracking dashboards for consignees and supply chain directors.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/track-order"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-md"
                >
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                  <span>Launch Live Tracking Dashboard</span>
                </Link>
              </div>
            </div>

            {/* Interactive Preview Mockup Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 relative overflow-hidden group">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Live Telemetry Stream &bull; Active Satellite Mesh
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#2563EB] text-xs font-bold">
                    Online
                  </span>
                </div>

                <div className="h-64 sm:h-72 rounded-xl overflow-hidden relative border border-slate-200 bg-slate-100">
                  <img
                    src="/assets/bgpic1.avif"
                    alt="TransGlobe-Logistics Telemetry Map Preview"
                    className="w-full h-full object-cover img-editorial-zoom opacity-80"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center p-6 text-center">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 shadow-xl border border-slate-200 max-w-sm">
                      <Satellite className="w-8 h-8 text-[#2563EB] mx-auto mb-2" />
                      <strong className="text-slate-900 text-sm block">Interactive Leaflet Map Active</strong>
                      <p className="text-slate-500 text-xs mt-1">
                        Track coordinates, geofences, and checkpoint logs on our dedicated tracking page.
                      </p>
                      <Link
                        href="/track-order"
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white font-bold text-xs hover:bg-[#1D4ED8] transition-colors"
                      >
                        <span>Open Interactive Map</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Global Multimodal Corridors</span>
                  <span className="text-[#2563EB] font-bold">Continuous Satellite Updates</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. SERVICES SECTION (Asymmetric Grid)                                 */}
      {/* ===================================================================== */}
      <section id="services" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <Boxes className="w-3.5 h-3.5 text-[#2563EB]" />
                Multimodal Logistics Solutions
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Engineered Freight Capacity for <span className="text-[#2563EB]">Global Demands</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                We combine maritime liner capacity with scheduled charter air flights, heavy overland transport, and secure bonded warehousing.
              </p>
            </div>

            <div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-slate-900 hover:bg-slate-900 hover:text-white font-bold text-sm text-slate-900 transition-colors shadow-sm"
              >
                <span>View All Service Specifications</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Primary Service (Wide 2-Column Feature Card - 7 Cols) */}
            <div className="lg:col-span-7 group relative rounded-2xl overflow-hidden shadow-xl bg-slate-900 flex flex-col justify-end min-h-[480px] lg:min-h-[560px] border border-slate-200">
              <img
                src="/assets/ship1.avif"
                alt="TransGlobe-Logistics Ocean Container Ship and Air Cargo Operations"
                className="absolute inset-0 w-full h-full object-cover img-editorial-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wwil-navy-950 via-wwil-navy-950/75 to-wwil-navy-950/20"></div>

              <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#2563EB] text-white text-xs font-bold tracking-wider uppercase shadow-md">
                  Primary Flagship Service
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-200 text-xs font-medium">
                  FCL &amp; LCL Ocean + Air Charters
                </span>
              </div>

              <div className="relative z-10 p-6 sm:p-10 space-y-4 text-white">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Intercontinental Multimodal</span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                    Global Air &amp; Ocean Freight Multimodal
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  High-volume ocean container logistics combined with guaranteed charter air capacity. We coordinate liner schedules with top maritime alliances and air operators to safeguard delivery timelines across every continent.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/10 text-center">
                    <span className="block text-xs text-slate-300">Transit Speed</span>
                    <strong className="text-sm font-bold text-white">Air: 2-4 Days</strong>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/10 text-center">
                    <span className="block text-xs text-slate-300">Ocean Load</span>
                    <strong className="text-sm font-bold text-white">FCL &amp; LCL Dry/Reefer</strong>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/10 text-center">
                    <span className="block text-xs text-slate-300">Space Allocation</span>
                    <strong className="text-sm font-bold text-white">Guaranteed</strong>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    href="/services#air-ocean"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Explore Route Specifications</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Secondary Services: Compact Horizontal Cards (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              
              <Link
                href="/services#ground"
                className="group relative bg-[#F8FAFC] hover:bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 border-l-4 border-l-slate-300 hover:border-l-[#2563EB]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
                    <img src="/assets/Truck1.avif" alt="Ground Logistics" className="w-full h-full object-cover img-editorial-zoom" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">Overland &amp; Rail</span>
                      <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#2563EB] text-slate-500 group-hover:text-white flex items-center justify-center text-xs transition-colors duration-200 transform group-hover:translate-x-1">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                      Ground Logistics &amp; Rail Intermodal
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      Long-haul FTL/LTL freight, heavy equipment transport, and double-stack rail connectivity.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/services#warehousing"
                className="group relative bg-[#F8FAFC] hover:bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 border-l-4 border-l-slate-300 hover:border-l-[#2563EB]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
                    <img src="/assets/warehouse1.avif" alt="Warehousing" className="w-full h-full object-cover img-editorial-zoom" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">Storage &amp; 3PL</span>
                      <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#2563EB] text-slate-500 group-hover:text-white flex items-center justify-center text-xs transition-colors duration-200 transform group-hover:translate-x-1">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                      Bonded Warehousing &amp; Distribution
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      Bonded storage facilities, barcode/RFID inventory management, climate control, and pick-and-pack fulfillment.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/services#customs"
                className="group relative bg-[#F8FAFC] hover:bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 border-l-4 border-l-slate-300 hover:border-l-[#2563EB]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
                    <img src="/assets/news-image4.jpg" alt="Customs Brokerage" className="w-full h-full object-cover img-editorial-zoom" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">Border Compliance</span>
                      <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#2563EB] text-slate-500 group-hover:text-white flex items-center justify-center text-xs transition-colors duration-200 transform group-hover:translate-x-1">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                      Customs Clearance &amp; Brokerage
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      Zero-hold digital declarations, tariff code harmonization, and licensed in-house customs agents.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/services#express"
                className="group relative bg-[#F8FAFC] hover:bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 border-l-4 border-l-slate-300 hover:border-l-[#2563EB]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative bg-slate-200">
                    <img src="/assets/van1.avif" alt="Express Delivery" className="w-full h-full object-cover img-editorial-zoom" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">Critical Final-Mile</span>
                      <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#2563EB] text-slate-500 group-hover:text-white flex items-center justify-center text-xs transition-colors duration-200 transform group-hover:translate-x-1">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                      Express Delivery &amp; Time-Critical Courier
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      On-board couriers, time-definite airport transfers, cold-chain pharma, and same-day priority vans.
                    </p>
                  </div>
                </div>
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. "HOW IT WORKS" (Continental Process Flow)                          */}
      {/* ===================================================================== */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              Continental Process Flow
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              From Origin Gate to <span className="text-[#2563EB]">Destination Doorstep</span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Our 4-stage verified pipeline eliminates supply chain blackouts. Every milestone is logged with satellite timestamps and verified electronic proof.
            </p>
          </div>

          <div className="relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden lg:block absolute top-24 left-16 right-16 h-0.5 tracking-dashed-line z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
              
              {/* Step 01 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-display font-extrabold text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    01
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                    Stage 1
                  </span>
                </div>
                <div className="h-32 rounded-xl overflow-hidden mb-4 relative bg-slate-200">
                  <img src="/assets/banner2.jpg" alt="Request & Booking" className="w-full h-full object-cover img-editorial-zoom" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-[#2563EB] transition-colors">
                  01. Request &amp; Booking
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Direct tariff calculation, confirmed carrier space allocation, and electronic booking confirmation.
                </p>
              </div>

              {/* Step 02 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-display font-extrabold text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    02
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Stage 2
                  </span>
                </div>
                <div className="h-32 rounded-xl overflow-hidden mb-4 relative bg-slate-200">
                  <img src="/assets/delivery-trucks.jpg" alt="Terminal Pickup" className="w-full h-full object-cover img-editorial-zoom" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-[#2563EB] transition-colors">
                  02. Terminal Pickup
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Consignment collection by dedicated fleet, tare weight verification, high-security customs seal, and barcode scanning.
                </p>
              </div>

              {/* Step 03 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white font-display font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    03
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                    Stage 3
                  </span>
                </div>
                <div className="h-32 rounded-xl overflow-hidden mb-4 relative bg-slate-200">
                  <img src="/assets/plane2.avif" alt="Transit & Customs" className="w-full h-full object-cover img-editorial-zoom" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-[#2563EB] transition-colors">
                  03. Global Transit &amp; Customs
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Linehaul transit with continuous satellite telemetry, pre-arrival customs inspection, and single-window release.
                </p>
              </div>

              {/* Step 04 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-display font-extrabold text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    04
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Stage 4
                  </span>
                </div>
                <div className="h-32 rounded-xl overflow-hidden mb-4 relative bg-slate-200">
                  <img src="/assets/van1.avif" alt="Doorstep Delivery" className="w-full h-full object-cover img-editorial-zoom" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-[#2563EB] transition-colors">
                  04. Doorstep Delivery
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Final-mile arrival at consignee loading dock, condition check, and instant electronic Proof of Delivery (e-POD).
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. STATIC QUOTE REQUEST FORM & VALUE CHECKLIST                        */}
      {/* ===================================================================== */}
      <section id="quote" className="py-20 lg:py-28 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left Column: Business Value Commitments (5 Cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
                  <FileCheck className="w-3.5 h-3.5" />
                  Guaranteed Freight Economics
                </div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                  Transparent Global Shipping, <span className="text-[#2563EB]">No Surcharges</span>
                </h2>
                <p className="text-base text-slate-600 leading-relaxed">
                  Our direct tier-1 carrier contracts ensure stable space allocations and fixed tariff matrices for high-volume enterprise shippers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Guaranteed Carrier Space Allocation</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Priority loading on top maritime alliances and direct airline contracts even during peak peak-season crunches.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Active Cargo Telemetry &amp; Monitoring</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Calibrated sensors tracking GPS coordinates, ambient temperature, humidity, and transit shock events.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Customs Brokerage Pre-Clearance</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Harmonized Tariff Schedule (HTS) verification keeping port inspection wait times to under 2 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Comprehensive Lloyd's Cargo Insurance</h3>
                    <p className="text-xs text-slate-600 mt-0.5">All-risk comprehensive coverage underwritten by premier maritime syndicates protecting high-value consignments.</p>
                  </div>
                </div>
              </div>

              {/* Client Endorsement */}
              <div className="relative overflow-hidden p-5 rounded-2xl bg-wwil-navy-900 text-white space-y-3 shadow-lg border border-slate-800">
                <img
                  src="/assets/banner2.jpg"
                  alt="TransGlobe-Logistics Maritime Port Facility"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/65 to-slate-900/50"></div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-1 text-[#2563EB] text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#2563EB]" />
                    <Star className="w-3.5 h-3.5 fill-[#2563EB]" />
                    <Star className="w-3.5 h-3.5 fill-[#2563EB]" />
                    <Star className="w-3.5 h-3.5 fill-[#2563EB]" />
                    <Star className="w-3.5 h-3.5 fill-[#2563EB]" />
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "TransGlobe-Logistics reduced our transatlantic container transit times by 4 full days while cutting customs clearance delays to zero. Their digital command center gives our executive team full visibility."
                  </p>
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-xs text-white">
                      MV
                    </div>
                    <div>
                      <strong className="text-xs text-white block">Marcus Vance</strong>
                      <span className="text-[11px] text-slate-400 block">VP Global Logistics &bull; Apex Heavy Industries</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Static Request Form (7 Cols) */}
            <div className="lg:col-span-7">
              <StaticQuoteForm />
            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. 24/7 GLOBAL CUSTOMER SUPPORT & LIVE DISPATCH SECTION              */}
      {/* ===================================================================== */}
      <GlobalSupportSection />

    </div>
  );
}
