'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Globe,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Enterprise Freight Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const regionalOffices = [
    {
      region: 'Americas Gateway Hub',
      city: 'Miami / Newark, United States',
      address: 'World Trade Logistics Center, Port Boulevard, Suite 1200, Miami FL 33132',
      phone: '+1 (800) 845-TGL',
      email: 'americas@transglobe-logistics.com',
    },
    {
      region: 'European Core Terminal',
      city: 'Rotterdam / Frankfurt',
      address: 'Gateway Maasvlakte II, Haven 9200, 3199 LK Rotterdam, Netherlands',
      phone: '+31 (10) 489-TGL',
      email: 'europe@transglobe-logistics.com',
    },
    {
      region: 'Asia-Pacific Core',
      city: 'Singapore / Shanghai',
      address: 'Jurong Port Logistics Complex, 15 Marina Way, Singapore 018977',
      phone: '+65 6842-TGL',
      email: 'apac@transglobe-logistics.com',
    },
    {
      region: 'Middle East & Africa Gateway',
      city: 'Dubai (JAFZA)',
      address: 'Jebel Ali Free Zone Authority, Building 14, Office 402, Dubai, UAE',
      phone: '+971 4 881-TGL',
      email: 'mena@transglobe-logistics.com',
    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* ===================================================================== */}
      {/* HERO BANNER (Dark Corporate Slate/Navy with Logistics Photography)    */}
      {/* ===================================================================== */}
      <section className="relative bg-slate-900 text-white py-16 lg:py-24 overflow-hidden border-b border-slate-800">
        <img
          src="/assets/warehouse2.avif"
          alt="TransGlobe-Logistics Operations Hub"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Semi-transparent dark corporate slate/navy overlay (bg-slate-900/80) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/35"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            Global Communications
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Contact TransGlobe-Logistics <span className="text-[#2563EB]">Operations</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Our 24/7 central dispatch centers and licensed customs controllers are available across all time zones to support your logistics pipeline.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        
        {/* Contact Information & Inquiry Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Support Hours & Highlights (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative overflow-hidden bg-wwil-navy-900 text-white rounded-2xl p-8 shadow-xl border border-slate-800 space-y-6">
              <img
                src="/assets/bgpic1.avif"
                alt="TransGlobe-Logistics Terminal Desk Operations"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Semi-transparent dark corporate slate/navy overlay (bg-slate-900/80) */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80"></div>

              <div className="relative z-10 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] block">
                  24/7 Central Emergency Operations
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white">
                  Global Operations Terminal Desk
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Direct telephone and operational access to licensed freight coordinators and dispatch planners worldwide without call queues.
                </p>

                <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Toll-Free Global Line</span>
                      <strong className="text-sm text-white">+1 (800) 845-TGL (845-8450)</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Operations Email</span>
                      <strong className="text-sm text-white">operations@transglobe-logistics.com</strong>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '13479214785').replace(/\D/g, '') || '13479214785'}?text=${encodeURIComponent('Hello TransGlobe-Logistics Support, I have an urgent freight inquiry.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group/wa transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5 group-hover/wa:scale-110 transition-transform" />
                    <div>
                      <span className="text-slate-400 block">WhatsApp Click-to-Chat</span>
                      <strong className="text-sm text-[#25D366] group-hover/wa:underline flex items-center gap-1.5">
                        +1 (347) 921-4785
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </strong>
                    </div>
                  </a>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Support Cadence</span>
                      <strong className="text-sm text-white">24 Hours / 7 Days / 365 Days</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-Action Card: Chat on WhatsApp */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Instant Messaging</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">Direct WhatsApp Dispatch</h3>
                <p className="text-xs text-slate-600">Connect directly with a dedicated freight controller for urgent queries.</p>
              </div>
              <a
                href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '13479214785').replace(/\D/g, '') || '13479214785'}?text=${encodeURIComponent('Hello TransGlobe-Logistics Operations Desk, I would like to inquire about international freight tariffs and cargo space allocation.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>All Regional Gateways Operational</span>
              </div>
              <p className="text-xs text-slate-500">
                Average telephone response under 20 seconds. EDI status messages synchronized continuously with port gateways.
              </p>
            </div>
          </div>

          {/* Right Side: Clean Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="pb-5 border-b border-slate-100 mb-6">
              <h3 className="font-display font-bold text-xl text-slate-900">Direct Inquiries &amp; Consultations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submit consignment questions to our route planning team</p>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-xl text-slate-900">Message Successfully Transmitted</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for contacting TransGlobe-Logistics Operations. A licensed logistics specialist will review your inquiry and follow up within 30 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 mb-1">
                      Business Email *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.rostova@enterprise.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 mb-1">
                    Inquiry Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Enterprise Freight Inquiry">Enterprise Freight Inquiry</option>
                    <option value="Air Charter Booking">Air Charter Booking</option>
                    <option value="Ocean FCL Volume Contract">Ocean FCL Volume Contract</option>
                    <option value="Customs Brokerage Assistance">Customs Brokerage Assistance</option>
                    <option value="Warehousing & Storage Space">Warehousing &amp; Storage Space</option>
                    <option value="Billing & Manifest Questions">Billing &amp; Manifest Questions</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 mb-1">
                    Message / Cargo Specifications *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details on your origin, destination, cargo volume, or specific compliance requirements..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'TRANSMITTING MESSAGE...' : 'SEND INQUIRY'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Global Regional Offices Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Global Footprint</span>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">Regional Port Offices</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regionalOffices.map((office, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">{office.region}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{office.city}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{office.address}</p>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <p className="text-slate-700 font-medium">{office.phone}</p>
                  <p className="text-slate-500 text-[11px]">{office.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
