import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, Clock, Award, CheckCircle2 } from 'lucide-react';
import StaticQuoteForm from '@/components/quote/StaticQuoteForm';

export const metadata: Metadata = {
  title: 'Request a Guaranteed Freight Quote | WWIL Logistics',
  description: 'Obtain instant enterprise freight tariffs for global air cargo charters, ocean FCL/LCL liner shipping, and overland ground logistics.',
};

export default function RequestQuotePage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF6200] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Enterprise Rate Request
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
            Guaranteed Freight Allocation &amp; <span className="text-[#FF6200]">Fixed Tariffs</span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Eliminate unexpected demurrage and unpredictable spot surcharges. Receive official contractual tariff matrices backed by priority carrier space.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6200] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">15-Minute Turnaround</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Direct integration with maritime liners and cargo airlines ensures immediate space locking.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">All-Risk Cargo Protection</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Full marine insurance coverage underwritten by Lloyd's syndicates protecting all freight classes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">14-Day Rate Lock Guarantee</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Quoted rates remain firm for two full weeks with no peak-season volatility additions.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <StaticQuoteForm />
        </div>

      </div>
    </div>
  );
}
