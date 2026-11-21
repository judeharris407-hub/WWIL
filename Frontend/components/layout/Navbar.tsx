'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Phone, 
  Mail, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Menu, 
  X,
  Lock
} from 'lucide-react';
import { getAdminSession } from '@/lib/auth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => {
      const session = getAdminSession();
      setIsAdminLoggedIn(!!session);
    };
    check();
    window.addEventListener('wwil:auth-changed', check);
    window.addEventListener('storage', check);
    return () => {
      window.removeEventListener('wwil:auth-changed', check);
      window.removeEventListener('storage', check);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Services', href: '/services' },
    { name: 'Request Quote', href: '/request-quote' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { 
      name: isAdminLoggedIn ? 'Admin Dashboard' : 'Admin Portal', 
      href: isAdminLoggedIn ? '/admin/dashboard' : '/admin/login',
      isAdmin: true 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200 shadow-md">
      {/* Top Announcement Bar (Deep Slate #080D1A / #0F172A, Clean, NO Social Clutter) */}
      <div className="bg-wwil-navy-950 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Operations Contact */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-400 tracking-wide">24/7 Global Dispatch:</span>
              <a 
                href="tel:+18008459945" 
                className="text-white hover:text-[#FF6200] transition-colors font-semibold flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-[#FF6200]" />
                +1 (800) 845-WWIL
              </a>
            </div>
            <div className="hidden md:flex items-center gap-2 border-l border-slate-700 pl-4">
              <Mail className="w-3 h-3 text-[#FF6200]" />
              <a 
                href="mailto:operations@wwil-logistics.com" 
                className="hover:text-white transition-colors"
              >
                operations@wwil-logistics.com
              </a>
            </div>
          </div>

          {/* Compliance & Regulatory Badges */}
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden lg:inline-flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-0.5 rounded text-[11px] border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF6200]" />
              ISO 9001:2015 &amp; IATA Certified Operator
            </span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="font-medium text-[11px]">180+ Active Corridors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Deep Corporate Blue #0F172A) */}
      <nav className="bg-wwil-navy-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6200] to-[#E05600] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="font-display font-extrabold text-2xl tracking-tighter text-white">W</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-2xl tracking-wider text-white">WWIL</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#FF6200]"></span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                  Worldwide International Logistics
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                      active
                        ? 'text-[#FF6200] bg-slate-800/80'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.isAdmin && (
                      isAdminLoggedIn ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Admin Session Active"></span>
                      ) : (
                        <Lock className="w-3 h-3 text-slate-400" />
                      )
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Action CTA & Mobile Hamburger */}
            <div className="flex items-center gap-4">
              <Link
                href="/request-quote"
                className="hidden sm:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-[#FF6200] hover:bg-[#E05600] text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF6200]"
              >
                <span>Request Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6200]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    active
                      ? 'text-[#FF6200] bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.isAdmin && (
                    isAdminLoggedIn ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )
                  )}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-800">
              <Link
                href="/request-quote"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FF6200] hover:bg-[#E05600] text-white font-bold text-base shadow-md"
              >
                <span>Request Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
