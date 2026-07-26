// Dynamic filter configurations for different component categories
export type ComponentCategory = 
  | 'battery' | 'capacitor' | 'resistor' | 'diode' | 'ic' | 'connector' 
  | 'led' | 'transistor' | 'relay' | 'sensor' | 'microcontroller' | 'display'
  | 'inductor' | 'crystal' | 'switch' | 'fuse' | 'transformer' | 'motor'
  | 'general';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterCategory {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'multi-select';
  options?: FilterOption[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface FilterConfig {
  category: ComponentCategory;
  filters: FilterCategory[];
}

// Battery-specific filters
const batteryFilters: FilterCategory[] = [
  {
    id: 'chemistry',
    label: 'Battery Chemistry',
    type: 'checkbox',
    options: [
      { label: 'Lithium Ion', value: 'li-ion', count: 245 },
      { label: 'LiFePO4', value: 'lifepo4', count: 87 },
      { label: 'Lead Acid', value: 'lead-acid', count: 156 },
      { label: 'NiMH', value: 'nimh', count: 93 },
      { label: 'Coin Cell', value: 'coin-cell', count: 234 },
      { label: 'Primary (Disposable)', value: 'primary', count: 156 },
    ],
  },
  {
    id: 'voltage',
    label: 'Voltage (V)',
    type: 'range',
    min: 1.2,
    max: 48,
    unit: 'V',
  },
  {
    id: 'capacity',
    label: 'Capacity (mAh)',
    type: 'range',
    min: 100,
    max: 50000,
    unit: 'mAh',
  },
  {
    id: 'chargeType',
    label: 'Type',
    type: 'checkbox',
    options: [
      { label: 'Rechargeable', value: 'rechargeable', count: 432 },
      { label: 'Disposable', value: 'disposable', count: 321 },
      { label: 'Prismatic', value: 'prismatic', count: 98 },
      { label: 'Cylindrical', value: 'cylindrical', count: 156 },
    ],
  },
  {
    id: 'connector',
    label: 'Connector Type',
    type: 'checkbox',
    options: [
      { label: 'JST', value: 'jst', count: 178 },
      { label: 'XT60', value: 'xt60', count: 92 },
      { label: 'Bare Leads', value: 'bare-leads', count: 234 },
      { label: 'Tab', value: 'tab', count: 145 },
    ],
  },
  {
    id: 'operatingTemp',
    label: 'Operating Temp (°C)',
    type: 'range',
    min: -40,
    max: 85,
    unit: '°C',
  },
  {
    id: 'currentRating',
    label: 'Current Rating (A)',
    type: 'range',
    min: 0.1,
    max: 100,
    unit: 'A',
  },
  {
    id: 'certification',
    label: 'Certification',
    type: 'checkbox',
    options: [
      { label: 'UL', value: 'ul', count: 123 },
      { label: 'CE', value: 'ce', count: 234 },
      { label: 'RoHS', value: 'rohs', count: 321 },
      { label: 'BIS', value: 'bis', count: 87 },
    ],
  },
];

// Capacitor-specific filters
const capacitorFilters: FilterCategory[] = [
  {
    id: 'capacitance',
    label: 'Capacitance (μF)',
    type: 'range',
    min: 0.001,
    max: 1000000,
    unit: 'μF',
  },
  {
    id: 'voltage',
    label: 'Voltage Rating (V)',
    type: 'range',
    min: 3,
    max: 5000,
    unit: 'V',
  },
  {
    id: 'tolerance',
    label: 'Tolerance',
    type: 'checkbox',
    options: [
      { label: '±5%', value: '5', count: 234 },
      { label: '±10%', value: '10', count: 321 },
      { label: '±20%', value: '20', count: 178 },
      { label: '±50%', value: '50', count: 92 },
    ],
  },
  {
    id: 'dielectric',
    label: 'Dielectric Type',
    type: 'checkbox',
    options: [
      { label: 'Ceramic', value: 'ceramic', count: 432 },
      { label: 'Electrolytic', value: 'electrolytic', count: 321 },
      { label: 'Film', value: 'film', count: 234 },
      { label: 'Mica', value: 'mica', count: 87 },
      { label: 'Tantalum', value: 'tantalum', count: 156 },
    ],
  },
  {
    id: 'package',
    label: 'Package',
    type: 'checkbox',
    options: [
      { label: 'SMD', value: 'smd', count: 543 },
      { label: 'Through Hole', value: 'through-hole', count: 432 },
      { label: 'Power', value: 'power', count: 123 },
      { label: 'High Frequency', value: 'hf', count: 98 },
    ],
  },
  {
    id: 'tempCoeff',
    label: 'Temperature Coefficient',
    type: 'checkbox',
    options: [
      { label: 'NPO', value: 'npo', count: 321 },
      { label: 'X7R', value: 'x7r', count: 234 },
      { label: 'X5R', value: 'x5r', count: 178 },
      { label: 'Y5V', value: 'y5v', count: 92 },
    ],
  },
  {
    id: 'esr',
    label: 'ESR (mΩ)',
    type: 'range',
    min: 0,
    max: 5000,
    unit: 'mΩ',
  },
];

// Resistor-specific filters
const resistorFilters: FilterCategory[] = [
  {
    id: 'resistance',
    label: 'Resistance (Ω)',
    type: 'range',
    min: 0.1,
    max: 10000000,
    unit: 'Ω',
  },
  {
    id: 'tolerance',
    label: 'Tolerance',
    type: 'checkbox',
    options: [
      { label: '±0.1%', value: '0.1', count: 87 },
      { label: '±0.5%', value: '0.5', count: 156 },
      { label: '±1%', value: '1', count: 432 },
      { label: '±5%', value: '5', count: 543 },
      { label: '±10%', value: '10', count: 321 },
    ],
  },
  {
    id: 'powerRating',
    label: 'Power Rating (W)',
    type: 'range',
    min: 0.05,
    max: 100,
    unit: 'W',
  },
  {
    id: 'package',
    label: 'Package',
    type: 'checkbox',
    options: [
      { label: 'SMD (0402)', value: 'smd-0402', count: 234 },
      { label: 'SMD (0603)', value: 'smd-0603', count: 321 },
      { label: 'SMD (0805)', value: 'smd-0805', count: 432 },
      { label: 'Axial', value: 'axial', count: 178 },
      { label: 'Film', value: 'film', count: 92 },
    ],
  },
  {
    id: 'tempCoeff',
    label: 'Temp Coefficient (ppm/°C)',
    type: 'checkbox',
    options: [
      { label: '±25', value: '25', count: 123 },
      { label: '±50', value: '50', count: 234 },
      { label: '±100', value: '100', count: 321 },
      { label: '±500', value: '500', count: 432 },
    ],
  },
];

// Microcontroller-specific filters
const microcotrollerFilters: FilterCategory[] = [
  {
    id: 'architecture',
    label: 'Architecture',
    type: 'checkbox',
    options: [
      { label: 'ARM Cortex-M0', value: 'cortex-m0', count: 234 },
      { label: 'ARM Cortex-M3', value: 'cortex-m3', count: 321 },
      { label: 'ARM Cortex-M4', value: 'cortex-m4', count: 432 },
      { label: '8051', value: '8051', count: 156 },
      { label: 'AVR', value: 'avr', count: 278 },
    ],
  },
  {
    id: 'frequency',
    label: 'Clock Frequency (MHz)',
    type: 'range',
    min: 1,
    max: 600,
    unit: 'MHz',
  },
  {
    id: 'ram',
    label: 'RAM (KB)',
    type: 'range',
    min: 0.5,
    max: 1024,
    unit: 'KB',
  },
  {
    id: 'flash',
    label: 'Flash Memory (KB)',
    type: 'range',
    min: 1,
    max: 2048,
    unit: 'KB',
  },
  {
    id: 'pins',
    label: 'Pin Count',
    type: 'checkbox',
    options: [
      { label: '6-8 pins', value: '6-8', count: 92 },
      { label: '14-20 pins', value: '14-20', count: 234 },
      { label: '28-32 pins', value: '28-32', count: 321 },
      { label: '48-64 pins', value: '48-64', count: 432 },
      { label: '100+ pins', value: '100+', count: 178 },
    ],
  },
  {
    id: 'peripherals',
    label: 'Peripherals',
    type: 'checkbox',
    options: [
      { label: 'UART', value: 'uart', count: 543 },
      { label: 'SPI', value: 'spi', count: 521 },
      { label: 'I2C', value: 'i2c', count: 512 },
      { label: 'ADC', value: 'adc', count: 498 },
      { label: 'CAN', value: 'can', count: 234 },
      { label: 'USB', value: 'usb', count: 321 },
    ],
  },
];

// Connector-specific filters
const connectorFilters: FilterCategory[] = [
  {
    id: 'connectorType',
    label: 'Connector Type',
    type: 'checkbox',
    options: [
      { label: 'Header', value: 'header', count: 432 },
      { label: 'USB', value: 'usb', count: 321 },
      { label: 'JST', value: 'jst', count: 234 },
      { label: 'DIN', value: 'din', count: 178 },
      { label: 'Terminal Block', value: 'terminal', count: 156 },
      { label: 'RF/Coaxial', value: 'rf', count: 92 },
    ],
  },
  {
    id: 'pitch',
    label: 'Pitch (mm)',
    type: 'range',
    min: 0.5,
    max: 10,
    unit: 'mm',
  },
  {
    id: 'pins',
    label: 'Number of Pins',
    type: 'checkbox',
    options: [
      { label: '2-4 pins', value: '2-4', count: 234 },
      { label: '5-10 pins', value: '5-10', count: 321 },
      { label: '20-30 pins', value: '20-30', count: 432 },
      { label: '50+ pins', value: '50+', count: 178 },
    ],
  },
  {
    id: 'currentRating',
    label: 'Current Rating (A)',
    type: 'range',
    min: 0.1,
    max: 100,
    unit: 'A',
  },
  {
    id: 'voltageRating',
    label: 'Voltage Rating (V)',
    type: 'range',
    min: 3,
    max: 1000,
    unit: 'V',
  },
];

// General/fallback filters
const generalFilters: FilterCategory[] = [
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'checkbox',
    options: [
      { label: 'Texas Instruments', value: 'ti', count: 432 },
      { label: 'Infineon', value: 'infineon', count: 321 },
      { label: 'NXP', value: 'nxp', count: 234 },
      { label: 'STMicroelectronics', value: 'st', count: 321 },
      { label: 'Atmel', value: 'atmel', count: 178 },
      { label: 'Microchip', value: 'microchip', count: 234 },
    ],
  },
  {
    id: 'stock',
    label: 'Stock Status',
    type: 'checkbox',
    options: [
      { label: 'In Stock', value: 'in-stock', count: 1200 },
      { label: '2-4 weeks', value: '2-4w', count: 432 },
      { label: '4-8 weeks', value: '4-8w', count: 234 },
      { label: 'Made to Order', value: 'mto', count: 87 },
    ],
  },
  {
    id: 'priceRange',
    label: 'Price Range (₹)',
    type: 'range',
    min: 1,
    max: 100000,
    unit: '₹',
  },
];

// Map category to filter configurations
const filterConfigMap: Record<ComponentCategory, FilterConfig> = {
  battery: { category: 'battery', filters: batteryFilters },
  capacitor: { category: 'capacitor', filters: capacitorFilters },
  resistor: { category: 'resistor', filters: resistorFilters },
  diode: { category: 'diode', filters: generalFilters },
  ic: { category: 'ic', filters: [...microcotrollerFilters, ...generalFilters] },
  connector: { category: 'connector', filters: connectorFilters },
  led: { category: 'led', filters: generalFilters },
  transistor: { category: 'transistor', filters: generalFilters },
  relay: { category: 'relay', filters: generalFilters },
  sensor: { category: 'sensor', filters: generalFilters },
  microcontroller: { category: 'microcontroller', filters: microcotrollerFilters },
  display: { category: 'display', filters: generalFilters },
  inductor: { category: 'inductor', filters: generalFilters },
  crystal: { category: 'crystal', filters: generalFilters },
  switch: { category: 'switch', filters: generalFilters },
  fuse: { category: 'fuse', filters: generalFilters },
  transformer: { category: 'transformer', filters: generalFilters },
  motor: { category: 'motor', filters: generalFilters },
  general: { category: 'general', filters: generalFilters },
};

export function getFiltersForCategory(category: string): FilterConfig {
  const normalized = category.toLowerCase().replace(/\s+/g, '-') as ComponentCategory;
  return filterConfigMap[normalized] || filterConfigMap.general;
}

export function detectCategory(searchQuery: string): ComponentCategory {
  const query = searchQuery.toLowerCase();

  if (query.includes('battery') || query.includes('cell')) return 'battery';
  if (query.includes('capacitor') || query.includes('cap') || query.includes('μf') || query.includes('uf')) return 'capacitor';
  if (query.includes('resistor') || query.includes('ohm') || query.includes('ω')) return 'resistor';
  if (query.includes('diode') || query.includes('zener')) return 'diode';
  if (query.includes('ic') || query.includes('chip') || query.includes('integrated circuit')) return 'ic';
  if (query.includes('connector') || query.includes('header') || query.includes('jst')) return 'connector';
  if (query.includes('led') || query.includes('light emitting')) return 'led';
  if (query.includes('transistor') || query.includes('bjt') || query.includes('mosfet')) return 'transistor';
  if (query.includes('relay')) return 'relay';
  if (query.includes('sensor') || query.includes('accelerometer') || query.includes('gyro')) return 'sensor';
  if (query.includes('microcontroller') || query.includes('mcu') || query.includes('stm') || query.includes('esp32')) return 'microcontroller';
  if (query.includes('display') || query.includes('lcd') || query.includes('oled')) return 'display';
  if (query.includes('inductor') || query.includes('henry')) return 'inductor';
  if (query.includes('crystal') || query.includes('oscillator')) return 'crystal';
  if (query.includes('switch')) return 'switch';
  if (query.includes('fuse')) return 'fuse';
  if (query.includes('transformer') || query.includes('coil')) return 'transformer';
  if (query.includes('motor')) return 'motor';

  return 'general';
}
