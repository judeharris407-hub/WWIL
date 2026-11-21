# WWIL Logistics Enterprise Database & Backend Engine

This backend service implements the PostgreSQL database schema and REST API for **Worldwide International Logistics (WWIL)**.

---

## Database Architecture (`schema.sql`)

### 1. `admins`
Stores authorized operations dispatch personnel credentials.
* `id SERIAL PRIMARY KEY`
* `email VARCHAR(255) UNIQUE NOT NULL`
* `password_hash VARCHAR(255) NOT NULL` (bcrypt hashed)
* `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

### 2. `parcels`
Core shipment consignment records with geolocation tracking telemetry.
* `id SERIAL PRIMARY KEY`
* `tracking_number VARCHAR(100) UNIQUE NOT NULL` (Indexed: `idx_parcels_tracking`)
* `sender_name VARCHAR(255) NOT NULL`
* `recipient_name VARCHAR(255) NOT NULL`
* `origin_address TEXT NOT NULL`
* `destination_address TEXT NOT NULL`
* `origin_lat NUMERIC(10, 6)`, `origin_lng NUMERIC(10, 6)`
* `dest_lat NUMERIC(10, 6)`, `dest_lng NUMERIC(10, 6)`
* `current_lat NUMERIC(10, 6)`, `current_lng NUMERIC(10, 6)`
* `transport_mode VARCHAR(50) NOT NULL` (`Air Freight`, `Ocean Freight`, `Ground Logistics`)
* `status VARCHAR(50) NOT NULL DEFAULT 'Order Received'`
* `estimated_delivery DATE`
* `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
* `updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP` (Auto-updated via trigger)

### 3. `shipment_history`
Chronological milestone audit trail and GPS telemetry logs.
* `id SERIAL PRIMARY KEY`
* `parcel_id INT REFERENCES parcels(id) ON DELETE CASCADE`
* `status VARCHAR(50) NOT NULL`
* `location_name VARCHAR(255) NOT NULL`
* `latitude NUMERIC(10, 6)`, `longitude NUMERIC(10, 6)`
* `notes TEXT`
* `timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

### 4. `quotes`
Inbound commercial freight quotation requests.
* `id SERIAL PRIMARY KEY`
* `reference_number VARCHAR(100) UNIQUE NOT NULL` (Indexed: `idx_quotes_reference`)
* `freight_type VARCHAR(50) NOT NULL`
* `departure_country VARCHAR(100) NOT NULL`
* `recipient_country VARCHAR(100) NOT NULL`
* `weight VARCHAR(50)`
* `full_name VARCHAR(255) NOT NULL`
* `email VARCHAR(255) NOT NULL`
* `phone VARCHAR(50)`
* `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

---

## Quickstart

### Option A: One-Command PostgreSQL with Docker Compose
From the project root:
```bash
docker compose up -d
```
This automatically boots PostgreSQL 16 and runs `schema.sql` followed by `seed.sql`.

### Option B: Local PostgreSQL Database Setup
1. Create database:
   ```sql
   CREATE DATABASE wwil_db;
   ```
2. Apply schema and seed:
   ```bash
   psql -U postgres -d wwil_db -f schema.sql
   psql -U postgres -d wwil_db -f seed.sql
   ```

### Start Backend API Server
```bash
cd Backend
npm install
npm start
```
The server will start on port `5000` (configurable via `.env`).

---

## REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime and PostgreSQL connection status |
| `POST` | `/api/auth/login` | Verify admin credentials against `admins` table |
| `GET` | `/api/auth/verify` | Validate JWT session token |
| `GET` | `/api/parcels` | List consignments with latest checkpoints (supports `?search=`, `?mode=`, `?status=`) |
| `GET` | `/api/parcels/:tracking_number` | Public tracking lookup with full chronological history |
| `POST` | `/api/parcels` | Register new consignment and log first milestone |
| `PATCH` | `/api/parcels/:id/status` | Update parcel status and log to `shipment_history` |
| `PATCH` | `/api/parcels/:id/location` | Calibrate coordinates and record new waypoint checkpoint |
| `DELETE` | `/api/parcels/:id` | Remove consignment (cascades to history) |
| `POST` | `/api/quotes` | Submit inbound quotation inquiry |
| `GET` | `/api/quotes` | View quotation requests for enterprise dispatchers |

---

## Default Seed Credentials

* **Admin Email:** `admin@wwil-logistics.com`
* **Security Key:** `WWIL-Ops#2026`
* **Demo Parcels Seeded:**
  * `TRK-2024-001234` (Air Freight &bull; Frankfurt &rarr; Chicago)
  * `MSKU-982341-0` (Ocean Freight &bull; Shanghai &rarr; Rotterdam)
  * `WW-TRK-44019` (Ground Logistics &bull; Dallas &rarr; Austin)
