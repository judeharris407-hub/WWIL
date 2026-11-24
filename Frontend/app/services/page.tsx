import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Plane, 
  Ship, 
  Truck, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  PackageCheck, 
  Layers 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Multimodal Freight & Cargo Services | TransGlobe-Logistics',
  description: 'Explore TransGlobe-Logistics services: Ocean container shipping, air charters, continental trucking, bonded contract warehousing, and customs brokerage.',
};

export default function ServicesPage() {
  const services = [
    {
      id: 'air-ocean',
      title: 'Global Air & Ocean Freight Multimodal',
      category: 'Flagship Transcontinental Solution',
      icon: Ship,
      image: '/assets/ship1.avif',
      description: 'TransGlobe-Logistics coordinates direct vessel space contracts with top maritime alliances and holds reserved allocations on premier air cargo airlines. Whether shipping 40ft High Cube containers across Transpacific corridors or chartering Boeing 777F freighters for high-value tech components, we provide fixed schedules and zero-delay port handling.',
      capabilities: [
        'Full Container Load (FCL) and Less Than Container Load (LCL) consolidation',
        'Direct charter flights and Next-Flight-Out (NFO) air allocations',
        'Temperature-controlled active reefer containers (-25°C to +25°C)',
        'Electronic Bill of Lading (e-BL) and Airway Bill (e-AWB) digital integration',
        'Port-to-Port, Port-to-Door, and Door-to-Door terms under Incoterms 2020',
      ],
      specs: [
        { label: 'Container Types', value: '20ft, 40ft Standard, 40ft HC, Reefer, Flat Rack' },
        { label: 'Charter Lift', value: 'Up to 120 Metric Tons per charter flight' },
        { label: 'Carrier Alliances', value: '2M, Ocean Alliance, THE Alliance' },
      ],
    },
    {
      id: 'ground',
      title: 'Ground Fleet & Intermodal Rail Logistics',
      category: 'Continental Overland Transportation',
      icon: Truck,
      image: '/assets/Truck1.avif',
      description: 'Our ground logistics network connects seaports, inland manufacturing zones, and metropolitan consumption centers with a modern GPS-telemetry tracked fleet of heavy-haul semi-trucks, dry vans, and electrified regional delivery vehicles.',
      capabilities: [
        'Full Truckload (FTL) and Less Than Truckload (LTL) services',
        'Intermodal double-stack rail corridors for high-efficiency bulk freight',
        'Live satellite GPS telemetry and geofencing deviation alerts',
        'Cross-border bonded trucking through USMCA and European customs zones',
      ],
      specs: [
        { label: 'Active Fleet', value: '1,400+ Semi-trucks & Intermodal Chassis' },
        { label: 'Payload Range', value: 'Up to 44,000 lbs (20,000 kg) per standard unit' },
        { label: 'Safety Rating', value: 'DOT Satisfactory & ISO 39001 Road Safety' },
      ],
    },
    {
      id: 'warehousing',
      title: 'Bonded Warehousing & Distribution',
      category: 'Contract 3PL & Bonded Storage',
      icon: Building2,
      image: '/assets/warehouse1.avif',
      description: 'TransGlobe-Logistics operates over 3.2 million square meters of strategically positioned fulfillment and bonded storage hubs at key airport and seaport perimeters worldwide. Equipped with high-velocity sortation, climate control, and integrated WMS inventory platforms.',
      capabilities: [
        'Customs Bonded warehousing with duty deferment and tax relief benefits',
        'High-velocity pick, pack, and conveyor sortation systems',
        'Real-time RFID and barcode inventory telematics accessible via enterprise EDI',
        'Clean-room pharma and hazardous materials (HAZMAT) certified storage',
      ],
      specs: [
        { label: 'Global Capacity', value: '3.2M+ sq. meters across 48 global hubs' },
        { label: 'Inventory Accuracy', value: '99.98% via Barcode & RFID Verification' },
        { label: 'Security Class', value: 'TAPA Class A & 24/7 CCTV Monitored' },
      ],
    },
    {
      id: 'customs',
      title: 'Customs Clearance & Regulatory Brokerage',
      category: 'Single-Window Border Compliance',
      icon: ShieldCheck,
      image: '/assets/news-image4.jpg',
      description: 'Eliminate border delays and unexpected penalties. Our licensed in-house customs brokers navigate complex global import/export tariffs, dual-use export controls, and free trade agreement certifications across all five continents.',
      capabilities: [
        'Direct EDI integration with US CBP (ACE), EU ATLAS, and China Single Window',
        'Harmonized Tariff Schedule (HTS) classification and pre-entry audit',
        'Duty drawback programs and FTA preferential rate maximization',
        'AEO-F and C-TPAT Tier 3 validated fast-lane processing',
      ],
      specs: [
        { label: 'Clearance Speed', value: '< 2 hours average digital pre-clearance' },
        { label: 'Broker Team', value: '350+ Licensed Customs Brokers Worldwide' },
        { label: 'Compliance Index', value: '99.85% zero-penalty audit pass rate' },
      ],
    },
    {
      id: 'express',
      title: 'Express Delivery & Time-Critical Courier',
      category: 'Dedicated Last-Mile Dispatch',
      icon: PackageCheck,
      image: '/assets/van1.avif',
      description: 'When downtime is not an option. For AOG (Aircraft on Ground) replacement parts, critical automotive components, and emergency medical shipments, TransGlobe-Logistics provides dedicated time-critical couriers and chartered van routing.',
      capabilities: [
        'On-Board Courier (OBC) hand-carry for mission-critical micro-freight',
        'Next-Flight-Out (NFO) air courier dispatch within 45 minutes',
        'Dedicated sprinter vans with two-driver non-stop transit',
        'Direct electronic proof of delivery (POD) with photo and digital signature',
      ],
      specs: [
        { label: 'Dispatch Window', value: 'Under 30 minutes from booking confirmation' },
        { label: 'Coverage', value: 'Direct delivery to 180+ global metropolitan hubs' },
        { label: 'Live Telemetry', value: 'Real-time ping updates every 60 seconds' },
      ],
    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* ===================================================================== */}
      {/* HERO BANNER (Dark Corporate Slate/Navy with Logistics Photography)    */}
      {/* ===================================================================== */}
      <section className="relative bg-slate-900 text-white py-16 lg:py-24 overflow-hidden border-b border-slate-800">
        <img
          src="/assets/banner2.jpg"
          alt="TransGlobe-Logistics Multimodal Logistics Operations"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Semi-transparent dark corporate slate/navy overlay (bg-slate-900/80) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/35"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Multimodal Capabilities
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Integrated Global <span className="text-[#2563EB]">Supply Chain Services</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            From single-pallet high-priority air freight to multi-thousand TEU maritime charters and bonded distribution, TransGlobe-Logistics delivers end-to-end reliability.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">

        {/* Detailed Service Sections */}
        <div className="space-y-12">
          {services.map((svc, index) => {
            const Icon = svc.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={svc.id}
                id={svc.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm scroll-mt-24"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 items-stretch ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Image Column (5 Cols) */}
                  <div className={`lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-slate-900 ${isReversed ? 'lg:order-2' : ''}`}>
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="absolute inset-0 w-full h-full object-cover img-editorial-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-[#2563EB] text-white text-xs font-bold tracking-wider uppercase shadow-md">
                        {svc.category}
                      </span>
                    </div>
                  </div>

                  {/* Details Column (7 Cols) */}
                  <div className={`lg:col-span-7 p-6 sm:p-10 space-y-6 ${isReversed ? 'lg:order-1' : ''}`}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#2563EB]">
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">{svc.category}</span>
                      </div>
                      <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                        {svc.title}
                      </h2>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {svc.description}
                    </p>

                    {/* Capabilities Checklist */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                        Operational Features &amp; Deliverables
                      </h3>
                      <div className="space-y-2">
                        {svc.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      {svc.specs.map((spec, i) => (
                        <div key={i}>
                          <span className="text-slate-400 text-[11px] block">{spec.label}</span>
                          <strong className="text-xs sm:text-sm text-slate-900 block truncate">{spec.value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        href="/request-quote"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md transition-colors"
                      >
                        <span>Book Service</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <span className="text-xs text-slate-400">Incoterms 2020 Compliant</span>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
