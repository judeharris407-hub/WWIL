/**
 * WWIL Enterprise Admin Authentication Service
 * Manages admin session state, credentials verification, and route security.
 */

import { getApiBaseUrl } from '@/lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  terminalCode: string;
  avatarInitials: string;
  token: string;
  loginTime: string;
}

const AUTH_STORAGE_KEY = 'wwil_admin_session_v1';
const AUTH_COOKIE_NAME = 'wwil_admin_token';

// Authorized corporate credentials
export const CORPORATE_ADMIN_CREDENTIALS = {
  email: 'transglobel9@gmail.com',
  password: 'Kenfack123@',
};

/**
 * Check if the user is currently authenticated
 */
export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!sessionRaw) return null;
    const session: AdminUser = JSON.parse(sessionRaw);

    // Basic validity check
    if (!session.token || !session.email) {
      logoutAdmin();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading admin session:', error);
    return null;
  }
}

/**
 * Authenticate admin with email and password via backend API with offline fallback
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const normalizedEmail = email.trim().toLowerCase();
  const apiUrl = getApiBaseUrl();

  try {
    // 1. Attempt authentication against the Node.js Express backend API
    const response = await fetch(`${apiUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const serverUser: AdminUser = {
        id: String(data.user?.id || 'ADMIN-8842'),
        name: data.user?.name || 'Capt. Marcus Vance',
        email: data.user?.email || normalizedEmail,
        role: data.user?.role || 'Senior Operations Director',
        department: data.user?.department || 'Global Multimodal Dispatch',
        terminalCode: data.user?.terminalCode || 'EUR-USA-CENTRAL',
        avatarInitials: data.user?.avatarInitials || 'MV',
        token: data.token || `WWIL-AUTH-TOKEN-${Date.now()}`,
        loginTime: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(serverUser));
        document.cookie = `${AUTH_COOKIE_NAME}=${serverUser.token}; path=/; max-age=86400; SameSite=Lax`;
        window.dispatchEvent(new CustomEvent('wwil:auth-changed', { detail: serverUser }));
      }

      return {
        success: true,
        user: serverUser,
      };
    } else if (response.status === 401 || response.status === 400) {
      return {
        success: false,
        error: data.error || 'Invalid credentials. Please verify your email and operations security key.',
      };
    }
  } catch (networkError) {
    console.warn('[Admin Auth] Backend server unreachable, attempting authorized local verification:', networkError);
  }

  // 2. Offline fallback verification for corporate admin clearance if API is unreachable
  const isValid =
    normalizedEmail === CORPORATE_ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === CORPORATE_ADMIN_CREDENTIALS.password;

  if (!isValid) {
    return {
      success: false,
      error: 'Invalid credentials. Please verify your corporate email and administrator password.',
    };
  }

  const user: AdminUser = {
    id: 'ADMIN-CORP-01',
    name: 'Corporate Operations Director',
    email: normalizedEmail,
    role: 'Operations Director',
    department: 'Global Multimodal Dispatch',
    terminalCode: 'TGL-CENTRAL',
    avatarInitials: 'TG',
    token: `TGL-AUTH-TOKEN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    loginTime: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    document.cookie = `${AUTH_COOKIE_NAME}=${user.token}; path=/; max-age=86400; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('wwil:auth-changed', { detail: user }));
  }

  return {
    success: true,
    user,
  };
}

/**
 * Log out and clear session state
 */
export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent('wwil:auth-changed', { detail: null }));
}
