/**
 * WWIL Enterprise API Service Layer
 * Connects the Next.js Frontend to the PostgreSQL Backend engine
 * with graceful offline fallback to local mock data.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface DatabaseParcel {
  id: number;
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  origin_address: string;
  destination_address: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  current_lat: number;
  current_lng: number;
  transport_mode: 'Air Freight' | 'Ocean Freight' | 'Ground Logistics' | string;
  status: 'Order Received' | 'In Transit' | 'On Hold' | 'Out for Delivery' | 'Delivered' | string;
  estimated_delivery?: string;
  created_at?: string;
  updated_at?: string;
  history?: Array<{
    id: number;
    parcel_id: number;
    status: string;
    location_name: string;
    latitude: number;
    longitude: number;
    notes: string;
    timestamp: string;
  }>;
}

export interface DatabaseQuote {
  reference_number?: string;
  freight_type: string;
  departure_country: string;
  recipient_country: string;
  weight?: string;
  full_name: string;
  email: string;
  phone?: string;
}

/**
 * Check if the backend API server is online
 */
export async function checkBackendHealth(): Promise<{ online: boolean; databaseConnected: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(2500) });
    if (!res.ok) return { online: false, databaseConnected: false };
    const data = await res.json();
    return {
      online: true,
      databaseConnected: data.database?.connected || false,
    };
  } catch (error) {
    return { online: false, databaseConnected: false };
  }
}

/**
 * Fetch parcel record by tracking number from PostgreSQL backend
 */
export async function fetchParcelFromDb(trackingNumber: string): Promise<DatabaseParcel | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/${encodeURIComponent(trackingNumber)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.parcel || null;
  } catch (error) {
    console.warn('[API Client] Backend unreachable, falling back to local dataset:', error);
    return null;
  }
}

/**
 * Submit inbound quotation request to PostgreSQL quotes table
 */
export async function submitQuoteToDb(quote: DatabaseQuote): Promise<{ success: boolean; reference?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quote),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Submission failed' };
    }

    return {
      success: true,
      reference: data.quote?.reference_number,
    };
  } catch (error) {
    console.warn('[API Client] Backend quote submission failed, generating local reference:', error);
    // Graceful offline simulated reference
    const offlineRef = `WWIL-Q-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      reference: offlineRef,
    };
  }
}
