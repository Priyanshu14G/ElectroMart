/* User & Authentication Types */
export type UserRole = 'customer' | 'business_owner' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: string;
}

/* Component Categories */
export type ComponentCategory =
  | 'battery'
  | 'capacitor'
  | 'resistor'
  | 'diode'
  | 'ic'
  | 'microcontroller'
  | 'connector'
  | 'sensor'
  | 'led'
  | 'motor'
  | 'display'
  | 'relay'
  | 'mosfet'
  | 'transformer'
  | 'switch'
  | 'inductor'
  | 'crystal'
  | 'fuse'
  | 'optocouple'
  | 'pcb'
  | 'cable'
  | 'development_board'
  | 'robotics'
  | 'iot'
  | 'rf_component'
  | 'test_equipment'
  | 'embedded_board'
  | 'power_electronics'
  | 'industrial_automation'
  | 'passive_component'
  | 'semiconductor'
  | 'other';

/* Product Specifications - Base */
export interface ProductBase {
  id: string;
  name: string;
  category: ComponentCategory;
  subcategory?: string;
  brand: string;
  manufacturer: string;
  manufacturerPartNumber: string;
  supplierPartNumber: string;
  description: string;
  images: string[];
  videos?: string[];
  datasheet?: string;
  supplierId: string;
  stock: number;
  minOrderQuantity: number;
  price: number;
  leadTime: string;
  packaging: string;
  countryOfOrigin: string;
  hsnCode?: string;
  warranty?: string;
  lifecycle: 'active' | 'discontinued' | 'obsolete';
  rohs: boolean;
  reach: boolean;
  createdAt: string;
  updatedAt: string;
}

/* Category-Specific Specifications */
export interface BatterySpecs {
  voltage: number;
  capacity: number; // mAh or Wh
  chemistry: string;
  rechargeable: boolean;
  chargingTime?: string;
  maxDischargeCurrent: number;
  peakCurrent?: number;
  protectionCircuit: boolean;
  diameter?: number;
  operatingTemperature: string;
  dimensions?: string;
  weight?: number;
  certifications?: string[];
}

export interface CapacitorSpecs {
  capacitance: number; // µF
  voltage: number; // V
  tolerance: number; // %
  dielectricType: string;
  esr?: number; // Ω
  rippleCurrent?: number; // mA
  packageType: 'smd' | 'through_hole' | 'axial' | 'radial';
  size?: string;
  temperature: string;
  operatingTemperature: string;
}

export interface ResistorSpecs {
  resistance: number; // Ω
  tolerance: number; // %
  powerRating: number; // W
  packageType: 'smd' | 'through_hole' | 'axial';
  size?: string;
  temperatureCoefficient?: string;
  currentRating?: number;
}

export interface DiodeSpecs {
  forwardVoltage: number; // V
  forwardCurrent: number; // A
  reverseVoltage: number; // V
  recoveryTime?: number; // ns
  type: 'schottky' | 'tvs' | 'zener' | 'fast_recovery' | 'standard';
  packageType: string;
}

export interface MicrocontrollerSpecs {
  flash: number; // KB
  ram: number; // KB
  core: string;
  architecture: string;
  frequency: number; // MHz
  adc?: number;
  dac?: number;
  gpio: number;
  timers: number;
  pwm: number;
  can?: boolean;
  uart: number;
  spi: number;
  i2c: number;
  usb?: boolean;
  ethernet?: boolean;
  packageType: string;
  powerConsumption?: string;
  operatingTemperature: string;
}

export interface ConnectorSpecs {
  pitch: number; // mm
  currentRating: number; // A
  voltageRating: number; // V
  orientation: string;
  gender: 'male' | 'female' | 'hermaphrodite';
  pins: number;
  connectorType: string;
  mountingType: string;
  housingMaterial: string;
  ipRating?: string;
}

export interface SensorSpecs {
  type: string;
  outputType: string;
  rangeMin?: number;
  rangeMax?: number;
  accuracy?: string;
  frequency?: number;
  supplyVoltage?: string;
  operatingTemperature: string;
  packageType: string;
}

export interface LedSpecs {
  color: string;
  wavelength: number; // nm
  luminousIntensity: number; // mcd
  forwardCurrent: number; // mA
  forwardVoltage: number; // V
  packageType: string;
  operatingTemperature: string;
  viewingAngle?: number; // degrees
}

/* Product - All Types Combined */
export type Product = ProductBase & {
  specs?: BatterySpecs | CapacitorSpecs | ResistorSpecs | DiodeSpecs | 
          MicrocontrollerSpecs | ConnectorSpecs | SensorSpecs | LedSpecs;
  rating?: number;
  reviewCount?: number;
  likes?: number;
};

/* Supplier/Business */
export interface Business {
  id: string;
  name: string;
  legalName: string;
  description: string;
  logo?: string;
  banner?: string;
  businessType: ('manufacturer' | 'distributor' | 'retailer' | 'wholesaler' | 'trader' | 'authorized_dealer')[];
  gst: string;
  pan: string;
  msme?: boolean;
  yearEstablished: number;
  employees?: number;
  annualRevenue?: string;
  website?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  linkedIn?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  factoryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  certifications: {
    iso?: boolean;
    rohs?: boolean;
    bis?: boolean;
    ce?: boolean;
    iec?: boolean;
  };
  documents?: {
    gstCertificate?: string;
    msmeCertificate?: string;
    isoCertificate?: string;
    tradeLicense?: string;
    panVerification?: string;
  };
  gallery?: string[];
  videos?: string[];
  badges: {
    verified: boolean;
    topRated: boolean;
    fastDelivery: boolean;
    manufacturer: boolean;
    exporter: boolean;
    trustedSince?: number;
  };
  stats: {
    responseRate: number; // %
    averageDeliveryTime: string;
    responseTimeHours: number;
    ordersCompleted: number;
    repeatCustomers: number;
    overallScore: number; // 0-100
  };
  products: string[]; // Product IDs
  reviews: string[]; // Review IDs
  rating: number;
  createdAt: string;
  updatedAt: string;
}

/* Reviews & Ratings */
export interface Review {
  id: string;
  productId?: string;
  supplierId?: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  videos?: string[];
  verified: boolean;
  helpful: number;
  unhelpful: number;
  categories?: {
    quality?: number;
    originality?: number;
    packaging?: number;
    price?: number;
    delivery?: number;
    support?: number;
  };
  createdAt: string;
  updatedAt: string;
}

/* RFQ System */
export interface RFQ {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  items: RFQItem[];
  bom?: {
    file?: string;
    content?: string;
  };
  targetPrice?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  deliveryDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'quoted' | 'ordered' | 'completed' | 'cancelled';
  quotations: Quotation[];
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface RFQItem {
  id: string;
  partNumber: string;
  componentName: string;
  quantity: number;
  specifications?: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  items: QuotationItem[];
  totalPrice: number;
  currency: string;
  leadTime: string;
  validity: string;
  deliveryTerms: string;
  paymentTerms: string;
  attachments?: string[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  rfqItemId: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  moq?: number;
  leadTime?: string;
}

/* Community Forum */
export interface ForumThread {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  content: string;
  type: 'requirement' | 'question' | 'discussion' | 'recommendation';
  tags: string[];
  images?: string[];
  specifications?: string;
  documents?: string[];
  replies: ForumReply[];
  views: number;
  likes: number;
  solved: boolean;
  bestAnswerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  productLinks?: string[];
  attachments?: string[];
  likes: number;
  helpful: number;
  isAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

/* Filter Configuration */
export interface FilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'multi-select';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count?: number;
}

export interface CategoryFilters {
  [key: string]: FilterGroup[];
}

/* Notifications */
export interface Notification {
  id: string;
  userId: string;
  type: 'rfq' | 'quotation' | 'review' | 'message' | 'order' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

/* Order/Transaction */
export interface Order {
  id: string;
  customerId: string;
  supplierId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/* Dashboard Data */
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalRFQs: number;
  averageRating: number;
  activeListings: number;
  viewsThisMonth: number;
  conversionRate: number;
  responseRate: number;
}
