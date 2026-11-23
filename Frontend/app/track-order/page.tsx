import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import TrackingDashboard from '@/components/tracking/TrackingDashboard';

export const metadata: Metadata = {
  title: 'Live Cargo Telemetry & Tracking | TransGlobe-Logistics',
  description: 'Monitor real-time GPS coordinates, customs clearance status, and milestone progression for international air, ocean, and ground freight consignments.',
};

interface TrackOrderPageProps {
  searchParams: { id?: string };
}

export default function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const trackingId = searchParams?.id || 'TGL-2026-001234';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-600">Connecting to TransGlobe-Logistics Global Telemetry Gateway...</p>
          </div>
        </div>
      }
    >
      <TrackingDashboard initialTrackingId={trackingId} />
    </Suspense>
  );
}
