'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquareText, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  Headphones, 
  Clock, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

// Official WhatsApp Brand SVG
function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="0"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.37C9.37 7.37 9.11 7.43 8.89 7.67C8.68 7.9 8.07 8.47 8.07 9.63C8.07 10.79 8.91 11.91 9.03 12.07C9.15 12.23 10.67 14.58 13 15.58C13.56 15.82 13.99 15.96 14.33 16.07C14.89 16.25 15.4 16.22 15.81 16.16C16.26 16.09 17.2 15.59 17.4 15.04C17.59 14.48 17.59 14.01 17.53 13.91C17.48 13.81 17.32 13.75 17.06 13.62C16.8 13.49 15.53 12.86 15.3 12.77C15.06 12.68 14.89 12.64 14.72 12.89C14.55 13.14 14.07 13.72 13.92 13.88C13.78 14.05 13.63 14.07 13.37 13.94C13.11 13.81 12.28 13.54 11.3 12.67C10.54 11.99 10.02 11.15 9.87 10.89C9.72 10.63 9.85 10.5 9.98 10.37C10.1 10.25 10.24 10.07 10.37 9.92C10.5 9.77 10.55 9.66 10.63 9.49C10.72 9.32 10.67 9.18 10.6 9.05C10.54 8.92 10.02 7.64 9.8 7.13C9.59 6.63 9.38 6.69 9.21 6.69L8.89 6.69C8.71 6.69 8.44 6.75 8.23 6.99" />
    </svg>
  );
}

export default function GlobalSupportSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  // 1. WhatsApp Configuration
  const rawWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '13479214785';
  const whatsappNumber = rawWhatsApp.replace(/\D/g, '') || '13479214785';
  const whatsappMessage = 'Hello TransGlobe-Logistics Support, I would like to connect with a live operations coordinator regarding international freight services.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // 2. Smartsupp Live Chat Trigger
  const handleOpenSmartsupp = () => {
    if (typeof window !== 'undefined' && (window as any).smartsupp) {
      try {
        (window as any).smartsupp('chat:show');
        (window as any).smartsupp('chat:open');
        return;
      } catch (err) {
        console.warn('Smartsupp opener triggered error:', err);
      }
    }

    // Graceful fallback: If Smartsupp is not yet loaded, redirect to WhatsApp or contact desk
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // 3. Copy Email to Clipboard
  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('operations@transglobe-logistics.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    }
  };

  return (
    <section className="relative bg-wwil-navy-950 text-white py-16 lg:py-24 overflow-hidden border-t border-slate-800">
      
      {/* Background Logistics Photography with Balanced Directional Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/warehouse2.avif"
          alt="TransGlobe-Logistics Operations Command Center"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        {/* Balanced Dark Slate Overlay (bg-gradient-to-r from-slate-900/85 via-slate-900/65 to-slate-900/50) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/50"></div>
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-[#2563EB]/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Block */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold tracking-wider uppercase text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] beacon-pulse"></span>
            <span>24/7 Global Customer Support &amp; Live Dispatch</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
            Direct Line to Our <span className="text-[#2563EB]">Logistics Controllers</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            No endless robot queues. Connect in real time with certified freight forwarders and licensed customs specialists across all international trade zones.
          </p>
        </div>

        {/* 3 Active Support Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Card 1: Live Chat Support (Smartsupp) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquareText className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online Now
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">Live Chat Support</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Real-time Telemetry &amp; Consignment Queries</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chat directly with our central dispatch room for instant status confirmation, rerouting requests, and customs hold resolutions.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={handleOpenSmartsupp}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Headphones className="w-4 h-4" />
                <span>Start Live Chat</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Average pickup: &lt; 30 seconds</span>
              </div>
            </div>
          </div>

          {/* Card 2: WhatsApp Instant Desk */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-6 h-6 fill-[#25D366]" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Channel
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">WhatsApp Instant Desk</h3>
                <p className="text-xs font-mono font-semibold text-emerald-600 mt-0.5">+1 (347) 921-4785</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect via mobile or desktop WhatsApp. Transmit bills of lading, packing manifests, and urgent cargo status requests with zero latency.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>End-to-end encrypted dispatch line</span>
              </div>
            </div>
          </div>

          {/* Card 3: Direct Operations Email */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-[11px] font-bold">
                  &lt; 15 Min SLA
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">Direct Operations Email</h3>
                <p className="text-xs font-mono font-semibold text-slate-600 mt-0.5 truncate">
                  operations@transglobe-logistics.com
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Submit enterprise rate requests, customs declaration documents, or commercial cargo claims directly to our central dispatch queue.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="mailto:operations@transglobe-logistics.com?subject=TransGlobe-Logistics%20Operations%20Inquiry"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Mail</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200"
                  title="Copy email address to clipboard"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>24/7 Dedicated Freight Dispatchers</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Assurance Strip */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-medium">All central terminals &amp; port offices active worldwide</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-white transition-colors underline underline-offset-4">
              View Regional Office Addresses &rarr;
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
}
