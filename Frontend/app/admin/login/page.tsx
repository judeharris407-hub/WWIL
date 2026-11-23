'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Sparkles 
} from 'lucide-react';
import { loginAdmin, getAdminSession, DEMO_ADMIN_CREDENTIALS } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginAdmin(email, password);
      setIsLoading(false);

      if (result.success) {
        router.push('/admin/dashboard');
      } else {
        setError(result.error || 'Authentication rejected. Verify credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Network error during administrator authentication.');
    }
  };

  const handleQuickDemoFill = () => {
    setEmail(DEMO_ADMIN_CREDENTIALS.email);
    setPassword(DEMO_ADMIN_CREDENTIALS.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-wwil-navy-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-grid-pattern">
      
      {/* Logistics Photography Background & Dark Corporate Translucent Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/banner1.jpg"
          alt="TransGlobe-Logistics Command Center"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        {/* Semi-transparent dark corporate slate/navy overlay (bg-slate-900/80) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80"></div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        {/* Brand Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-xl text-white">TGL</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-2xl tracking-wider text-white">TransGlobe</span>
              <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block -mt-1">
              TransGlobe-Logistics
            </span>
          </div>
        </Link>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#2563EB] mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Enterprise Dispatch Portal
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-2 tracking-tight">
            Logistics Controller Access
          </h1>
          <p className="text-xs text-slate-400">
            Sign in with authorized corporate credentials to manage global consignments
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Fill Helper Pill */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200 block text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2563EB]" />
                Demo Credentials Available
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                admin@transglobe-logistics.com
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3 py-1.5 rounded-lg bg-[#2563EB]/20 hover:bg-[#2563EB]/30 text-[#2563EB] font-bold text-[11px] transition-colors border border-[#2563EB]/30"
            >
              1-Click Fill
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-[#2563EB]" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="controller@transglobe-logistics.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Operations Security Key
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4 text-[#2563EB]" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Remember terminal workstation</span>
              </label>

              <span className="text-[11px] text-slate-400">256-bit TLS Encrypted</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 focus:ring-offset-slate-900 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate &amp; Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-[#2563EB] transition-colors inline-flex items-center gap-1.5"
            >
              <span>Return to Public Homepage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Security Notice */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          Authorized personnel only. Access attempts are audited under ISO 27001 compliance protocols.
        </p>
      </div>

    </div>
  );
}
