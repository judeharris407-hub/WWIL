'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

// Official WhatsApp Brand SVG
function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
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

// Inner Widget Component that accesses useSearchParams safely inside Suspense
function LiveSupportWidgetsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRoute = pathname ? pathname.startsWith('/admin') : false;

  // 1. Environment Keys & Fallbacks
  const smartsuppKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY?.trim() || '';
  const rawWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '13479214785';
  // Digits only international format: e.g. (347) 921-4785 -> 13479214785
  const whatsappNumber = rawWhatsApp.replace(/\D/g, '') || '13479214785';

  // 2. Smartsupp Initialization & Visibility Management
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (smartsuppKey) {
      (window as any)._smartsupp = (window as any)._smartsupp || {};
      (window as any)._smartsupp.key = smartsuppKey;
    }

    // Hide or show Smartsupp dynamically when navigating between admin & customer routes
    if ((window as any).smartsupp) {
      try {
        if (isAdminRoute) {
          (window as any).smartsupp('chat:hide');
        } else {
          (window as any).smartsupp('chat:show');
        }
      } catch (err) {
        // Silently catch if chat API is not fully loaded yet
      }
    }
  }, [smartsuppKey, isAdminRoute]);

  // 3. Contextual WhatsApp Pre-filled Message
  const trackingId = searchParams ? searchParams.get('id') : null;
  const isTrackingPage = pathname ? pathname.includes('/track-order') : false;

  let prefilledMessage = 'Hello WWIL Operations Desk, I would like to inquire about international freight tariffs and cargo space allocation.';
  if (isTrackingPage && trackingId) {
    prefilledMessage = `Hello WWIL Support, I am tracking consignment ${trackingId.trim().toUpperCase()} on the live telemetry portal. Could you please provide an operational status update?`;
  } else if (isTrackingPage) {
    prefilledMessage = 'Hello WWIL Support, I have a question regarding live consignment tracking and milestone delivery.';
  }

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  // Do not render floating widgets on Admin dashboard/login pages
  if (isAdminRoute) {
    return (
      <>
        {/* CSS Scrim to prevent Smartsupp iframe from covering admin controls */}
        <style jsx global>{`
          #smartsupp-widget-container,
          #chat-application,
          iframe[title*="Smartsupp"],
          iframe[title*="smartsupp"] {
            display: none !important;
            visibility: hidden !important;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      {/* =================================================================== */}
      {/* 1. SMARTSUPP LIVE CHAT LOADER                                       */}
      {/* =================================================================== */}
      {smartsuppKey && (
        <>
          <Script
            id="smartsupp-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window._smartsupp = window._smartsupp || {};
                window._smartsupp.key = '${smartsuppKey}';
              `,
            }}
          />
          <Script
            id="smartsupp-loader"
            strategy="lazyOnload"
            src="https://www.smartsuppchat.com/loader.js?"
          />
        </>
      )}

      {/* =================================================================== */}
      {/* 2. FLOATING WHATSAPP SUPPORT BUTTON (BOTTOM-LEFT, NO OVERLAP)       */}
      {/* =================================================================== */}
      {mounted && (
        <aside
          aria-label="Live WhatsApp Support"
          className="fixed bottom-5 left-5 z-50 select-none group"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with WWIL Operations on WhatsApp"
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-2xl shadow-emerald-950/30 hover:shadow-emerald-950/40 border border-white/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
          >
            {/* WhatsApp Icon with Pulse Ping */}
            <div className="relative flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-6 h-6 fill-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200 border-2 border-[#25D366]"></span>
              </span>
            </div>

            {/* Label (Always visible or neatly responsive) */}
            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xs leading-none tracking-tight">
                  Chat on WhatsApp
                </span>
              </div>
              <span className="text-[10px] text-white/90 font-medium leading-tight mt-0.5">
                {isTrackingPage && trackingId ? `Consignment: ${trackingId}` : '24/7 Operations Desk'}
              </span>
            </div>
          </a>
        </aside>
      )}
    </>
  );
}

// Export default with Suspense boundary for Next.js App Router static compilation
export default function LiveSupportWidgets() {
  return (
    <Suspense fallback={null}>
      <LiveSupportWidgetsContent />
    </Suspense>
  );
}
