# Worldwide International Logistics (WWIL) 🌐🚢✈️🚚

An enterprise-grade, full-stack international freight forwarding and real-time logistics tracking platform built with **Next.js 14 (App Router)**, **Tailwind CSS**, **React-Leaflet**, **Node.js Express**, and **PostgreSQL (Neon Cloud)**.

---

## 🚀 Key Highlights & Architecture

### 1. Frontend (`/Frontend`)
* **Multi-Page App Router Architecture:**
  - `/` (Corporate Homepage): Hero with live quick-tracking input, freight services showcase, multimodal features, and interactive quotation engine.
  - `/track-order`: Standalone customer tracking suite with live GPS telemetry, dynamic mode-of-transportation banner backgrounds, and milestone audit logs.
  - `/request-quote`: Static freight quotation engine with automated reference number generation and email delivery.
  - `/admin/login`: Secure dispatch console authentication with bcrypt and JWT sessions.
  - `/admin/dashboard`: Comprehensive dispatch command center featuring live parcel creation, Nominatim geocoding autocomplete, "Pick on Map" interactive Leaflet picker, live status/mode updates, and interactive map coordinate calibration.
* **High-Precision Multi-Modal Routing Engine:**
  - **Ground Freight:** Queries public OSRM to map realistic highway geometry following real national road networks.
  - **Ocean Freight:** Simulates realistic maritime sea corridors traversing major international choke points (English Channel, Gibraltar, Suez, Bab-el-Mandeb, Malacca, Panama, North Atlantic & Pacific corridors) avoiding landmasses.
  - **Air Freight:** Spherical Linear Interpolation (SLERP) Great-Circle geodesic arcs following Earth's spherical curvature.
  - **Antimeridian & World-Wrap Protection:** Continuously unwraps longitudes across the 180° meridian to prevent horizontal line stretching.
  - **Leg Visual Distinction:** Renders completed segments as solid strokes and remaining legs as dashed strokes in `#FF6200`.

### 2. Backend (`/Backend`)
* **REST API Server:** Express 4.x modular API with connection pooling to PostgreSQL.
* **Database Layer:** Relational schema with foreign keys, indexes, and triggers across `parcels`, `shipment_history`, `admins`, and `quotes`.
* **Transactional Email Service:** Resend integration sending responsive HTML quotation receipts and operations notifications.
* **Security:** JWT authentication middleware, bcrypt password hashing, and parameterized SQL queries preventing injection.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, React-Leaflet, Leaflet, Lucide Icons, OSRM API, OpenStreetMap Nominatim.
* **Backend:** Node.js, Express, `pg` (PostgreSQL client with SSL), `bcrypt`, `jsonwebtoken`, `resend`, `cors`, `dotenv`.
* **Database:** Cloud Neon PostgreSQL / Local Docker Compose PostgreSQL.

---

## 📦 Getting Started

### 1. Prerequisites
* Node.js 18+ (tested on Node v20+)
* npm or yarn
* PostgreSQL database (Neon Cloud recommended or local PostgreSQL)

### 2. Backend Setup
```bash
cd Backend
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL and RESEND_API_KEY
npm install
npm run dev
# Backend server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd Frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔐 Corporate Operations Credentials

* **Dispatch Admin Email:** `transglobel9@gmail.com`
* **Dispatch Admin Password:** `Kenfack123@`
* **Consignment Prefix:** `TGL-2026-XXXX`

---

## 📄 License
TransGlobe-Logistics &copy; 2026. All rights reserved.
