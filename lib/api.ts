/**
 * Typed API client helpers for the ElectroMart India frontend.
 * All functions return parsed objects ready for use in components.
 */

export interface ApiProduct {
  id: string;
  name: string;
  category: string;
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
  supplier?: ApiSupplierSummary;
  stock: number;
  minOrderQuantity: number;
  price: number;
  leadTime: string;
  packaging: string;
  countryOfOrigin: string;
  hsnCode?: string;
  warranty?: string;
  lifecycle: string;
  rohs: boolean;
  reach: boolean;
  specs?: Record<string, any> | null;
  rating?: number;
  reviewCount: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  reviews?: ApiReview[];
}

export interface ApiSupplierSummary {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  badges: {
    verified?: boolean;
    topRated?: boolean;
    fastDelivery?: boolean;
    manufacturer?: boolean;
    exporter?: boolean;
    trustedSince?: number;
  };
  address: { street?: string; city?: string; state?: string; pincode?: string; country?: string };
  stats?: Record<string, any>;
  certifications?: Record<string, boolean>;
}

export interface ApiSupplier extends ApiSupplierSummary {
  legalName: string;
  description: string;
  banner?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  linkedIn?: string;
  businessTypes: string[];
  gst: string;
  pan: string;
  msme: boolean;
  yearEstablished: number;
  employees?: number;
  annualRevenue?: string;
  website?: string;
  factoryAddress?: Record<string, string> | null;
  gallery: string[];
  productCount: number;
  reviewCount: number;
  products: ApiProduct[];
  reviews: ApiReview[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  unhelpful?: number;
  categories?: {
    quality?: number;
    originality?: number;
    packaging?: number;
    price?: number;
    delivery?: number;
    support?: number;
  } | null;
  createdAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  count: number;
}

export interface ApiRFQ {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  items: ApiRFQItem[];
  targetPrice?: string;
  budgetMin?: number;
  budgetMax?: number;
  deliveryDate?: string;
  priority: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  quotations?: any[];
}

export interface ApiRFQItem {
  id: string;
  partNumber: string;
  componentName: string;
  quantity: number;
  specifications?: string;
  notes?: string;
}

export interface ProductsResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsParams {
  q?: string;
  category?: string;
  supplierId?: string;
  page?: number;
  limit?: number;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rohs?: boolean;
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== false) {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return fetchApi<ProductsResponse>(`/api/products${query ? `?${query}` : ''}`);
}

export async function getProduct(id: string): Promise<{ product: ApiProduct }> {
  return fetchApi<{ product: ApiProduct }>(`/api/products/${id}`);
}

export async function getProductReviews(id: string): Promise<{ reviews: ApiReview[] }> {
  return fetchApi<{ reviews: ApiReview[] }>(`/api/products/${id}/reviews`);
}

export async function submitReview(
  productId: string,
  data: { rating: number; title: string; content: string; categories?: Record<string, number> }
): Promise<{ review: ApiReview }> {
  return fetchApi<{ review: ApiReview }>(`/api/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<{ categories: ApiCategory[] }> {
  return fetchApi<{ categories: ApiCategory[] }>('/api/categories');
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export async function getSuppliers(params: { verified?: boolean; limit?: number; page?: number } = {}): Promise<{ suppliers: ApiSupplier[]; total: number }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return fetchApi(`/api/suppliers${query ? `?${query}` : ''}`);
}

export async function getSupplier(id: string): Promise<{ supplier: ApiSupplier }> {
  return fetchApi<{ supplier: ApiSupplier }>(`/api/suppliers/${id}`);
}

// ─── RFQs ─────────────────────────────────────────────────────────────────────

export async function getRFQs(params: { status?: string; page?: number } = {}): Promise<{ rfqs: ApiRFQ[]; total: number }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return fetchApi(`/api/rfqs${query ? `?${query}` : ''}`);
}

export async function createRFQ(data: {
  title: string;
  description: string;
  items: { partNumber: string; componentName: string; quantity: number; specifications?: string }[];
  priority?: string;
  targetPrice?: string;
  budgetMin?: number;
  budgetMax?: number;
  deliveryDate?: string;
}): Promise<{ rfq: ApiRFQ }> {
  return fetchApi<{ rfq: ApiRFQ }>('/api/rfqs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  role?: 'customer' | 'business_owner';
  phone?: string;
}): Promise<{ user: any }> {
  return fetchApi<{ user: any }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
