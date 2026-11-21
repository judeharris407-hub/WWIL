-- ==============================================================================
-- Worldwide International Logistics (WWIL) Enterprise PostgreSQL Schema
-- ==============================================================================

-- Enable UUID extension for secure, unique identifiers if desired (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admins Table (For Enterprise Dashboard Login)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Parcels Table (Core Shipment Records)
CREATE TABLE IF NOT EXISTS parcels (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    origin_lat NUMERIC(10, 6),
    origin_lng NUMERIC(10, 6),
    dest_lat NUMERIC(10, 6),
    dest_lng NUMERIC(10, 6),
    current_lat NUMERIC(10, 6),
    current_lng NUMERIC(10, 6),
    transport_mode VARCHAR(50) NOT NULL, -- e.g., 'Air Freight', 'Ocean Freight', 'Ground Logistics'
    status VARCHAR(50) NOT NULL DEFAULT 'Order Received', -- e.g., 'Order Received', 'In Transit', 'On Hold', 'Out for Delivery', 'Delivered'
    estimated_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on tracking_number for lightning-fast public lookups
CREATE INDEX IF NOT EXISTS idx_parcels_tracking ON parcels(tracking_number);

-- 3. Shipment History Table (Chronological Audit Trail & Checkpoints)
CREATE TABLE IF NOT EXISTS shipment_history (
    id SERIAL PRIMARY KEY,
    parcel_id INT REFERENCES parcels(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on shipment_history for fast chronological parcel trail lookups
CREATE INDEX IF NOT EXISTS idx_shipment_history_parcel_id ON shipment_history(parcel_id);
CREATE INDEX IF NOT EXISTS idx_shipment_history_timestamp ON shipment_history(timestamp);

-- 4. Quotes Table (Inbound Static Quotation Requests)
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    freight_type VARCHAR(50) NOT NULL,
    departure_country VARCHAR(100) NOT NULL,
    recipient_country VARCHAR(100) NOT NULL,
    weight VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on quotes reference number
CREATE INDEX IF NOT EXISTS idx_quotes_reference ON quotes(reference_number);

-- Trigger to automatically update updated_at on parcels table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_parcels_updated_at ON parcels;
CREATE TRIGGER trigger_parcels_updated_at
    BEFORE UPDATE ON parcels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
