'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crosshair, Barcode, Truck, X } from 'lucide-react';

interface TrackingSearchCardProps {
  initialCode?: string;
}

export default function TrackingSearchCard({ initialCode = 'TRK-2024-001234' }: TrackingSearchCardProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingNumber.trim().toUpperCase();
    if (!code) return;

    setIsSubmitting(true);
    router.push(`/track-order?id=${encodeURIComponent(code)}`);
  };

  const handleQuickFill = (code: string) => {
    setTrackingNumber(code);
    router.push(`/track-order?id=${encodeURIComponent(code)}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100 text-slate-800 relative">
      {/* Card Header: Circular orange icon badge with location icon next to title and subtext */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shrink-0">
          <Crosshair className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">Track Your Package</h2>
          <p className="text-xs text-slate-500 mt-0.5">Enter your tracking number below</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="tracking-code-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Shipment Tracking Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Barcode className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="tracking-code-input"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TRK-2024-001234"
              required
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 font-mono text-sm uppercase focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
            />
            {trackingNumber && (
              <button
                type="button"
                onClick={() => setTrackingNumber('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Demo Pill Fillers */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-400 text-[11px] font-medium">Quick Demo:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('TRK-2024-001234')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
          >
            TRK-2024-001234
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('AWB-78942-FRA')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
          >
            AWB-78942-FRA
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('MSKU-982341-0')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
          >
            MSKU-982341-0
          </button>
        </div>

        {/* Full-width vibrant orange button (TRACK ORDER) featuring truck icon */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
        >
          <Truck className="w-5 h-5" />
          <span>{isSubmitting ? 'ROUTING TO TELEMETRY...' : 'TRACK ORDER'}</span>
        </button>
      </form>

      {/* Card Footer: Muted "TRUSTED BY LEADING COMPANIES" label with grayed partner logos */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-3">
          TRUSTED BY LEADING COMPANIES
        </span>
        <div className="flex items-center justify-between gap-4 grayscale opacity-40 px-2 select-none">
          <span className="font-display font-black text-sm tracking-wider text-slate-600">MAERSK</span>
          <span className="font-display font-black text-sm tracking-wider text-slate-600">HAPAG-LLOYD</span>
          <span className="font-display font-black text-sm tracking-wider text-slate-600">LUFTHANSA</span>
          <span className="font-display font-black text-sm tracking-wider text-slate-600">CMA CGM</span>
        </div>
      </div>
    </div>
  );
}
