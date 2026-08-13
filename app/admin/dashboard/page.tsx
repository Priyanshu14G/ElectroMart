'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Package,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { authUtils } from '@/lib/utils/auth';

interface PendingProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  description: string;
  images: string;
  createdAt: string;
  supplier?: { name: string; email: string };
}

interface PendingBusiness {
  id: string;
  name: string;
  legalName: string;
  description: string;
  email: string;
  phone: string;
  gst: string;
  address: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'sellers' | 'overview'>('overview');
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [user, setUser] = useState<any>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = authUtils.getCurrentUser();
      const token = currentUser?.id || currentUser?.email || '';
      const res = await fetch('/api/admin/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPendingProducts(data.products || []);
      setPendingBusinesses(data.businesses || []);
    } catch (err) {
      showToast('Failed to load pending items', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = authUtils.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    // Admin role only — all other roles are redirected away
    if (currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    fetchPending();
  }, [fetchPending, router]);

  const handleAction = async (id: string, type: 'product' | 'business', status: 'approved' | 'rejected') => {
    setActionLoading(`${id}-${status}`);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status }),
      });
      if (!res.ok) throw new Error('Action failed');
      showToast(
        `${type === 'product' ? 'Product' : 'Seller'} ${status === 'approved' ? 'approved' : 'rejected'} successfully!`,
        'success'
      );
      await fetchPending();
    } catch (err) {
      showToast('Failed to update status. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProducts = pendingProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBusinesses = pendingBusinesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Pending Products', value: pendingProducts.length, icon: Package, color: 'from-amber-500 to-orange-600' },
    { label: 'Pending Sellers', value: pendingBusinesses.length, icon: Building2, color: 'from-blue-500 to-indigo-600' },
    { label: 'Total Pending', value: pendingProducts.length + pendingBusinesses.length, icon: Clock, color: 'from-purple-500 to-pink-600' },
  ];

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-6 pb-16">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-white font-medium flex items-center gap-2 ${
                toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-gradient-to-br from-primary to-primary/60 rounded-xl">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-muted-foreground ml-14">Review and manage marketplace listings and seller accounts</p>
              </div>
              <button
                onClick={fetchPending}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden bg-card border border-border rounded-2xl p-6"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className="text-4xl font-bold mt-1">{loading ? '…' : stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-muted/30 p-1 rounded-xl w-fit">
            {(['overview', 'products', 'sellers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'products' && <span className="flex items-center gap-2"><Package className="h-4 w-4" />Products {pendingProducts.length > 0 && <span className="bg-amber-500 text-white text-xs rounded-full px-1.5">{pendingProducts.length}</span>}</span>}
                {tab === 'sellers' && <span className="flex items-center gap-2"><Building2 className="h-4 w-4" />Sellers {pendingBusinesses.length > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-1.5">{pendingBusinesses.length}</span>}</span>}
                {tab === 'overview' && <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Overview</span>}
              </button>
            ))}
          </div>

          {/* Search */}
          {(activeTab === 'products' || activeTab === 'sellers') && (
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-sm pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Requires Attention
                </h2>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
                  </div>
                ) : pendingProducts.length === 0 && pendingBusinesses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                    <p>All caught up! No pending items.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingProducts.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium truncate max-w-[160px]">{p.name}</span>
                        </div>
                        <button onClick={() => setActiveTab('products')} className="text-xs text-amber-600 font-medium hover:underline">Review</button>
                      </div>
                    ))}
                    {pendingBusinesses.slice(0, 2).map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium truncate max-w-[160px]">{b.name}</span>
                        </div>
                        <button onClick={() => setActiveTab('sellers')} className="text-xs text-blue-600 font-medium hover:underline">Review</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  How It Works
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: Building2, color: 'text-blue-500', title: 'Seller Registration', desc: 'When a business registers, it starts as "pending". Approve to let them list products.' },
                    { icon: Package, color: 'text-amber-500', title: 'Product Listing', desc: 'New products from sellers remain hidden from the marketplace until you approve them.' },
                    { icon: XCircle, color: 'text-red-500', title: 'Rejection', desc: 'Rejected items are removed from the queue. Sellers are not blocked from retrying.' },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <item.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${item.color}`} />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse" />)}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <CheckCircle className="h-16 w-16 mx-auto mb-3 text-emerald-500 opacity-60" />
                  <h3 className="text-lg font-semibold">No Pending Products</h3>
                  <p className="text-muted-foreground mt-1">All product listings have been reviewed.</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const images = (() => { try { return JSON.parse(product.images) as string[]; } catch { return []; } })();
                  const isExpanded = expandedItem === product.id;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                    >
                      <div className="p-5 flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {images[0] ? (
                            <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 m-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold truncate">{product.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{product.category} • {product.brand}</p>
                              {product.supplier && (
                                <p className="text-xs text-muted-foreground mt-0.5">by {product.supplier.name}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-lg">₹{product.price.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : product.id)}
                            className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                            title="View details"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleAction(product.id, 'product', 'rejected')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `${product.id}-rejected` ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <XCircle className="h-4 w-4" />}
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(product.id, 'product', 'approved')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `${product.id}-approved` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Approve
                          </button>
                        </div>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="p-5 bg-muted/20">
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{product.description}</p>
                              {images.length > 1 && (
                                <div className="flex gap-2">
                                  {images.slice(0, 4).map((img, i) => (
                                    <img key={i} src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-border" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* Sellers Tab */}
          {activeTab === 'sellers' && (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse" />)}
                </div>
              ) : filteredBusinesses.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <CheckCircle className="h-16 w-16 mx-auto mb-3 text-emerald-500 opacity-60" />
                  <h3 className="text-lg font-semibold">No Pending Sellers</h3>
                  <p className="text-muted-foreground mt-1">All seller accounts have been reviewed.</p>
                </div>
              ) : (
                filteredBusinesses.map((biz) => {
                  const isExpanded = expandedItem === biz.id;
                  const address = (() => { try { return JSON.parse(biz.address); } catch { return {}; } })();
                  return (
                    <motion.div
                      key={biz.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                    >
                      <div className="p-5 flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-7 w-7 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{biz.name}</h3>
                          <p className="text-sm text-muted-foreground">{biz.legalName}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{biz.email}</span>
                            <span className="text-xs text-muted-foreground">{biz.phone}</span>
                            {address?.city && (
                              <span className="text-xs text-muted-foreground">{address.city}, {address.state}</span>
                            )}
                          </div>
                        </div>

                        {/* GST Badge */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">GST: {biz.gst}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : biz.id)}
                            className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleAction(biz.id, 'business', 'rejected')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `${biz.id}-rejected` ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <XCircle className="h-4 w-4" />}
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(biz.id, 'business', 'approved')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `${biz.id}-approved` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Approve
                          </button>
                        </div>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="p-5 bg-muted/20 space-y-2">
                              <p className="text-sm text-muted-foreground">{biz.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                                {[
                                  { label: 'GST Number', value: biz.gst },
                                  { label: 'Phone', value: biz.phone },
                                  { label: 'Email', value: biz.email },
                                  { label: 'City', value: address?.city || '—' },
                                  { label: 'State', value: address?.state || '—' },
                                  { label: 'Pincode', value: address?.pincode || '—' },
                                ].map(({ label, value }) => (
                                  <div key={label} className="bg-background rounded-lg p-3 border border-border">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-medium truncate">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
