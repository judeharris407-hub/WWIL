/* WWIL - Worldwide International Logistics
   Modern Corporate Logic & Interactive Alpine.js Controller
*/

document.addEventListener('alpine:init', () => {
  // Global Toast Notification System
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

  // Mock Database for Package & Cargo Tracking
  const mockTrackingData = {
    'TRK-2024-001234': {
      trackingNumber: 'TRK-2024-001234',
      type: 'Priority Multimodal Cargo',
      carrier: 'WWIL Global Express Logistics',
      flightNumber: 'Conveyance: WW-INT-904 (Boeing 777F / Road Intermodal)',
      origin: 'Frankfurt Central Hub (FRA), Germany',
      destination: "Chicago O'Hare Terminal (ORD), USA",
      status: 'In Transit - Customs Cleared',
      statusStep: 3,
      progress: 74,
      eta: 'Tomorrow by 14:00 CST',
      departedAt: 'Nov 21, 2026 - 08:30 CET',
      pieces: '6 Skids / Palletized Cargo',
      weight: '2,140 kg (4,717 lbs)',
      serviceLevel: 'Guaranteed Priority Freight',
      temperature: 'Ambient Standard Verified',
      checkpoints: [
        { time: 'Nov 20, 2026 - 11:00', location: 'Frankfurt CargoCity South', title: 'Shipment Received & Scanned', detail: 'Consignment verified, weight checked, export manifest finalized.' },
        { time: 'Nov 21, 2026 - 06:15', location: 'Frankfurt Gateway', title: 'Export Customs Released', detail: 'Single-window Zoll approval granted with zero tariff holds.' },
        { time: 'Nov 21, 2026 - 08:30', location: 'Frankfurt Int Airport', title: 'Departed on Flight WW-INT-904', detail: 'Aircraft airborne en route to Chicago O\'Hare airport.' },
        { time: 'Nov 21, 2026 - 15:45', location: 'Chicago O\'Hare (ORD)', title: 'US Import Customs Pre-Clearance', detail: 'Automated ACE manifest cleared. Awaiting final carrier arrival.' }
      ]
    },
    'AWB-78942-FRA': {
      trackingNumber: 'AWB-78942-FRA',
      type: 'Direct Airway Bill (AWB)',
      carrier: 'Lufthansa Cargo / WWIL Air Alliance',
      flightNumber: 'Flight LH-8220 (MD-11F Cargo)',
      origin: 'Frankfurt Hub (FRA), Germany',
      destination: "Chicago O'Hare Int'l (ORD), USA",
      status: 'Airborne - North Atlantic Corridor',
      statusStep: 3,
      progress: 68,
      eta: 'Today at 18:45 CST',
      departedAt: 'Nov 21, 2026 - 11:20 CET',
      pieces: '4 Euro Pallets',
      weight: '1,840 kg',
      serviceLevel: 'Express Air Freight Direct',
      temperature: '+4.2°C (Cold-chain Verified)',
      checkpoints: [
        { time: 'Nov 20, 2026 - 14:30', location: 'FRA CargoCity', title: 'Cargo Received & Bonded', detail: 'Consignment secured in temperature-regulated warehouse.' },
        { time: 'Nov 21, 2026 - 08:15', location: 'Frankfurt Terminal 1', title: 'Customs Clear & Pallet Build', detail: 'Loaded into air cargo containers.' },
        { time: 'Nov 21, 2026 - 11:20', location: 'Frankfurt Int Airport', title: 'Flight Departed', detail: 'Non-stop transatlantic cargo flight.' }
      ]
    },
    'MSKU-982341-0': {
      trackingNumber: 'MSKU-982341-0',
      type: 'Ocean FCL Container',
      carrier: 'Maersk Line / WWIL Ocean Network',
      flightNumber: 'Vessel: MAERSK MC-KINNEY MOLLER',
      origin: 'Port of Shanghai (CNSHA), China',
      destination: 'Port of Rotterdam (NLRTM), Netherlands',
      status: 'Berthed - APM Terminals Rotterdam',
      statusStep: 3,
      progress: 88,
      eta: 'Tomorrow at 06:00 CET',
      departedAt: 'Nov 02, 2026 - 04:00 CST',
      pieces: '1 x 40ft High Cube Container',
      weight: '24,650 kg gross',
      serviceLevel: 'Guaranteed Ocean Liner Service',
      temperature: 'Ambient Dry',
      checkpoints: [
        { time: 'Nov 02, 2026 - 04:00', location: 'Yangshan Port, Shanghai', title: 'Vessel Departed', detail: 'Stowed in bay 42, container sealed.' },
        { time: 'Nov 14, 2026 - 16:20', location: 'Suez Canal Transit', title: 'Canal Passage Completed', detail: 'Convoy on schedule.' },
        { time: 'Nov 21, 2026 - 04:15', location: 'Port of Rotterdam', title: 'Vessel Berthed & Customs Release', detail: 'EU import clearance verified.' }
      ]
    }
  };

  // Alpine Component: Hero Clean White Tracking Card
  Alpine.data('heroTracking', () => ({
    trackingNumberInput: '',
    isLoading: false,
    modalOpen: false,
    shipmentResult: null,

    init() {
      // Set default example tracking number
      this.trackingNumberInput = 'TRK-2024-001234';
      this.shipmentResult = mockTrackingData['TRK-2024-001234'];
    },

    quickFill(code) {
      this.trackingNumberInput = code;
      this.trackOrder();
    },

    trackOrder() {
      const code = this.trackingNumberInput.trim().toUpperCase();
      if (!code) {
        Alpine.store('toast').show('Please enter a valid tracking number.', 'warning');
        return;
      }

      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
        if (mockTrackingData[code]) {
          this.shipmentResult = mockTrackingData[code];
        } else {
          // Dynamic generator for any user custom tracking number
          this.shipmentResult = {
            trackingNumber: code,
            type: 'International Multimodal Freight',
            carrier: 'WWIL Global Transport Network',
            flightNumber: 'Voyage: WWIL-' + Math.floor(1000 + Math.random() * 9000),
            origin: 'Rotterdam Port Gateway, Netherlands',
            destination: 'Port of Newark (EWR), New York, USA',
            status: 'In Transit - Customs Pre-Cleared',
            statusStep: 3,
            progress: 70,
            eta: 'Estimated 2 Business Days',
            departedAt: 'Nov 19, 2026 - 10:00 UTC',
            pieces: 'Multi-piece Freight Consignment',
            weight: '3,200 kg Gross Weight',
            serviceLevel: 'Standard Enterprise Freight',
            temperature: 'Ambient Standard',
            checkpoints: [
              { time: 'Nov 18, 2026 - 09:00', location: 'European Consolidation Terminal', title: 'Shipment Logged & Manifested', detail: 'Consignment entered into WWIL global network.' },
              { time: 'Nov 19, 2026 - 10:00', location: 'Rotterdam Berth 3', title: 'Export Customs Released', detail: 'Cleared for international transit.' },
              { time: 'Nov 20, 2026 - 18:30', location: 'Mid-Atlantic Waypoint', title: 'Satellite Telemetry Verified', detail: 'On-schedule transit.' }
            ]
          };
        }
        this.modalOpen = true;
        Alpine.store('toast').show(`Package ${code} telemetry synchronized!`, 'success');
      }, 650);
    },

    copyTrackingNumber() {
      if (this.shipmentResult) {
        navigator.clipboard.writeText(this.shipmentResult.trackingNumber);
        Alpine.store('toast').show('Tracking number copied to clipboard!', 'info');
      }
    }
  }));

  // Alpine Component: Freight Rate Estimator & Quote Engine
  Alpine.data('rateEstimator', () => ({
    mode: 'air', // 'air', 'ocean_fcl', 'ocean_lcl', 'ground', 'express'
    origin: 'Frankfurt (FRA), Germany',
    destination: 'Chicago (ORD), United States',
    cargoWeight: 1500, // in kg
    cargoVolume: 6.2, // in CBM
    cargoType: 'general',
    companyName: '',
    senderEmail: '',
    phoneNumber: '',
    isCalculating: false,
    quoteSubmitted: false,
    generatedQuoteId: '',

    get estimatedTransit() {
      switch (this.mode) {
        case 'air': return '2 - 4 Business Days';
        case 'express': return '24 - 48 Hours Guaranteed';
        case 'ocean_fcl': return '16 - 22 Ocean Days';
        case 'ocean_lcl': return '20 - 25 Transit Days';
        case 'ground': return '3 - 5 Overland Days';
        default: return '3 - 6 Days';
      }
    },

    get estimatedCost() {
      let baseRatePerKg = 3.60;
      let baseHandling = 220;

      if (this.mode === 'express') {
        baseRatePerKg = 5.80;
        baseHandling = 320;
      } else if (this.mode === 'ocean_fcl') {
        baseRatePerKg = 0.42;
        baseHandling = 750;
      } else if (this.mode === 'ocean_lcl') {
        baseRatePerKg = 0.80;
        baseHandling = 380;
      } else if (this.mode === 'ground') {
        baseRatePerKg = 1.15;
        baseHandling = 160;
      }

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
        Alpine.store('toast').show('Please enter a valid work email address.', 'warning');
        return;
      }

      this.isCalculating = true;

      setTimeout(() => {
        this.isCalculating = false;
        this.quoteSubmitted = true;
        this.generatedQuoteId = 'WWIL-QT-' + Math.floor(100000 + Math.random() * 900000);
        Alpine.store('toast').show(`Quote #${this.generatedQuoteId} generated successfully!`, 'success');
      }, 750);
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
        subtitle: 'Flagship Transcontinental Carrier Network',
        image: './assets/ship1.avif',
        description: 'WWIL operates contracted vessel space with premier maritime alliances and direct airline allocations. Whether shipping full container loads across transpacific lanes or chartering air freighters for urgent semiconductor deliveries, we deliver scheduled consistency.',
        features: [
          'Full Container Load (FCL) & Less than Container Load (LCL) consolidation',
          'Charter flights & Next-Flight-Out (NFO) air allocations',
          'Temperature-controlled active reefer containers (-25°C to +25°C)',
          'Automated electronic Bill of Lading (e-BL) and Airway Bill (e-AWB)',
          'Port-to-Port and Door-to-Door delivery terms under Incoterms 2020'
        ],
        specMetrics: [
          { label: 'Container Types', value: '20ft, 40ft HC, Reefer, Flat Rack' },
          { label: 'Air Lift Capacity', value: 'Up to 120 Tons per charter flight' },
          { label: 'Liner Alliances', value: '2M, Ocean Alliance, THE Alliance' }
        ]
      },
      'ground': {
        title: 'Ground Fleet & Intermodal Rail Logistics',
        subtitle: 'Continental Overland Supply Chain Infrastructure',
        image: './assets/Truck1.avif',
        description: 'Our ground transport network links seaports, air hubs, and regional distribution centers with a modern GPS-telemetry tracked fleet of heavy-haul semi-trucks, dry vans, and electrified regional delivery vehicles.',
        features: [
          'Full Truckload (FTL) and Less Than Truckload (LTL) services',
          'Intermodal double-stack rail corridors for cost-effective freight',
          'Live satellite GPS telemetry and geofencing alerts',
          'Cross-border bonded trucking across North America and Europe'
        ],
        specMetrics: [
          { label: 'Active Fleet', value: '1,400+ Semi-trucks & Chassis' },
          { label: 'Payload Range', value: 'Up to 44,000 lbs (20,000 kg) per unit' },
          { label: 'Safety Rating', value: 'DOT Satisfactory & ISO 39001' }
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
          'Pharma cold-chain and hazardous materials certified storage'
        ],
        specMetrics: [
          { label: 'Global Capacity', value: '3.2M+ sq. meters across 48 hubs' },
          { label: 'Inventory Accuracy', value: '99.98% via RFID & Computer Vision' },
          { label: 'Security', value: 'TAPA Class A & 24/7 CCTV Monitoring' }
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
        title: 'Express Delivery & Time-Critical Courier',
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
          { label: 'Dispatch Window', value: 'Under 30 minutes from booking' },
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
