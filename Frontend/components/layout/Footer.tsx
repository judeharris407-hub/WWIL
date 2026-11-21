import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-wwil-navy-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Column 1: Company Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6200] to-[#E05600] flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="font-display font-extrabold text-xl text-white">W</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-wider text-white">WWIL</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                  Worldwide International Logistics
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering global commerce with precision multimodal freight forwarding, intermodal rail logistics, intelligent warehousing, and verified real-time satellite telemetry across 180+ countries.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#FF6200]" />
              <span>Licensed Federal Maritime NVOCC &amp; IATA Agent</span>
            </div>
          </div>

          {/* Column 2: Core Services */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Freight Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/services#air-ocean" className="hover:text-[#FF6200] transition-colors">
                  Global Ocean Freight (FCL / LCL)
                </Link>
              </li>
              <li>
                <Link href="/services#air-ocean" className="hover:text-[#FF6200] transition-colors">
                  Expedited Air Cargo Charters
                </Link>
              </li>
              <li>
                <Link href="/services#ground" className="hover:text-[#FF6200] transition-colors">
                  Intermodal Ground &amp; Rail Freight
                </Link>
              </li>
              <li>
                <Link href="/services#warehousing" className="hover:text-[#FF6200] transition-colors">
                  Intelligent Bonded Warehousing
                </Link>
              </li>
              <li>
                <Link href="/services#customs" className="hover:text-[#FF6200] transition-colors">
                  Single-Window Customs Clearance
                </Link>
              </li>
              <li>
                <Link href="/services#express" className="hover:text-[#FF6200] transition-colors">
                  Time-Critical Express Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Site Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-[#FF6200] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#FF6200] transition-colors">Track Cargo Shipment</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#FF6200] transition-colors">Multimodal Services</Link>
              </li>
              <li>
                <Link href="/request-quote" className="hover:text-[#FF6200] transition-colors">Request a Freight Quote</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#FF6200] transition-colors">About WWIL</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FF6200] transition-colors">Contact Global Hubs</Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-[#FF6200] transition-colors">Staff Admin Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Contact Details */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Direct Contact</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6200] shrink-0 mt-0.5" />
                <span>World Trade Logistics Center, Port Boulevard, Suite 1200</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF6200] shrink-0" />
                <a href="tel:+18008459945" className="hover:text-white transition-colors font-medium">
                  +1 (800) 845-WWIL (9945)
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF6200] shrink-0" />
                <a href="mailto:operations@wwil-logistics.com" className="hover:text-white transition-colors">
                  operations@wwil-logistics.com
                </a>
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>24/7 Global Central Terminal Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; 2026 Worldwide International Logistics (WWIL) Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/about" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-slate-300 transition-colors">Terms of Carriage</Link>
            <Link href="/about" className="hover:text-slate-300 transition-colors">Bill of Lading Provisions</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Security Compliance</Link>
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Network Telemetry: Operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
