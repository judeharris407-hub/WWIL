/* WWIL - Worldwide International Logistics
   Alpine.js Application Logic & Interactive State Stores
*/

document.addEventListener('alpine:init', () => {
  // Global Toast System
  Alpine.store('toast', {
    visible: false,
    message: '',
    type: 'success', // 'success', 'info', 'warning'
    show(message, type = 'success') {
      this.message = message;
      this.type = type;
      this.visible = true;
      setTimeout(() => {
        this.visible = false;
      }, 4000);
    }
  });

  // Mock Cargo Database for Live Tracking
  const mockTrackingData = {
    'AWB-78942-FRA': {
      trackingNumber: 'AWB-78942-FRA',
      type: 'Airway Bill (AWB)',
      carrier: 'Lufthansa Cargo / WWIL Air Express',
      flightNumber: 'LH-8220 (MD-11F Cargo)',
      origin: 'Frankfurt Hub (FRA), Germany',
      destination: "Chicago O'Hare Int'l (ORD), USA",
      status: 'In Flight - Over North Atlantic',
      statusStep: 3, // 1 to 4
      progress: 68,
      eta: 'Today at 18:45 CST',
      departedAt: 'Nov 21, 2026 - 11:20 CET',
      pieces: '4 Pallets (Euro standard)',
      weight: '1,840 kg (4,056 lbs)',
      serviceLevel: 'Priority Air Freight Direct',
      temperature: '+4.2°C (Cold-chain Verified)',
      checkpoints: [
        { time: 'Nov 20, 2026 - 14:30', location: 'FRA Cargo City South', title: 'Cargo Received & Weighed', detail: 'Consignment inspected, bonded customs seal applied.' },
        { time: 'Nov 21, 2026 - 08:15', location: 'Frankfurt Terminal 1', title: 'Export Customs Released', detail: 'German Zoll clearance granted; loaded onto ULD containers.' },
        { time: 'Nov 21, 2026 - 11:20', location: 'Frankfurt Int Airport', title: 'Departed on Flight LH-8220', detail: 'Aircraft airborne en route to Chicago O\'Hare.' },
        { time: 'Estimated 18:45', location: 'Chicago O\'Hare (ORD)', title: 'Arrival & Port Customs', detail: 'Pending US CBP clearance and ramp handling.' }
      ]
    },
    'MSKU-982341-0': {
      trackingNumber: 'MSKU-982341-0',
      type: 'Ocean Container / Sea Waybill',
      carrier: 'Maersk Line / WWIL Global Ocean Network',
      flightNumber: 'Vessel: MAERSK MC-KINNEY MOLLER (Voyage 2608W)',
      origin: 'Port of Shanghai (CNSHA), China',
      destination: 'Port of Rotterdam (NLRTM), Netherlands',
      status: 'Customs Cleared - Berthed at APM Terminal',
      statusStep: 3,
      progress: 88,
      eta: 'Tomorrow at 06:00 CET',
      departedAt: 'Nov 02, 2026 - 04:00 CST',
      pieces: '1 x 40ft High Cube Container',
      weight: '24,650 kg gross',
      serviceLevel: 'Guaranteed Ocean FCL Expedited',
      temperature: 'Ambient Standard Dry',
      checkpoints: [
        { time: 'Nov 02, 2026 - 04:00', location: 'Yangshan Deepwater Port', title: 'Vessel Departed Shanghai', detail: 'Container stowed in bay 42, tier 08.' },
        { time: 'Nov 14, 2026 - 16:20', location: 'Suez Canal Transit', title: 'Canal Convoy Transit Completed', detail: 'Clear passage into Mediterranean Sea.' },
        { time: 'Nov 20, 2026 - 22:40', location: 'Port of Rotterdam', title: 'Vessel Berthed & Unloading', detail: 'Gantry cranes operating at APM Terminal Maasvlakte II.' },
        { time: 'Nov 21, 2026 - 04:15', location: 'Rotterdam Customs Hub', title: 'EU Import Customs Cleared', detail: 'Fiscal release approved. Awaiting intermodal rail transfer.' }
      ]
    },
    'WW-TRK-44019': {
      trackingNumber: 'WW-TRK-44019',
      type: 'Express Terrestrial & Last-Mile',
      carrier: 'WWIL Express Courier Fleet',
      flightNumber: 'Van Fleet Unit #EV-409',
      origin: 'Central Logistics Hub, Dallas TX',
      destination: 'Austin Commercial Park, TX, USA',
      status: 'Out for Final Mile Delivery',
      statusStep: 4,
      progress: 95,
      eta: 'Today by 15:30 CST',
      departedAt: 'Nov 21, 2026 - 06:15 CST',
      pieces: '12 Master Cartons',
      weight: '320 kg (705 lbs)',
      serviceLevel: 'Dedicated Same-Day Express Road',
      temperature: 'Ambient Insulated',
      checkpoints: [
        { time: 'Nov 21, 2026 - 06:15', location: 'Dallas Regional Hub', title: 'Departed Sorting Facility', detail: 'Loaded onto dedicated electric courier sprinter.' },
        { time: 'Nov 21, 2026 - 09:40', location: 'Waco Inspection Point', title: 'Transit Telemetry Confirmed', detail: 'GPS verified on Interstate 35 South.' },
        { time: 'Nov 21, 2026 - 13:10', location: 'Austin Distribution Depot', title: 'Arrived Local Depot', detail: 'Sorted to Driver route delivery manifest.' },
        { time: 'Nov 21, 2026 - 14:05', location: 'Austin Metro Area', title: 'Out for Delivery', detail: 'Courier en route to consignee loading dock.' }
      ]
    }
  };

  // Alpine Component: Hero Live Tracking Command Center
  Alpine.data('trackingManager', () => ({
    activeTab: 'awb', // 'awb', 'container', 'ref'
    trackingCode: 'AWB-78942-FRA',
    isLoading: false,
    hasResult: false,
    modalOpen: false,
    currentShipment: null,

    init() {
      // Pre-load default shipment data so user can immediately see full experience
      this.currentShipment = mockTrackingData['AWB-78942-FRA'];
    },

    setTab(tab) {
      this.activeTab = tab;
      if (tab === 'awb') {
        this.trackingCode = 'AWB-78942-FRA';
      } else if (tab === 'container') {
        this.trackingCode = 'MSKU-982341-0';
      } else {
        this.trackingCode = 'WW-TRK-44019';
      }
    },

    quickFill(code, tab) {
      this.activeTab = tab;
      this.trackingCode = code;
      this.trackShipment();
    },

    trackShipment() {
      const code = this.trackingCode.trim().toUpperCase();
      if (!code) {
        Alpine.store('toast').show('Please enter a valid Airway Bill, Container, or Booking reference.', 'warning');
        return;
      }

      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
        if (mockTrackingData[code]) {
          this.currentShipment = mockTrackingData[code];
        } else {
          // Dynamic simulated generator for any custom user input
          this.currentShipment = {
            trackingNumber: code,
            type: this.activeTab === 'container' ? 'Ocean Container' : (this.activeTab === 'awb' ? 'Airway Bill' : 'Logistics Consignment'),
            carrier: 'WWIL Global Multimodal Network',
            flightNumber: 'Transit ID: WWIL-INT-' + Math.floor(1000 + Math.random() * 9000),
            origin: 'Hamburg Port Gateway, Germany',
            destination: 'Port of Newark (EWR), New York, USA',
            status: 'In Transit - Customs Pre-Cleared',
            statusStep: 3,
            progress: 72,
            eta: 'Estimated 2 Days via Scheduled Liner',
            departedAt: 'Nov 19, 2026 - 09:30 UTC',
            pieces: 'Multi-piece Consolidated Shipment',
            weight: '3,450 kg Net Weight',
            serviceLevel: 'Standard International Cargo',
            temperature: 'Ambient Standard',
            checkpoints: [
              { time: 'Nov 18, 2026 - 10:00', location: 'European Consolidation Depot', title: 'Shipment Booked & Manifested', detail: 'Cargo scanned into WWIL global telemetry system.' },
              { time: 'Nov 19, 2026 - 09:30', location: 'Terminal Berth 4', title: 'Export Customs Released', detail: 'Single-window declaration verified with zero tariff hold.' },
              { time: 'Nov 20, 2026 - 15:45', location: 'Atlantic Transit Corridor', title: 'In Transit to Destination', detail: 'Automated satellite waypoint check completed.' },
              { time: 'Upcoming', location: 'Port of Newark, NJ', title: 'Destination Terminal Handling', detail: 'Awaiting scheduled vessel arrival.' }
            ]
          };
        }
        this.hasResult = true;
        this.modalOpen = true;
        Alpine.store('toast').show(`Shipment ${code} telemetry synchronized!`, 'success');
      }, 750);
    },

    copyTrackingNumber() {
      if (this.currentShipment) {
        navigator.clipboard.writeText(this.currentShipment.trackingNumber);
        Alpine.store('toast').show('Tracking ID copied to clipboard!', 'info');
      }
    }
  }));

  // Alpine Component: Interactive Freight Quote & Cost Estimator
  Alpine.data('quoteCalculator', () => ({
    mode: 'air', // 'air', 'ocean_fcl', 'ocean_lcl', 'ground', 'express'
    origin: 'Frankfurt (FRA), Germany',
    destination: 'Chicago (ORD), United States',
    cargoWeight: 1200, // in kg
    cargoVolume: 5.4, // in CBM
    cargoType: 'general', // 'general', 'perishable', 'hazmat', 'valuable'
    incoterm: 'CIF',
    companyName: '',
    senderEmail: '',
    phoneNumber: '',
    isCalculating: false,
    quoteSubmitted: false,
    generatedQuoteId: '',

    // Dynamic cost & transit estimation engine
    get estimatedTransit() {
      switch (this.mode) {
        case 'air': return '2 - 4 Business Days';
        case 'express': return '24 - 48 Hours Guaranteed';
        case 'ocean_fcl': return '16 - 22 Ocean Days';
        case 'ocean_lcl': return '20 - 26 Transit Days';
        case 'ground': return '3 - 6 Overland Days';
        default: return '4 - 7 Days';
      }
    },

    get estimatedCost() {
      let baseRatePerKg = 3.80; // default Air
      let baseHandling = 250;

      if (this.mode === 'express') {
        baseRatePerKg = 6.20;
        baseHandling = 350;
      } else if (this.mode === 'ocean_fcl') {
        baseRatePerKg = 0.45;
        baseHandling = 850; // container handling
      } else if (this.mode === 'ocean_lcl') {
        baseRatePerKg = 0.85;
        baseHandling = 420;
      } else if (this.mode === 'ground') {
        baseRatePerKg = 1.20;
        baseHandling = 180;
      }

      // Volumetric chargeable weight (CBM * 167 for air, standard rule)
      const volumetricWeight = this.cargoVolume * 167;
      const chargeableWeight = Math.max(this.cargoWeight, volumetricWeight);

      let multiplier = 1.0;
      if (this.cargoType === 'hazmat') multiplier = 1.35;
      if (this.cargoType === 'perishable') multiplier = 1.25;
      if (this.cargoType === 'valuable') multiplier = 1.40;

      const total = Math.round((chargeableWeight * baseRatePerKg * multiplier) + baseHandling);
      return total.toLocaleString();
    },

    submitQuote() {
      if (!this.senderEmail || !this.senderEmail.includes('@')) {
        Alpine.store('toast').show('Please provide a valid business email address for the quote manifest.', 'warning');
        return;
      }

      this.isCalculating = true;

      setTimeout(() => {
        this.isCalculating = false;
        this.quoteSubmitted = true;
        this.generatedQuoteId = 'WWIL-QT-' + Math.floor(100000 + Math.random() * 900000);
        Alpine.store('toast').show(`Instant quotation generated! Reference #${this.generatedQuoteId}`, 'success');
      }, 900);
    },

    resetQuote() {
      this.quoteSubmitted = false;
      this.generatedQuoteId = '';
    }
  }));

  // Alpine Component: Service Spec Modal
  Alpine.data('serviceModalManager', () => ({
    isOpen: false,
    activeService: null,

    servicesData: {
      'air-ocean': {
        title: 'Global Air & Ocean Freight Multimodal',
        subtitle: 'Flagship Transcontinental Carrier Solutions',
        image: './assets/ship1.avif',
        description: 'WWIL operates direct capacity contracts with world-class maritime liner alliances and premier air cargo carriers. Whether moving high-density container volumes across Transpacific corridors or urgent high-value semiconductors via Boeing 777F charters, we guarantee space, fixed transit schedules, and comprehensive customs integration.',
        features: [
          'Full Container Load (FCL) & Less than Container Load (LCL) consolidation',
          'Charter flights & Next-Flight-Out (NFO) air allocations',
          'Temperature-controlled active reefer containers (-25°C to +25°C)',
          'Automated electronic Bill of Lading (e-BL) and Airway Bill (e-AWB)',
          'Port-to-Port, Port-to-Door, and Door-to-Door terms under Incoterms 2020'
        ],
        specMetrics: [
          { label: 'Container Types', value: '20ft, 40ft HC, Open Top, Flat Rack, Reefer' },
          { label: 'Air Lift Capacity', value: 'Up to 120 Metric Tons per charter flight' },
          { label: 'Liner Alliances', value: '2M, Ocean Alliance, THE Alliance' }
        ]
      },
      'ground': {
        title: 'Ground Fleet & Intermodal Rail Logistics',
        subtitle: 'Continental Overland Supply Chain Infrastructure',
        image: './assets/Truck1.avif',
        description: 'Our ground logistics network connects ports, manufacturing clusters, and interior consumption centers with a modern GPS-telemetry tracked fleet of heavy-haul semi-trucks, dry vans, and electrified regional delivery vehicles.',
        features: [
          'Full Truckload (FTL) and Less Than Truckload (LTL) services',
          'Intermodal double-stack rail corridors for high-efficiency bulk freight',
          'Live satellite GPS telemetry and geofencing alerts',
          'Cross-border bonded trucking through USMCA and European customs zones'
        ],
        specMetrics: [
          { label: 'Active Fleet', value: '1,400+ Semi-trucks & Intermodal Chassis' },
          { label: 'Payload Range', value: 'Up to 44,000 lbs (20,000 kg) per standard unit' },
          { label: 'Safety Rating', value: 'DOT Satisfactory & ISO 39001 Road Safety' }
        ]
      },
      'warehousing': {
        title: 'Intelligent Warehousing & Distribution',
        subtitle: 'Automated Micro-Fulfillment & Bonded Storage',
        image: './assets/warehouse1.avif',
        description: 'WWIL operates over 3.2 million square meters of strategically positioned fulfillment and bonded storage hubs at key airport and seaport perimeters worldwide. Equipped with robotic sortation and automated WMS integration.',
        features: [
          'Customs Bonded warehousing with duty deferment benefits',
          'Automated robotic pick, pack, and sortation systems',
          'Real-time RFID inventory telematics accessible via API',
          'Clean-room pharma and hazardous materials certified vaults'
        ],
        specMetrics: [
          { label: 'Global Capacity', value: '3.2M+ sq. meters across 48 hubs' },
          { label: 'Inventory Accuracy', value: '99.98% via RFID & Computer Vision' },
          { label: 'Security', value: 'TAPA Class A & 24/7 Monitored CCTV' }
        ]
      },
      'customs': {
        title: 'Customs Clearance & Regulatory Brokerage',
        subtitle: 'Zero-Hold Single-Window Trade Compliance',
        image: './assets/news-image4.jpg',
        description: 'Eliminate border delays and unexpected penalties. Our licensed in-house customs brokers navigate complex global import/export tariffs, dual-use export controls, and free trade agreement certifications across all five continents.',
        features: [
          'Direct EDI integration with US CBP (ACE), EU ATLAS, and China Single Window',
          'Harmonized Tariff Schedule (HTS) automated classification audit',
          'Duty drawback programs and FTA preferential rate maximization',
          'AEO-F and C-TPAT Tier 3 validated fast-lane processing'
        ],
        specMetrics: [
          { label: 'Clearance Speed', value: '< 2 hours average digital pre-clearance' },
          { label: 'Broker Team', value: '350+ Licensed Customs Brokers Worldwide' },
          { label: 'Compliance Index', value: '99.85% zero-penalty audit pass rate' }
        ]
      },
      'express': {
        title: 'Express Courier & Time-Critical Delivery',
        subtitle: 'Direct On-Board Courier & Guaranteed Same-Day',
        image: './assets/van1.avif',
        description: 'When downtime is not an option. For AOG (Aircraft on Ground) replacement parts, critical automotive components, and emergency medical shipments, WWIL provides dedicated time-critical couriers and chartered van routing.',
        features: [
          'On-Board Courier (OBC) hand-carry for mission-critical micro-freight',
          'Next-Flight-Out (NFO) air courier dispatch within 45 minutes',
          'Dedicated sprinter vans with two-driver non-stop transit',
          'Direct electronic proof of delivery (POD) with photo and digital signature'
        ],
        specMetrics: [
          { label: 'Dispatch Window', value: 'Under 30 minutes from booking confirmation' },
          { label: 'Coverage', value: 'Direct delivery to 180+ global metropolitan hubs' },
          { label: 'Live Telemetry', value: 'Real-time ping updates every 60 seconds' }
        ]
      }
    },

    open(serviceKey) {
      this.activeService = this.servicesData[serviceKey] || this.servicesData['air-ocean'];
      this.isOpen = true;
    },

    close() {
      this.isOpen = false;
    }
  }));
});
