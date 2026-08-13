'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Package,
  TrendingUp,
  Eye,
  Plus,
  ShoppingCart,
  DollarSign,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { authUtils } from '@/lib/utils/auth';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  manufacturer?: string;
  manufacturerPartNumber?: string;
  supplierPartNumber?: string;
  description?: string;
  price: number;
  stock: number;
  status?: string;
  minOrderQuantity?: number;
  leadTime?: string;
  packaging?: string;
  countryOfOrigin?: string;
  warranty?: string;
  images: string[];
  specs?: any;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images?: string[];
    manufacturerPartNumber?: string;
  };
}

interface OrderData {
  id: string;
  customerId: string;
  supplierId: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: any;
  trackingNumber?: string;
  createdAt: string;
  deliveredAt?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDashboard = useCallback(async (currentUser: any) => {
    setDashboardLoading(true);
    try {
      const session = authUtils.getSession();
      const token = session?.userId || currentUser?.id || currentUser?.email || '';

      const res = await fetch('/api/seller/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      } else {
        console.warn('Could not fetch seller dashboard');
      }
    } catch (err) {
      console.error('Fetch seller dashboard error:', err);
      showToast('Error loading dashboard details', 'error');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser =
      authUtils.getCurrentUser() ||
      (typeof window !== 'undefined' && localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null);

    if (!currentUser) {
      router.push('/auth/business-signup');
      return;
    }

    if (currentUser.role !== 'business_owner' && currentUser.role !== 'seller') {
      router.push('/dashboard');
      return;
    }

    setUser(currentUser);
    setLoading(false);
    fetchDashboard(currentUser);
  }, [router, fetchDashboard]);

  const handleLogout = () => {
    authUtils.logout();
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast(`Product "${name}" was successfully removed.`);
        fetchDashboard(user);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting product', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Order status updated to "${newStatus.toUpperCase()}".`);
        fetchDashboard(user);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update order status', 'error');
      }
    } catch (err) {
      showToast('Network error updating order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper to ensure an ID is never displayed in place of a readable name
  const isIdLike = (str?: string) => {
    if (!str) return true;
    return (
      /^[0-9a-fA-F]{24}$/.test(str) ||
      /^user_/.test(str) ||
      /^ord_/i.test(str) ||
      (str.length >= 20 && !str.includes(' ') && !str.includes('@'))
    );
  };

  const getSellerDisplayName = () => {
    if (business?.name && !isIdLike(business.name)) {
      return business.name;
    }
    if (user?.name && !isIdLike(user.name)) {
      return user.name;
    }
    if (user?.email) {
      const part = user.email.split('@')[0];
      return part.charAt(0).toUpperCase() + part.slice(1) + ' Electronics';
    }
    return 'Priya Electronics';
  };

  const getCustomerDisplayName = (order: OrderData) => {
    if (order.customer?.name && !isIdLike(order.customer.name)) {
      return order.customer.name;
    }
    if (order.deliveryAddress?.name && !isIdLike(order.deliveryAddress.name)) {
      return order.deliveryAddress.name;
    }
    if (order.customer?.email) {
      const part = order.customer.email.split('@')[0];
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return 'Verified Customer';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  const products: ProductItem[] = dashboardData?.products || [];
  const orders: OrderData[] = dashboardData?.orders || [];
  const stats = dashboardData?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalStockUnits: 0,
    totalInventoryValue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    lowStockProducts: 0,
    fulfillmentRate: '100%',
    averageOrderValue: '₹0',
    inquiriesCount: 0,
  };
  const business = dashboardData?.business || {};
  const categoryStats = dashboardData?.categoryStats || [];

  const isSellerApproved =
    business.status === 'approved' ||
    business.badges?.verified === true ||
    business.badges?.status === 'approved' ||
    business.stats?.status === 'approved';

  const sellerDisplayName = getSellerDisplayName();

  // Filtered Products
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.manufacturerPartNumber &&
        p.manufacturerPartNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  const recentProducts = products.slice(0, 4);
  const recentOrders = orders.slice(0, 4);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-20 right-6 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 border ${
                  toastMessage.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                }`}
              >
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium">{toastMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Account Status Alert Banner */}
          {!isSellerApproved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3.5"
            >
              <div className="p-2 bg-amber-500/20 rounded-xl flex-shrink-0 text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  Seller Account Awaiting Admin Approval
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">Under Review</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Your seller registration details have been submitted to the ElectroMart administration team. Once verified and approved by the admin, you will receive full access to list new electronic components and start selling on the marketplace.
                </p>
              </div>
            </motion.div>
          )}

          {/* Header Banner with Business Profile & Display Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 text-white rounded-2xl flex items-center justify-center shadow-md font-bold text-2xl flex-shrink-0">
                {sellerDisplayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {sellerDisplayName}
                  </h1>
                  {isSellerApproved ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Verified & Approved Seller
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-amber-500" /> Pending Admin Approval
                    </span>
                  )}
                  {business.badges?.topRated && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Top Rated Supplier
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                  {business.gst && (
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">
                      GSTIN: {business.gst}
                    </span>
                  )}
                  {business.address?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {business.address.city}, {business.address.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    Account: <strong className="text-foreground">{user?.name || sellerDisplayName}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDashboard(user)}
                disabled={dashboardLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${dashboardLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              {isSellerApproved ? (
                <Link href="/seller/add-product">
                  <Button className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  title="Your seller account is awaiting admin approval"
                  className="gap-2 shadow-sm opacity-50 cursor-not-allowed"
                >
                  <Clock className="h-4 w-4" />
                  Add Product (Pending Approval)
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 border-b border-border mb-8 overflow-x-auto"
          >
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
              { id: 'analytics', label: 'Analytics & Reports', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-4 py-3 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap text-sm ${
                  activeTab === id
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            key={activeTab}
          >
            {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Dynamic KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Total Revenue',
                      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                      sub: `${stats.totalOrders} total customer orders`,
                      icon: DollarSign,
                      color: 'text-emerald-500',
                      bg: 'bg-emerald-500/10',
                    },
                    {
                      label: 'Active Listings',
                      value: stats.activeProducts.toString(),
                      sub: `${stats.totalStockUnits.toLocaleString()} units in stock`,
                      icon: Package,
                      color: 'text-blue-500',
                      bg: 'bg-blue-500/10',
                    },
                    {
                      label: 'Pending Fulfillment',
                      value: stats.pendingOrders.toString(),
                      sub: `${stats.processingOrders} in processing`,
                      icon: Clock,
                      color: 'text-amber-500',
                      bg: 'bg-amber-500/10',
                    },
                    {
                      label: 'Fulfillment Rate',
                      value: stats.fulfillmentRate,
                      sub: `${stats.deliveredOrders} orders delivered`,
                      icon: Truck,
                      color: 'text-purple-500',
                      bg: 'bg-purple-500/10',
                    },
                  ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                    <div key={label} className="p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                        <div className={`p-2.5 rounded-xl ${bg}`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Split Section: Recent Products & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Recent Products */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold">Catalog Products</h2>
                          <p className="text-xs text-muted-foreground">Recently updated items</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('products')}>
                          View All ({products.length})
                        </Button>
                      </div>

                      {dashboardLoading ? (
                        <div className="py-12 flex justify-center items-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : recentProducts.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-border rounded-xl">
                          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">No products in catalog</p>
                          <Link href="/seller/add-product" className="mt-2 inline-block">
                            <Button size="sm">Add Product</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentProducts.map((product) => {
                            const imgUrl = Array.isArray(product.images) && product.images[0] ? product.images[0] : null;
                            return (
                              <div
                                key={product.id}
                                className="p-3.5 border border-border rounded-xl hover:bg-muted/40 transition flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                                    {imgUrl ? (
                                      <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                      <span className="capitalize">{product.category}</span>
                                      <span>•</span>
                                      <span>Stock: <strong className={product.stock <= 10 ? 'text-amber-500' : 'text-foreground'}>{product.stock}</strong></span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-sm text-primary">₹{product.price.toLocaleString('en-IN')}</p>
                                  <Link href={`/product/${product.id}`} target="_blank">
                                    <span className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-0.5">
                                      View <ExternalLink className="h-3 w-3" />
                                    </span>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                      <span>Total Inventory Value: <strong className="text-foreground">₹{stats.totalInventoryValue.toLocaleString('en-IN')}</strong></span>
                      <Link href="/seller/add-product" className="text-primary font-semibold hover:underline">
                        + Add New Item
                      </Link>
                    </div>
                  </div>

                  {/* Right: Recent Orders */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold">Latest Customer Orders</h2>
                          <p className="text-xs text-muted-foreground">Recent customer order activity</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
                          View All ({orders.length})
                        </Button>
                      </div>

                      {dashboardLoading ? (
                        <div className="py-12 flex justify-center items-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : recentOrders.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-border rounded-xl">
                          <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">No orders received yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentOrders.map((order) => {
                            const customerName = getCustomerDisplayName(order);
                            return (
                              <div
                                key={order.id}
                                className="p-3.5 border border-border rounded-xl hover:bg-muted/40 transition flex items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-foreground">
                                      {customerName}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        order.status === 'delivered'
                                          ? 'bg-green-500/10 text-green-600'
                                          : order.status === 'shipped'
                                          ? 'bg-purple-500/10 text-purple-600'
                                          : order.status === 'processing'
                                          ? 'bg-blue-500/10 text-blue-600'
                                          : 'bg-yellow-500/10 text-yellow-600'
                                      }`}
                                    >
                                      {order.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {order.deliveryAddress?.city ? `${order.deliveryAddress.city}, ` : ''}{order.deliveryAddress?.state || 'India'}
                                  </p>
                                </div>

                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-sm text-foreground">
                                    ₹{order.totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </p>
                                  <span className="text-[11px] text-muted-foreground">
                                    {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                      <span>Average Order Value: <strong className="text-foreground">{stats.averageOrderValue}</strong></span>
                      <button onClick={() => setActiveTab('orders')} className="text-primary font-semibold hover:underline">
                        Manage Orders →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRODUCTS TAB ────────────────────────────────────────────── */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Product Catalog</h2>
                    <p className="text-sm text-muted-foreground">
                      {products.length} {products.length === 1 ? 'product' : 'products'} listed in your inventory
                    </p>
                  </div>
                  <Link href="/seller/add-product">
                    <Button className="gap-2 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Add New Product
                    </Button>
                  </Link>
                </div>

                {/* Filters and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by product name, brand, or part number (MPN)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 bg-card text-foreground text-sm font-medium"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {dashboardLoading ? (
                  <div className="py-20 flex flex-col justify-center items-center gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-2xl">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-1">
                      {searchQuery || selectedCategory !== 'all' ? 'No matching products found' : 'No products in catalog'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'Try modifying your search query or category filter.'
                        : 'Add your electronic components to make them visible to buyers.'}
                    </p>
                    <Link href="/seller/add-product">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map((product) => {
                      const imgUrl = Array.isArray(product.images) && product.images[0] ? product.images[0] : null;
                      return (
                        <div
                          key={product.id}
                          className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
                        >
                          <div>
                            {/* Product Image */}
                            <div className="aspect-[4/3] bg-muted relative overflow-hidden border-b border-border">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl bg-muted/60">
                                  📦
                                </div>
                              )}
                              <span className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-md border border-border capitalize">
                                {product.category}
                              </span>
                              <span
                                className={`absolute top-2.5 right-2.5 text-xs font-semibold px-2.5 py-1 rounded-md ${
                                  product.stock > 10
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-amber-500/90 text-white'
                                }`}
                              >
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                {product.status === 'approved' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/20 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> Live on Marketplace
                                  </span>
                                ) : product.status === 'rejected' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3 text-red-500" /> Rejected by Admin
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-amber-500" /> Pending Admin Approval
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-base line-clamp-2 mb-1" title={product.name}>
                                {product.name}
                              </h3>
                              {product.manufacturerPartNumber && (
                                <p className="text-xs text-muted-foreground font-mono mb-2">
                                  MPN: {product.manufacturerPartNumber}
                                </p>
                              )}
                              <div className="flex items-baseline justify-between mt-3">
                                <p className="text-2xl font-bold text-primary">
                                  ₹{product.price.toLocaleString('en-IN')}
                                </p>
                                {product.minOrderQuantity && product.minOrderQuantity > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    MOQ: {product.minOrderQuantity} pcs
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="p-4 pt-0 border-t border-border/50 flex gap-2 mt-2">
                            <Link href={`/product/${product.id}`} className="flex-1" target="_blank">
                              <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                                <Eye className="h-3.5 w-3.5" />
                                View Listing
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={deletingId === product.id}
                              className="text-destructive hover:bg-destructive/10 border-border"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── ORDERS TAB ────────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Customer Orders</h2>
                    <p className="text-sm text-muted-foreground">
                      Track and manage all customer purchases
                    </p>
                  </div>

                  {/* Order Status Filters */}
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={orderStatusFilter === status ? 'default' : 'outline'}
                        onClick={() => setOrderStatusFilter(status)}
                        className="capitalize text-xs h-8"
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {dashboardLoading ? (
                  <div className="py-20 flex flex-col justify-center items-center gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-2xl">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-1">No orders found</h3>
                    <p className="text-sm text-muted-foreground">No orders matching the selected filter.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const customerName = getCustomerDisplayName(order);
                      return (
                        <div
                          key={order.id}
                          className="p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition space-y-4"
                        >
                          {/* Order Header with Customer Name as Heading */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-bold text-foreground">
                                  {customerName}
                                </h3>
                                <span
                                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    order.status === 'delivered'
                                      ? 'bg-green-500/10 text-green-600'
                                      : order.status === 'shipped'
                                      ? 'bg-purple-500/10 text-purple-600'
                                      : order.status === 'processing'
                                      ? 'bg-blue-500/10 text-blue-600'
                                      : 'bg-yellow-500/10 text-yellow-600'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>

                            {/* Quick Status Changer */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Order Status:</span>
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background font-semibold capitalize"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Customer & Address Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground bg-muted/30 p-3.5 rounded-xl">
                            <div>
                              <span className="font-semibold text-foreground block mb-1">Customer Details:</span>
                              <p className="font-medium text-foreground">{customerName}</p>
                              {order.customer?.email && <p>{order.customer.email}</p>}
                              {order.customer?.phone && <p>{order.customer.phone}</p>}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground block mb-1">Delivery Address:</span>
                              <p>
                                {order.deliveryAddress?.street || ''}{' '}
                                {order.deliveryAddress?.city ? `${order.deliveryAddress.city}, ` : ''}
                                {order.deliveryAddress?.state || ''} {order.deliveryAddress?.pincode || ''}
                              </p>
                              {order.trackingNumber && (
                                <p className="mt-1 font-mono text-primary font-semibold">
                                  Tracking: {order.trackingNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Ordered Items List */}
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                                <span className="font-medium text-foreground">
                                  {item.product?.name || `Component Part (Qty: ${item.quantity})`}
                                </span>
                                <span className="font-semibold">
                                  {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')} = ₹{item.totalPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Total */}
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">Order Total (incl. GST)</span>
                            <span className="text-lg font-bold text-primary">
                              ₹{order.totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── ANALYTICS TAB ────────────────────────────────────────────── */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Catalog & Inventory Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Stock Breakdown by Category</h3>
                    {categoryStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No category data available</p>
                    ) : (
                      <div className="space-y-4">
                        {categoryStats.map((item: any, i: number) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold capitalize">{item.category}</span>
                              <span className="text-muted-foreground">{item.count} items ({item.totalStock} units)</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Performance Summary</h3>
                    <div className="space-y-4 text-sm">
                      {[
                        { label: 'Total Catalog Products', value: `${stats.activeProducts} Products` },
                        { label: 'Total Units in Inventory', value: `${stats.totalStockUnits.toLocaleString()} units` },
                        { label: 'Total Inventory Valuation', value: `₹${stats.totalInventoryValue.toLocaleString('en-IN')}` },
                        { label: 'Total Completed Orders', value: `${stats.deliveredOrders} Orders` },
                        { label: 'Average Order Value (AOV)', value: stats.averageOrderValue },
                        { label: 'Low Stock Alert Items', value: `${stats.lowStockProducts} Items` },
                      ].map((metric, i) => (
                        <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                          <span className="text-muted-foreground text-xs">{metric.label}</span>
                          <span className="font-bold text-foreground">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
