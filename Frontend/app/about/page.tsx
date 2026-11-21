import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Globe, 
  Award, 
  Leaf, 
  Headphones, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Worldwide International Logistics (WWIL) | Corporate Profile',
  description: 'Learn about WWIL: Our mission, global port infrastructure, international supply chain certifications, and carbon-reduction initiatives.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF6200] text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            Corporate Overview
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
            Engineering the Backbone of <span className="text-[#FF6200]">Global Commerce</span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Founded with the belief that international logistics should operate with mathematical precision, WWIL delivers high-capacity physical freight networks paired with real-time telemetry.
          </p>
        </div>

        {/* Narrative & Visual Grid */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                Over Two Decades of Multimodal Excellence
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Worldwide International Logistics (WWIL) has evolved from an inter-port maritime forwarder into a comprehensive multimodal supply chain operator. Today, we coordinate freight across 180+ countries, managing over 2.4 million metric tons and ocean container TEUs annually.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                By investing in owned gateway infrastructure, licensed in-house customs brokerage teams, and proprietary satellite tracking integrations, we eliminate transit blackouts and ensure contractually guaranteed space allocations.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <strong className="font-display font-bold text-2xl text-slate-900 block">180+</strong>
                  <span className="text-xs text-slate-500">Countries Served</span>
                </div>
                <div>
                  <strong className="font-display font-bold text-2xl text-[#FF6200] block">48</strong>
                  <span className="text-xs text-slate-500">Global Hub Terminals</span>
                </div>
                <div>
                  <strong className="font-display font-bold text-2xl text-slate-900 block">99.4%</strong>
                  <span className="text-xs text-slate-500">SLA Adherence</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="/assets/news2.jpg"
                  alt="Worldwide International Logistics Port Terminal Operations"
                  className="w-full h-80 sm:h-96 object-cover img-editorial-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
                  <span className="text-xs text-[#FF6200] font-bold uppercase tracking-wider block mb-1">
                    Direct Terminal Presence
                  </span>
                  <p className="text-xs text-slate-700">
                    Dedicated port offices in Rotterdam, Singapore, Frankfurt, Newark, Shanghai, and Dubai.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Regulatory Accreditation & Compliance Standards */}
        <div className="bg-wwil-navy-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold text-[#FF6200] tracking-wider">
              Governance &amp; Accreditation
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Strict Adherence to International Standards
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Validated by global regulatory frameworks ensuring security, safety, and single-window compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#FF6200]" />
              <h4 className="font-bold text-sm text-white">ISO 9001:2015 Certified</h4>
              <p className="text-xs text-slate-400">
                Audited quality management across all multimodal booking and documentation procedures.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-2">
              <Award className="w-8 h-8 text-[#FF6200]" />
              <h4 className="font-bold text-sm text-white">IATA Cargo Agent</h4>
              <p className="text-xs text-slate-400">
                Direct ticketing and airway bill authorization on all primary international airline alliances.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-2">
              <Globe className="w-8 h-8 text-[#FF6200]" />
              <h4 className="font-bold text-sm text-white">FIATA &amp; FMC Licensed</h4>
              <p className="text-xs text-slate-400">
                Licensed Non-Vessel Operating Common Carrier (NVOCC) with official bill of lading authority.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#FF6200]" />
              <h4 className="font-bold text-sm text-white">C-TPAT &amp; AEO Tier 3</h4>
              <p className="text-xs text-slate-400">
                Highest security tier validation ensuring priority green-lane customs inspection clearance.
              </p>
            </div>
          </div>
        </div>

        {/* Sustainability & Environmental Stewardship */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Green Logistics Initiative</span>
              <h3 className="font-display font-bold text-xl text-slate-900">Carbon-Optimized Multimodal Routing</h3>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
            As global trade volumes increase, WWIL is committed to reducing freight carbon intensity. By combining optimized slow-steaming maritime lanes, double-stack electric rail substitutions, and aerodynamic fleet aerodynamics, we assist enterprise clients in cutting scope-3 emissions by up to 28%.
          </p>
        </div>

      </div>
    </div>
  );
}
