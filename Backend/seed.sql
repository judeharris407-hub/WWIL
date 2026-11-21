-- ==============================================================================
-- Worldwide International Logistics (WWIL) Enterprise PostgreSQL Seed Data
-- ==============================================================================

-- 1. Insert Initial Authorized Administrator
-- Password: WWIL-Ops#2026 (bcrypt hash cost 10)
INSERT INTO admins (email, password_hash)
VALUES (
    'admin@wwil-logistics.com',
    '$2a$10$cnhypkBklFxMIpTMVQ2mQuk4Q6NSYoxmTuPtvJUDcNb5I2JBI3u3.'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash;


-- 2. Insert Core Consignment Records (Parcels)
INSERT INTO parcels (
    tracking_number,
    sender_name,
    recipient_name,
    origin_address,
    destination_address,
    origin_lat,
    origin_lng,
    dest_lat,
    dest_lng,
    current_lat,
    current_lng,
    transport_mode,
    status,
    estimated_delivery
)
VALUES
    -- Air Freight Shipment
    (
        'TRK-2024-001234',
        'Siemens Industrial AG (Frankfurt CargoCity South)',
        'Apex Machinery Components (Chicago Intermodal Terminal)',
        'Frankfurt Airport CargoCity South, Hessen, Germany (FRA)',
        'Chicago O''Hare International Airport Cargo Facility, Illinois, USA (ORD)',
        50.037900,
        8.562200,
        41.974200,
        -87.907300,
        46.200000,
        -35.800000,
        'Air Freight',
        'In Transit',
        CURRENT_DATE + INTERVAL '1 day'
    ),
    -- Ocean Freight Shipment
    (
        'MSKU-982341-0',
        'Cosco Electronics Export Corp (Shanghai Yangshan Port)',
        'EuroTech Distribution Logistics BV (Rotterdam Hub)',
        'Port of Shanghai Yangshan Deepwater Terminal, China (CNSHA)',
        'Port of Rotterdam APM Terminals, South Holland, Netherlands (NLRTM)',
        31.230400,
        121.473700,
        51.924400,
        4.477700,
        51.950000,
        4.350000,
        'Ocean Freight',
        'On Hold',
        CURRENT_DATE + INTERVAL '2 days'
    ),
    -- Ground Logistics Shipment
    (
        'WW-TRK-44019',
        'Texas Industrial Assemblies (Dallas Freight Hub)',
        'Silicon Hills Fab Center (Austin Depot)',
        'Dallas Logistics Center, Dallas, Texas, USA (DFW-HUB)',
        'Austin Industrial Park, Austin, Texas, USA (ATX-HUB)',
        32.776700,
        -96.797000,
        30.267200,
        -97.743100,
        31.549300,
        -97.146700,
        'Ground Logistics',
        'In Transit',
        CURRENT_DATE + INTERVAL '1 day'
    )
ON CONFLICT (tracking_number) DO UPDATE
SET
    current_lat = EXCLUDED.current_lat,
    current_lng = EXCLUDED.current_lng,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;


-- 3. Insert Shipment Audit Trail (Checkpoints & Telemetry History)

-- Checkpoints for Air Freight: TRK-2024-001234
INSERT INTO shipment_history (parcel_id, status, location_name, latitude, longitude, notes, timestamp)
SELECT 
    p.id,
    'Order Received',
    'Frankfurt CargoCity South, Germany',
    50.037900,
    8.562200,
    'Consignment manifested and pallets barcode-scanned at WWIL outbound terminal.',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM parcels p WHERE p.tracking_number = 'TRK-2024-001234'
UNION ALL
SELECT 
    p.id,
    'In Transit',
    'Frankfurt Gateway Export Customs',
    50.038000,
    8.565000,
    'Export air cargo declarations cleared. Pallets transferred to airside cargo carrier.',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM parcels p WHERE p.tracking_number = 'TRK-2024-001234'
UNION ALL
SELECT 
    p.id,
    'In Transit',
    'Mid-Atlantic Oceanic Air Corridor (Flight WW-904)',
    46.200000,
    -35.800000,
    'In-flight transponder telemetry ping received. Cruising altitude FL360.',
    CURRENT_TIMESTAMP - INTERVAL '4 hours'
FROM parcels p WHERE p.tracking_number = 'TRK-2024-001234';


-- Checkpoints for Ocean Freight: MSKU-982341-0
INSERT INTO shipment_history (parcel_id, status, location_name, latitude, longitude, notes, timestamp)
SELECT 
    p.id,
    'Order Received',
    'Port of Shanghai Yangshan Terminal, China',
    31.230400,
    121.473700,
    'Container 40ft High Cube received, verified gross mass certified.',
    CURRENT_TIMESTAMP - INTERVAL '18 days'
FROM parcels p WHERE p.tracking_number = 'MSKU-982341-0'
UNION ALL
SELECT 
    p.id,
    'In Transit',
    'Suez Canal Transit Convoy',
    27.800000,
    34.000000,
    'Vessel completed northbound transit through Suez Canal waterway.',
    CURRENT_TIMESTAMP - INTERVAL '6 days'
FROM parcels p WHERE p.tracking_number = 'MSKU-982341-0'
UNION ALL
SELECT 
    p.id,
    'In Transit',
    'Port of Rotterdam Maasvlakte Berths',
    51.950000,
    4.350000,
    'Vessel safely moored at APM Berth 4. Container discharged by gantry crane.',
    CURRENT_TIMESTAMP - INTERVAL '12 hours'
FROM parcels p WHERE p.tracking_number = 'MSKU-982341-0'
UNION ALL
SELECT 
    p.id,
    'On Hold',
    'Rotterdam Bonded Customs Hub, Netherlands',
    51.950000,
    4.350000,
    'Consignment staged for standard European Union import customs documentation review.',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
FROM parcels p WHERE p.tracking_number = 'MSKU-982341-0';


-- Checkpoints for Ground Logistics: WW-TRK-44019
INSERT INTO shipment_history (parcel_id, status, location_name, latitude, longitude, notes, timestamp)
SELECT 
    p.id,
    'Order Received',
    'Dallas Logistics Center, Texas, USA',
    32.776700,
    -96.797000,
    'Shipment loaded onto EV-Semi #TX-4890 and bill of lading verified.',
    CURRENT_TIMESTAMP - INTERVAL '8 hours'
FROM parcels p WHERE p.tracking_number = 'WW-TRK-44019'
UNION ALL
SELECT 
    p.id,
    'In Transit',
    'Waco Interstate Highway Corridor, Texas',
    31.549300,
    -97.146700,
    'Vehicle GPS transponder confirmed en route south on I-35 corridor at 62 mph.',
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
FROM parcels p WHERE p.tracking_number = 'WW-TRK-44019';


-- 4. Insert Inbound Quotation Inquiries (Quotes)
INSERT INTO quotes (
    reference_number,
    freight_type,
    departure_country,
    recipient_country,
    weight,
    full_name,
    email,
    phone
)
VALUES
    (
        'WWIL-Q-90214',
        'Air Freight',
        'Germany',
        'United States',
        '1,250 kg',
        'Hendrik Van Der Bilt',
        'h.vanderbilt@aerotech-europa.de',
        '+49 69 4029 1102'
    ),
    (
        'WWIL-Q-88102',
        'Ocean Freight',
        'China',
        'Netherlands',
        '24,000 kg (FCL)',
        'Elena Rostova',
        'logistics@transmeridian-nl.com',
        '+31 10 598 4400'
    ),
    (
        'WWIL-Q-77341',
        'Ground Logistics',
        'United States',
        'United States',
        '3,400 kg',
        'Robert Sterling',
        'r.sterling@texas-dynamics.com',
        '+1 (214) 555-0198'
    )
ON CONFLICT (reference_number) DO NOTHING;
