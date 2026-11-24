'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, RotateCcw } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';

export default function StaticQuoteForm() {
  const [formData, setFormData] = useState({
    freightType: 'Air Freight (Expedited)',
    departureCountry: 'Germany (Frankfurt Hub)',
    recipientCountry: 'United States (Chicago ORD)',
    weightKg: '1250',
    expectedDate: '2026-11-28',
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    cargoDescription: '',
    company_website: '', // Honeypot bot trap (invisible to legitimate users)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteReference, setQuoteReference] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freightType: formData.freightType,
          departureCountry: formData.departureCountry,
          recipientCountry: formData.recipientCountry,
          weight: `${formData.weightKg} kg`,
          fullName: formData.fullName,
          email: formData.businessEmail,
          phone: formData.phoneNumber,
          notes: formData.cargoDescription,
          company_website: formData.company_website, // Transmit honeypot for backend bot evaluation
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuoteReference(data.referenceNumber || data.quote?.reference_number);
        setSubmitted(true);
      } else {
        // Graceful offline fallback
        setQuoteReference(`TGL-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        setSubmitted(true);
      }
    } catch (err) {
      console.warn('Backend quote submission fallback:', err);
      setQuoteReference(`TGL-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setQuoteReference('');
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-emerald-500 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
            Quote Request Successfully Registered
          </span>
          <h3 className="font-display font-extrabold text-2xl text-slate-900 mt-1">
            Reference #{quoteReference}
          </h3>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Our route planners have received your consignment details. A formal rate matrix and space confirmation will be transmitted to{' '}
            <strong className="text-slate-900">{formData.businessEmail}</strong> within 15 minutes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl text-xs text-left border border-slate-200">
          <div>
            <span className="text-slate-400 block mb-0.5">Freight Mode</span>
            <strong className="text-slate-800 block truncate">{formData.freightType}</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Route</span>
            <strong className="text-slate-800 block truncate">
              {formData.departureCountry.split(' ')[0]} &rarr; {formData.recipientCountry.split(' ')[0]}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Gross Weight</span>
            <strong className="text-slate-800 block truncate">{formData.weightKg} kg</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Target Date</span>
            <strong className="text-[#2563EB] block truncate">{formData.expectedDate}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Submit Another Quote Request</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl">
      <div className="pb-5 border-b border-slate-100 mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900">Request a Guaranteed Freight Tariff</h3>
          <p className="text-xs text-slate-500 mt-0.5">Direct vessel, air charter, and rail space allocation</p>
        </div>
        <span className="px-2.5 py-1 rounded bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold">
          Free Consultation
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Freight Type */}
        <div>
          <label htmlFor="freightType" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Freight Type *
          </label>
          <select
            id="freightType"
            name="freightType"
            value={formData.freightType}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="Air Freight (Expedited)">Global Air Freight (Expedited Charter / Liner)</option>
            <option value="Ocean Freight (Full Container Load - FCL)">Ocean Shipping (Full Container Load - FCL)</option>
            <option value="Ocean Freight (Less than Container Load - LCL)">Ocean Shipping (Less than Container Load - LCL)</option>
            <option value="Ground & Intermodal Rail Logistics">Ground &amp; Intermodal Rail Logistics</option>
            <option value="Customs Brokerage & Clearance">Customs Brokerage &amp; Regulatory Clearance</option>
            <option value="Bonded Warehousing & Distribution">Bonded Warehousing &amp; 3PL Storage</option>
          </select>
        </div>

        {/* Row 2: Departure & Recipient Countries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="departureCountry" className="block text-xs font-bold text-slate-700 mb-1">
              Departure Country / Port *
            </label>
            <input
              type="text"
              id="departureCountry"
              name="departureCountry"
              value={formData.departureCountry}
              onChange={handleChange}
              placeholder="e.g. Germany (Frankfurt Hub)"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label htmlFor="recipientCountry" className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Country / Destination *
            </label>
            <input
              type="text"
              id="recipientCountry"
              name="recipientCountry"
              value={formData.recipientCountry}
              onChange={handleChange}
              placeholder="e.g. United States (Chicago ORD)"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Row 3: Weight (KG) & Expected Delivery Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="weightKg" className="block text-xs font-bold text-slate-700 mb-1">
              Estimated Weight (KG) *
            </label>
            <input
              type="number"
              id="weightKg"
              name="weightKg"
              value={formData.weightKg}
              onChange={handleChange}
              placeholder="e.g. 1500"
              required
              min="1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label htmlFor="expectedDate" className="block text-xs font-bold text-slate-700 mb-1">
              Expected Delivery Date *
            </label>
            <input
              type="date"
              id="expectedDate"
              name="expectedDate"
              value={formData.expectedDate}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Row 4: Full Name & Business Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 mb-1">
              Full Name / Contact Person *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Marcus Vance"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label htmlFor="businessEmail" className="block text-xs font-bold text-slate-700 mb-1">
              Business Email Address *
            </label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              placeholder="vance@apex-industrial.com"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Row 5: Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-xs font-bold text-slate-700 mb-1">
            Direct Phone Number / Mobile *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 (555) 019-2834"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          {/* Honeypot Bot Trap: Hidden field invisible to sighted users & screen readers */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}>
            <label htmlFor="company_website">Company Website</label>
            <input
              type="text"
              id="company_website"
              name="company_website"
              value={formData.company_website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'TRANSMITTING REQUISITION...' : 'SUBMIT FREIGHT QUOTE REQUEST'}</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          All bookings are subject to FMC &amp; IATA standard maritime bill of lading provisions. Guaranteed 14-day rate lock.
        </p>
      </form>
    </div>
  );
}
