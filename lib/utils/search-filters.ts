// Comprehensive filter configurations for electronic components
export type ComponentCategory =
  | 'battery' | 'capacitor' | 'resistor' | 'diode' | 'ic' | 'connector'
  | 'led' | 'transistor' | 'relay' | 'sensor' | 'microcontroller' | 'display'
  | 'inductor' | 'crystal' | 'switch' | 'fuse' | 'transformer' | 'motor' | 'iot'
  | 'general';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterCategory {
  id: string;
  label: string;
  unit?: string;
  type: 'checkbox' | 'range' | 'select';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface FilterConfig {
  category: ComponentCategory;
  filters: FilterCategory[];
}

// ── Capacitor Filters ─────────────────────────────────────────────────────────
const capacitorFilters: FilterCategory[] = [
  {
    id: 'capacitance',
    label: 'Capacitance',
    type: 'checkbox',
    options: [
      { label: '1pF – 100pF', value: 'pf-range', count: 234 },
      { label: '1nF – 100nF', value: 'nf-range', count: 312 },
      { label: '1µF – 10µF', value: '1uf-10uf', count: 543 },
      { label: '10µF – 100µF', value: '10uf-100uf', count: 432 },
      { label: '100µF – 1000µF', value: '100uf-1000uf', count: 321 },
      { label: '1000µF+', value: '1000uf-plus', count: 178 },
    ],
  },
  {
    id: 'voltageRating',
    label: 'Voltage Rating',
    type: 'checkbox',
    options: [
      { label: '3.3V', value: '3.3v', count: 89 },
      { label: '5V', value: '5v', count: 234 },
      { label: '10V', value: '10v', count: 321 },
      { label: '16V', value: '16v', count: 432 },
      { label: '25V', value: '25v', count: 543 },
      { label: '50V', value: '50v', count: 321 },
      { label: '100V', value: '100v', count: 178 },
      { label: '200V+', value: '200v-plus', count: 92 },
    ],
  },
  {
    id: 'tolerance',
    label: 'Tolerance',
    type: 'checkbox',
    options: [
      { label: '±1%', value: '1pct', count: 92 },
      { label: '±2%', value: '2pct', count: 156 },
      { label: '±5%', value: '5pct', count: 543 },
      { label: '±10%', value: '10pct', count: 432 },
      { label: '±20%', value: '20pct', count: 321 },
    ],
  },
  {
    id: 'dielectric',
    label: 'Dielectric',
    type: 'checkbox',
    options: [
      { label: 'Ceramic (MLCC)', value: 'ceramic', count: 768 },
      { label: 'Electrolytic (Aluminum)', value: 'electrolytic', count: 543 },
      { label: 'Film (Polyester)', value: 'film', count: 321 },
      { label: 'Tantalum', value: 'tantalum', count: 178 },
      { label: 'Mica', value: 'mica', count: 87 },
      { label: 'Supercapacitor', value: 'super', count: 45 },
    ],
  },
  {
    id: 'esr',
    label: 'ESR (Equivalent Series Resistance)',
    type: 'checkbox',
    options: [
      { label: '< 10mΩ', value: 'lt10', count: 234 },
      { label: '10mΩ – 50mΩ', value: '10-50', count: 321 },
      { label: '50mΩ – 200mΩ', value: '50-200', count: 432 },
      { label: '200mΩ – 500mΩ', value: '200-500', count: 234 },
      { label: '> 500mΩ', value: 'gt500', count: 92 },
    ],
  },
  {
    id: 'rippleCurrent',
    label: 'Ripple Current Rating',
    type: 'checkbox',
    options: [
      { label: '< 100mA', value: 'lt100ma', count: 156 },
      { label: '100mA – 500mA', value: '100-500ma', count: 321 },
      { label: '500mA – 1A', value: '500ma-1a', count: 432 },
      { label: '1A – 3A', value: '1a-3a', count: 234 },
      { label: '3A+', value: 'gt3a', count: 87 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature Rating',
    type: 'checkbox',
    options: [
      { label: '-20°C to 85°C', value: '-20-85', count: 432 },
      { label: '-40°C to 85°C', value: '-40-85', count: 321 },
      { label: '-20°C to 105°C', value: '-20-105', count: 543 },
      { label: '-40°C to 125°C', value: '-40-125', count: 234 },
      { label: '-55°C to 150°C', value: '-55-150', count: 92 },
    ],
  },
  {
    id: 'caseSize',
    label: 'Case Size (SMD)',
    type: 'checkbox',
    options: [
      { label: '0201', value: '0201', count: 156 },
      { label: '0402', value: '0402', count: 432 },
      { label: '0603', value: '0603', count: 543 },
      { label: '0805', value: '0805', count: 432 },
      { label: '1206', value: '1206', count: 321 },
      { label: '1210', value: '1210', count: 234 },
      { label: '1812', value: '1812', count: 178 },
      { label: '2220', value: '2220', count: 87 },
    ],
  },
  {
    id: 'dimensions',
    label: 'Dimensions (Body)',
    type: 'checkbox',
    options: [
      { label: '< 3mm dia', value: 'lt3mm', count: 234 },
      { label: '3mm – 6mm dia', value: '3-6mm', count: 432 },
      { label: '6mm – 10mm dia', value: '6-10mm', count: 321 },
      { label: '10mm – 16mm dia', value: '10-16mm', count: 234 },
      { label: '16mm+ dia', value: 'gt16mm', count: 92 },
    ],
  },
  {
    id: 'mounting',
    label: 'Mounting Style',
    type: 'checkbox',
    options: [
      { label: 'SMD / SMT', value: 'smd', count: 768 },
      { label: 'Through Hole (Radial)', value: 'through-hole-radial', count: 432 },
      { label: 'Through Hole (Axial)', value: 'through-hole-axial', count: 178 },
      { label: 'Snap-in', value: 'snap-in', count: 92 },
      { label: 'Chassis Mount', value: 'chassis', count: 45 },
    ],
  },
  {
    id: 'termination',
    label: 'Termination Style',
    type: 'checkbox',
    options: [
      { label: 'Reflow Solder', value: 'reflow', count: 543 },
      { label: 'Wave Solder', value: 'wave', count: 321 },
      { label: 'Wire Lead', value: 'wire', count: 234 },
      { label: 'Press-fit', value: 'pressfit', count: 87 },
      { label: 'Screw Terminal', value: 'screw', count: 45 },
    ],
  },
  {
    id: 'packaging',
    label: 'Packaging / Delivery Form',
    type: 'checkbox',
    options: [
      { label: 'Tape & Reel (1000 pcs)', value: 'reel-1000', count: 543 },
      { label: 'Tape & Reel (2000 pcs)', value: 'reel-2000', count: 321 },
      { label: 'Tube / Stick', value: 'tube', count: 234 },
      { label: 'Bulk Bag', value: 'bulk', count: 432 },
      { label: 'Tray / Tray Pack', value: 'tray', count: 178 },
      { label: 'Cut Tape (any qty)', value: 'cut-tape', count: 768 },
    ],
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'Murata', value: 'murata', count: 543 },
      { label: 'TDK', value: 'tdk', count: 432 },
      { label: 'KEMET', value: 'kemet', count: 321 },
      { label: 'Vishay', value: 'vishay', count: 312 },
      { label: 'Panasonic', value: 'panasonic', count: 234 },
      { label: 'Nichicon', value: 'nichicon', count: 178 },
      { label: 'Nippon Chemi-Con', value: 'nichemi', count: 145 },
      { label: 'Samsung Electro-Mech.', value: 'samsung', count: 234 },
      { label: 'Yageo', value: 'yageo', count: 321 },
      { label: 'AVX / Kyocera', value: 'avx', count: 178 },
    ],
  },
];

// ── Resistor Filters ──────────────────────────────────────────────────────────
const resistorFilters: FilterCategory[] = [
  {
    id: 'resistance',
    label: 'Resistance Value',
    type: 'checkbox',
    options: [
      { label: '< 10Ω', value: 'lt10', count: 234 },
      { label: '10Ω – 100Ω', value: '10-100', count: 432 },
      { label: '100Ω – 1kΩ', value: '100-1k', count: 543 },
      { label: '1kΩ – 10kΩ', value: '1k-10k', count: 768 },
      { label: '10kΩ – 100kΩ', value: '10k-100k', count: 543 },
      { label: '100kΩ – 1MΩ', value: '100k-1m', count: 321 },
      { label: '1MΩ+', value: 'gt1m', count: 178 },
    ],
  },
  {
    id: 'tolerance',
    label: 'Tolerance',
    type: 'checkbox',
    options: [
      { label: '±0.1%', value: '0.1pct', count: 87 },
      { label: '±0.5%', value: '0.5pct', count: 156 },
      { label: '±1%', value: '1pct', count: 768 },
      { label: '±2%', value: '2pct', count: 321 },
      { label: '±5%', value: '5pct', count: 543 },
      { label: '±10%', value: '10pct', count: 234 },
    ],
  },
  {
    id: 'powerRating',
    label: 'Power Rating',
    type: 'checkbox',
    options: [
      { label: '1/20W (0.05W)', value: '0.05w', count: 156 },
      { label: '1/16W (0.0625W)', value: '0.0625w', count: 234 },
      { label: '1/10W (0.1W)', value: '0.1w', count: 321 },
      { label: '1/8W (0.125W)', value: '0.125w', count: 432 },
      { label: '1/4W (0.25W)', value: '0.25w', count: 768 },
      { label: '1/2W (0.5W)', value: '0.5w', count: 543 },
      { label: '1W', value: '1w', count: 321 },
      { label: '2W', value: '2w', count: 234 },
      { label: '5W', value: '5w', count: 178 },
      { label: '10W+', value: '10w-plus', count: 92 },
    ],
  },
  {
    id: 'package',
    label: 'Package / Case',
    type: 'checkbox',
    options: [
      { label: 'SMD 0201', value: 'smd-0201', count: 156 },
      { label: 'SMD 0402', value: 'smd-0402', count: 432 },
      { label: 'SMD 0603', value: 'smd-0603', count: 543 },
      { label: 'SMD 0805', value: 'smd-0805', count: 432 },
      { label: 'SMD 1206', value: 'smd-1206', count: 321 },
      { label: 'Axial (Through Hole)', value: 'axial', count: 234 },
      { label: 'TO-220 (Power)', value: 'to220', count: 87 },
      { label: 'SIP Network', value: 'sip', count: 45 },
    ],
  },
  {
    id: 'tempCoefficient',
    label: 'Temp. Coefficient (TCR)',
    type: 'checkbox',
    options: [
      { label: '±10 ppm/°C', value: '10ppm', count: 87 },
      { label: '±25 ppm/°C', value: '25ppm', count: 156 },
      { label: '±50 ppm/°C', value: '50ppm', count: 321 },
      { label: '±100 ppm/°C', value: '100ppm', count: 432 },
      { label: '±200 ppm/°C', value: '200ppm', count: 321 },
      { label: '±500 ppm/°C', value: '500ppm', count: 234 },
    ],
  },
  {
    id: 'voltageRating',
    label: 'Max Voltage Rating',
    type: 'checkbox',
    options: [
      { label: '25V', value: '25v', count: 321 },
      { label: '50V', value: '50v', count: 543 },
      { label: '75V', value: '75v', count: 234 },
      { label: '100V', value: '100v', count: 432 },
      { label: '150V', value: '150v', count: 321 },
      { label: '200V+', value: '200v-plus', count: 178 },
    ],
  },
  {
    id: 'technology',
    label: 'Technology',
    type: 'checkbox',
    options: [
      { label: 'Thick Film', value: 'thick-film', count: 768 },
      { label: 'Thin Film', value: 'thin-film', count: 432 },
      { label: 'Metal Film', value: 'metal-film', count: 321 },
      { label: 'Carbon Film', value: 'carbon-film', count: 234 },
      { label: 'Wire Wound', value: 'wire-wound', count: 178 },
      { label: 'Metal Oxide', value: 'metal-oxide', count: 156 },
      { label: 'Cermet', value: 'cermet', count: 87 },
    ],
  },
  {
    id: 'mounting',
    label: 'Mounting Style',
    type: 'checkbox',
    options: [
      { label: 'SMD / SMT', value: 'smd', count: 768 },
      { label: 'Through Hole', value: 'through-hole', count: 432 },
      { label: 'Chassis Mount', value: 'chassis', count: 92 },
    ],
  },
  {
    id: 'dimensions',
    label: 'Physical Dimensions',
    type: 'checkbox',
    options: [
      { label: '0.6 × 0.3mm (0201)', value: 'dim-0201', count: 156 },
      { label: '1.0 × 0.5mm (0402)', value: 'dim-0402', count: 432 },
      { label: '1.6 × 0.8mm (0603)', value: 'dim-0603', count: 543 },
      { label: '2.0 × 1.25mm (0805)', value: 'dim-0805', count: 432 },
      { label: '3.2 × 1.6mm (1206)', value: 'dim-1206', count: 321 },
      { label: '3.5mm dia Axial', value: 'dim-axial', count: 234 },
    ],
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'Yageo', value: 'yageo', count: 543 },
      { label: 'Vishay', value: 'vishay', count: 432 },
      { label: 'Panasonic', value: 'panasonic', count: 321 },
      { label: 'Bourns', value: 'bourns', count: 234 },
      { label: 'TE Connectivity', value: 'te', count: 178 },
      { label: 'Rohm', value: 'rohm', count: 156 },
      { label: 'TDK', value: 'tdk', count: 234 },
      { label: 'Samsung', value: 'samsung', count: 312 },
      { label: 'KOA', value: 'koa', count: 145 },
      { label: 'Susumu', value: 'susumu', count: 87 },
    ],
  },
];

// ── Battery Filters ───────────────────────────────────────────────────────────
const batteryFilters: FilterCategory[] = [
  {
    id: 'chemistry',
    label: 'Battery Chemistry',
    type: 'checkbox',
    options: [
      { label: 'Lithium Ion (Li-Ion)', value: 'li-ion', count: 432 },
      { label: 'LiFePO4 (LFP)', value: 'lifepo4', count: 234 },
      { label: 'Lead Acid', value: 'lead-acid', count: 321 },
      { label: 'NiMH', value: 'nimh', count: 178 },
      { label: 'Coin Cell (CR/LR)', value: 'coin-cell', count: 543 },
      { label: 'Alkaline', value: 'alkaline', count: 432 },
      { label: 'Zinc-Carbon', value: 'zinc-carbon', count: 156 },
    ],
  },
  {
    id: 'voltage',
    label: 'Nominal Voltage',
    type: 'checkbox',
    options: [
      { label: '1.2V (NiMH)', value: '1.2v', count: 234 },
      { label: '1.5V (AA/AAA)', value: '1.5v', count: 432 },
      { label: '3V (Coin)', value: '3v', count: 321 },
      { label: '3.6V – 3.7V (Li-Ion)', value: '3.7v', count: 543 },
      { label: '6V', value: '6v', count: 178 },
      { label: '9V (PP3)', value: '9v', count: 234 },
      { label: '12V', value: '12v', count: 321 },
      { label: '24V+', value: '24v-plus', count: 145 },
    ],
  },
  {
    id: 'capacity',
    label: 'Capacity',
    type: 'checkbox',
    options: [
      { label: '< 500mAh', value: 'lt500', count: 234 },
      { label: '500mAh – 2Ah', value: '500ma-2a', count: 432 },
      { label: '2Ah – 5Ah', value: '2a-5a', count: 321 },
      { label: '5Ah – 20Ah', value: '5a-20a', count: 234 },
      { label: '20Ah+', value: 'gt20a', count: 92 },
    ],
  },
  {
    id: 'certification',
    label: 'Certifications',
    type: 'checkbox',
    options: [
      { label: 'RoHS', value: 'rohs', count: 768 },
      { label: 'UL', value: 'ul', count: 432 },
      { label: 'CE', value: 'ce', count: 543 },
      { label: 'BIS (India)', value: 'bis', count: 234 },
      { label: 'UN 38.3', value: 'un383', count: 321 },
    ],
  },
  {
    id: 'temperature',
    label: 'Operating Temperature',
    type: 'checkbox',
    options: [
      { label: '0°C to 60°C (Standard)', value: '0-60', count: 432 },
      { label: '-20°C to 60°C', value: '-20-60', count: 321 },
      { label: '-40°C to 85°C (Industrial)', value: '-40-85', count: 178 },
      { label: '-20°C to 70°C', value: '-20-70', count: 234 },
    ],
  },
];

// ── Microcontroller Filters ───────────────────────────────────────────────────
const microcontrollerFilters: FilterCategory[] = [
  {
    id: 'architecture',
    label: 'CPU Architecture',
    type: 'checkbox',
    options: [
      { label: 'ARM Cortex-M0/M0+', value: 'cortex-m0', count: 234 },
      { label: 'ARM Cortex-M3', value: 'cortex-m3', count: 321 },
      { label: 'ARM Cortex-M4/M4F', value: 'cortex-m4', count: 432 },
      { label: 'ARM Cortex-M7', value: 'cortex-m7', count: 178 },
      { label: 'AVR (Atmel)', value: 'avr', count: 321 },
      { label: 'PIC (Microchip)', value: 'pic', count: 234 },
      { label: 'Xtensa LX6 (ESP32)', value: 'xtensa', count: 156 },
      { label: '8051', value: '8051', count: 92 },
      { label: 'RISC-V', value: 'riscv', count: 87 },
    ],
  },
  {
    id: 'frequency',
    label: 'Max Clock Frequency',
    type: 'checkbox',
    options: [
      { label: '< 16MHz', value: 'lt16', count: 234 },
      { label: '16MHz – 48MHz', value: '16-48', count: 432 },
      { label: '48MHz – 120MHz', value: '48-120', count: 321 },
      { label: '120MHz – 240MHz', value: '120-240', count: 234 },
      { label: '240MHz+', value: '240plus', count: 178 },
    ],
  },
  {
    id: 'flash',
    label: 'Flash Memory',
    type: 'checkbox',
    options: [
      { label: '< 32KB', value: 'lt32', count: 234 },
      { label: '32KB – 128KB', value: '32-128', count: 432 },
      { label: '128KB – 512KB', value: '128-512', count: 321 },
      { label: '512KB – 2MB', value: '512-2000', count: 178 },
      { label: '2MB+', value: '2mb-plus', count: 87 },
    ],
  },
  {
    id: 'peripherals',
    label: 'Built-in Peripherals',
    type: 'checkbox',
    options: [
      { label: 'Wi-Fi', value: 'wifi', count: 234 },
      { label: 'Bluetooth / BLE', value: 'ble', count: 312 },
      { label: 'USB', value: 'usb', count: 432 },
      { label: 'CAN / CAN FD', value: 'can', count: 321 },
      { label: 'Ethernet', value: 'eth', count: 178 },
      { label: 'ADC (12-bit+)', value: 'adc12', count: 543 },
      { label: 'DAC', value: 'dac', count: 321 },
      { label: 'Touch Sense', value: 'touch', count: 156 },
    ],
  },
  {
    id: 'package',
    label: 'Package',
    type: 'checkbox',
    options: [
      { label: 'DIP (Through Hole)', value: 'dip', count: 156 },
      { label: 'QFN', value: 'qfn', count: 432 },
      { label: 'LQFP', value: 'lqfp', count: 321 },
      { label: 'TQFP', value: 'tqfp', count: 234 },
      { label: 'BGA', value: 'bga', count: 178 },
      { label: 'Module (Dev Board)', value: 'module', count: 321 },
    ],
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'STMicroelectronics', value: 'stm', count: 432 },
      { label: 'Espressif Systems', value: 'espressif', count: 234 },
      { label: 'Microchip / Atmel', value: 'microchip', count: 321 },
      { label: 'NXP Semiconductors', value: 'nxp', count: 234 },
      { label: 'Texas Instruments', value: 'ti', count: 312 },
      { label: 'Nordic Semiconductor', value: 'nordic', count: 156 },
      { label: 'Renesas', value: 'renesas', count: 178 },
    ],
  },
];

// ── Connector Filters ─────────────────────────────────────────────────────────
const connectorFilters: FilterCategory[] = [
  {
    id: 'connectorType',
    label: 'Connector Type',
    type: 'checkbox',
    options: [
      { label: 'Pin Header / Female Header', value: 'header', count: 543 },
      { label: 'USB Type-A', value: 'usb-a', count: 234 },
      { label: 'USB Type-C', value: 'usb-c', count: 312 },
      { label: 'Micro USB', value: 'micro-usb', count: 178 },
      { label: 'JST (XH/PH/SH)', value: 'jst', count: 432 },
      { label: 'XT30 / XT60', value: 'xt', count: 156 },
      { label: 'Terminal Block', value: 'terminal', count: 321 },
      { label: 'SMA / SMA-R (RF)', value: 'sma', count: 92 },
      { label: 'RJ45 (Ethernet)', value: 'rj45', count: 87 },
      { label: 'D-Sub (DB9/DB15)', value: 'dsub', count: 67 },
    ],
  },
  {
    id: 'pitch',
    label: 'Pin Pitch',
    type: 'checkbox',
    options: [
      { label: '0.5mm', value: '0.5mm', count: 178 },
      { label: '0.8mm', value: '0.8mm', count: 234 },
      { label: '1.0mm', value: '1.0mm', count: 312 },
      { label: '1.25mm', value: '1.25mm', count: 432 },
      { label: '1.5mm', value: '1.5mm', count: 321 },
      { label: '2.0mm', value: '2.0mm', count: 543 },
      { label: '2.54mm (0.1")', value: '2.54mm', count: 768 },
      { label: '3.5mm / 3.81mm', value: '3.5mm', count: 321 },
      { label: '5.0mm / 5.08mm', value: '5.0mm', count: 234 },
    ],
  },
  {
    id: 'currentRating',
    label: 'Current Rating',
    type: 'checkbox',
    options: [
      { label: '< 1A', value: 'lt1a', count: 321 },
      { label: '1A – 3A', value: '1-3a', count: 432 },
      { label: '3A – 10A', value: '3-10a', count: 543 },
      { label: '10A – 30A', value: '10-30a', count: 321 },
      { label: '30A+', value: 'gt30a', count: 156 },
    ],
  },
  {
    id: 'voltageRating',
    label: 'Voltage Rating',
    type: 'checkbox',
    options: [
      { label: '30V', value: '30v', count: 234 },
      { label: '50V', value: '50v', count: 321 },
      { label: '125V', value: '125v', count: 432 },
      { label: '250V / 300V', value: '250v', count: 543 },
      { label: '500V+', value: '500v-plus', count: 178 },
    ],
  },
  {
    id: 'mounting',
    label: 'Mounting Style',
    type: 'checkbox',
    options: [
      { label: 'PCB Through Hole', value: 'pcb-th', count: 543 },
      { label: 'PCB Surface Mount', value: 'pcb-smd', count: 432 },
      { label: 'Panel Mount', value: 'panel', count: 234 },
      { label: 'Wire-to-Board', value: 'wire-board', count: 321 },
      { label: 'Wire-to-Wire', value: 'wire-wire', count: 178 },
    ],
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'Hirose', value: 'hirose', count: 432 },
      { label: 'Molex', value: 'molex', count: 543 },
      { label: 'TE Connectivity', value: 'te', count: 432 },
      { label: 'JST', value: 'jst', count: 321 },
      { label: 'Würth Elektronik', value: 'wurth', count: 234 },
      { label: 'Amphenol', value: 'amphenol', count: 312 },
      { label: 'Phoenix Contact', value: 'phoenix', count: 178 },
    ],
  },
];

// ── General / Fallback Filters ────────────────────────────────────────────────
const generalFilters: FilterCategory[] = [
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'Texas Instruments', value: 'ti', count: 432 },
      { label: 'STMicroelectronics', value: 'st', count: 321 },
      { label: 'Infineon', value: 'infineon', count: 234 },
      { label: 'NXP Semiconductors', value: 'nxp', count: 312 },
      { label: 'Microchip Technology', value: 'microchip', count: 234 },
      { label: 'Murata', value: 'murata', count: 321 },
      { label: 'Vishay', value: 'vishay', count: 178 },
      { label: 'Rohm Semiconductor', value: 'rohm', count: 145 },
    ],
  },
  {
    id: 'mounting',
    label: 'Mounting Style',
    type: 'checkbox',
    options: [
      { label: 'SMD / SMT', value: 'smd', count: 768 },
      { label: 'Through Hole', value: 'through-hole', count: 432 },
      { label: 'Chassis / Panel Mount', value: 'chassis', count: 92 },
    ],
  },
  {
    id: 'package',
    label: 'Package',
    type: 'checkbox',
    options: [
      { label: 'DIP', value: 'dip', count: 234 },
      { label: 'SOP / SOIC', value: 'soic', count: 321 },
      { label: 'QFN / DFN', value: 'qfn', count: 432 },
      { label: 'BGA', value: 'bga', count: 178 },
      { label: 'TO-220 / TO-247', value: 'to220', count: 156 },
      { label: 'SOT-23', value: 'sot23', count: 543 },
    ],
  },
  {
    id: 'temperature',
    label: 'Operating Temperature',
    type: 'checkbox',
    options: [
      { label: '0°C to 70°C (Commercial)', value: '0-70', count: 432 },
      { label: '-40°C to 85°C (Industrial)', value: '-40-85', count: 543 },
      { label: '-55°C to 125°C (Military)', value: '-55-125', count: 178 },
      { label: '-40°C to 125°C', value: '-40-125', count: 321 },
    ],
  },
  {
    id: 'certification',
    label: 'Compliance',
    type: 'checkbox',
    options: [
      { label: 'RoHS Compliant', value: 'rohs', count: 1200 },
      { label: 'REACH Compliant', value: 'reach', count: 987 },
      { label: 'Halogen Free', value: 'halogen-free', count: 543 },
      { label: 'AEC-Q100 (Automotive)', value: 'aec-q100', count: 234 },
      { label: 'ITAR Free', value: 'itar-free', count: 156 },
    ],
  },
];

// ── LED Filters ───────────────────────────────────────────────────────────────
const ledFilters: FilterCategory[] = [
  {
    id: 'color',
    label: 'Color / Wavelength',
    type: 'checkbox',
    options: [
      { label: 'Red (620-640nm)', value: 'red', count: 543 },
      { label: 'Green (515-535nm)', value: 'green', count: 432 },
      { label: 'Blue (455-470nm)', value: 'blue', count: 321 },
      { label: 'White (Warm 2700-3500K)', value: 'white-warm', count: 234 },
      { label: 'White (Cool 5000-7000K)', value: 'white-cool', count: 312 },
      { label: 'Yellow / Amber', value: 'yellow', count: 234 },
      { label: 'IR (850nm / 940nm)', value: 'ir', count: 178 },
      { label: 'UV (365-400nm)', value: 'uv', count: 92 },
      { label: 'RGB', value: 'rgb', count: 321 },
    ],
  },
  {
    id: 'package',
    label: 'Package',
    type: 'checkbox',
    options: [
      { label: 'Through Hole 3mm', value: 'th-3mm', count: 432 },
      { label: 'Through Hole 5mm', value: 'th-5mm', count: 543 },
      { label: 'SMD 0603', value: 'smd-0603', count: 321 },
      { label: 'SMD 0805', value: 'smd-0805', count: 432 },
      { label: 'SMD 1206', value: 'smd-1206', count: 234 },
      { label: 'SMD 3528', value: 'smd-3528', count: 178 },
      { label: 'SMD 5050', value: 'smd-5050', count: 321 },
      { label: 'High Power (1W+)', value: 'high-power', count: 156 },
    ],
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'Cree', value: 'cree', count: 234 },
      { label: 'OSRAM / ams-OSRAM', value: 'osram', count: 312 },
      { label: 'Lumileds', value: 'lumileds', count: 178 },
      { label: 'Kingbright', value: 'kingbright', count: 432 },
      { label: 'Everlight', value: 'everlight', count: 321 },
      { label: 'Nichia', value: 'nichia', count: 156 },
    ],
  },
];

// ── Sensor Filters ────────────────────────────────────────────────────────────
const sensorFilters: FilterCategory[] = [
  {
    id: 'sensorType',
    label: 'Sensor Type',
    type: 'checkbox',
    options: [
      { label: 'Temperature', value: 'temperature', count: 432 },
      { label: 'Humidity', value: 'humidity', count: 312 },
      { label: 'Pressure / Barometric', value: 'pressure', count: 234 },
      { label: 'Accelerometer / IMU', value: 'accel', count: 321 },
      { label: 'Gyroscope', value: 'gyro', count: 234 },
      { label: 'Ultrasonic Distance', value: 'ultrasonic', count: 178 },
      { label: 'Infrared / PIR', value: 'ir-pir', count: 234 },
      { label: 'Current / Hall Effect', value: 'current', count: 156 },
      { label: 'Gas / Air Quality', value: 'gas', count: 92 },
      { label: 'Light / LDR / Photodiode', value: 'light', count: 178 },
    ],
  },
  {
    id: 'interface',
    label: 'Output Interface',
    type: 'checkbox',
    options: [
      { label: 'I²C', value: 'i2c', count: 543 },
      { label: 'SPI', value: 'spi', count: 432 },
      { label: 'UART / Serial', value: 'uart', count: 321 },
      { label: 'Analog Voltage', value: 'analog', count: 432 },
      { label: 'PWM', value: 'pwm', count: 178 },
      { label: 'Digital (1-Wire)', value: '1wire', count: 156 },
    ],
  },
  {
    id: 'mounting',
    label: 'Mounting Style',
    type: 'checkbox',
    options: [
      { label: 'SMD', value: 'smd', count: 543 },
      { label: 'Through Hole', value: 'through-hole', count: 321 },
      { label: 'Module / Breakout Board', value: 'module', count: 432 },
    ],
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'Bosch Sensortec', value: 'bosch', count: 234 },
      { label: 'STMicroelectronics', value: 'st', count: 321 },
      { label: 'InvenSense / TDK', value: 'invensense', count: 178 },
      { label: 'Honeywell', value: 'honeywell', count: 156 },
      { label: 'Amphenol Advanced Sensors', value: 'amphenol', count: 92 },
      { label: 'DHT (ASAIR)', value: 'dht', count: 234 },
      { label: 'Texas Instruments', value: 'ti', count: 312 },
    ],
  },
];

// ── Filter Config Map ─────────────────────────────────────────────────────────
const filterConfigMap: Record<ComponentCategory, FilterConfig> = {
  battery: { category: 'battery', filters: batteryFilters },
  capacitor: { category: 'capacitor', filters: capacitorFilters },
  resistor: { category: 'resistor', filters: resistorFilters },
  diode: { category: 'diode', filters: generalFilters },
  ic: { category: 'ic', filters: microcontrollerFilters },
  connector: { category: 'connector', filters: connectorFilters },
  led: { category: 'led', filters: ledFilters },
  transistor: { category: 'transistor', filters: generalFilters },
  relay: { category: 'relay', filters: generalFilters },
  sensor: { category: 'sensor', filters: sensorFilters },
  microcontroller: { category: 'microcontroller', filters: microcontrollerFilters },
  display: { category: 'display', filters: generalFilters },
  inductor: { category: 'inductor', filters: generalFilters },
  crystal: { category: 'crystal', filters: generalFilters },
  switch: { category: 'switch', filters: generalFilters },
  fuse: { category: 'fuse', filters: generalFilters },
  transformer: { category: 'transformer', filters: generalFilters },
  motor: { category: 'motor', filters: generalFilters },
  iot: { category: 'iot', filters: [...microcontrollerFilters, ...sensorFilters.slice(0, 2)] },
  general: { category: 'general', filters: generalFilters },
};

export function getFiltersForCategory(category: string): FilterConfig {
  const normalized = category.toLowerCase().replace(/[\s-]+/g, '') as ComponentCategory;

  // Handle alternate category names
  const aliases: Record<string, ComponentCategory> = {
    cap: 'capacitor',
    caps: 'capacitor',
    res: 'resistor',
    resistors: 'resistor',
    mic: 'microcontroller',
    mcu: 'microcontroller',
    conn: 'connector',
    connectors: 'connector',
    bat: 'battery',
    batteries: 'battery',
    sensors: 'sensor',
    leds: 'led',
    iot: 'iot',
  };

  const key = (aliases[normalized] || normalized) as ComponentCategory;
  return filterConfigMap[key] || filterConfigMap.general;
}

export function detectCategory(searchQuery: string): ComponentCategory {
  const query = searchQuery.toLowerCase();
  if (query.includes('battery') || query.includes('cell') || query.includes('lifepo') || query.includes('li-ion')) return 'battery';
  if (query.includes('capacitor') || query.includes('µf') || query.includes('uf') || query.includes('farad') || query.includes('mlcc')) return 'capacitor';
  if (query.includes('resistor') || query.includes('ohm') || query.includes('ω') || query.includes(' res ')) return 'resistor';
  if (query.includes('diode') || query.includes('zener') || query.includes('schottky')) return 'diode';
  if (query.includes('led') || query.includes('light emitting')) return 'led';
  if (query.includes('transistor') || query.includes('bjt') || query.includes('mosfet') || query.includes('jfet')) return 'transistor';
  if (query.includes('relay')) return 'relay';
  if (query.includes('connector') || query.includes('header') || query.includes('jst') || query.includes('socket')) return 'connector';
  if (query.includes('sensor') || query.includes('accelerometer') || query.includes('gyro') || query.includes('imu')) return 'sensor';
  if (query.includes('microcontroller') || query.includes('mcu') || query.includes('stm32') || query.includes('esp32') || query.includes('arduino')) return 'microcontroller';
  if (query.includes('display') || query.includes('lcd') || query.includes('oled') || query.includes('tft')) return 'display';
  if (query.includes('inductor') || query.includes('henry') || query.includes('choke')) return 'inductor';
  if (query.includes('crystal') || query.includes('oscillator') || query.includes('xtal')) return 'crystal';
  if (query.includes('switch') || query.includes('pushbutton') || query.includes('tactile')) return 'switch';
  if (query.includes('fuse') || query.includes('circuit protection')) return 'fuse';
  if (query.includes('transformer') || query.includes('toroid')) return 'transformer';
  if (query.includes('motor') || query.includes('servo') || query.includes('stepper')) return 'motor';
  if (query.includes('iot') || query.includes('wifi') || query.includes('bluetooth') || query.includes('lora')) return 'iot';
  if (query.includes('ic') || query.includes('chip') || query.includes('integrated circuit') || query.includes('opamp')) return 'ic';
  return 'general';
}
