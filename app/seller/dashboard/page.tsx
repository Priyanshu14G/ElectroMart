'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LogOut,
  Package,
  TrendingUp,
  Eye,
  Settings,
  Plus,
  MoreVertical,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { authUtils } from '@/lib/utils/auth';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { allProducts } from '@/lib/mock-data';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');

  useEffect(() => {
    const currentUser = authUtils.getCurrentUser() || (typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
    if (!currentUser) {
      router.push('/auth/business-signup');
      return;
    }

    // Customers are not allowed on the seller dashboard
    if (currentUser.role !== 'business_owner' && currentUser.role !== 'seller') {
      router.push('/dashboard');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    authUtils.logout();
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin">Loading...</div>
        </div>
      </>
    );
  }

  const sellerProducts = allProducts.slice(0, 5);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header with User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your products and orders</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/seller/add-product">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
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
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'analytics', label: 'Analytics', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-4 py-3 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === id
                    ? 'border-primary text-primary'
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            key={activeTab}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Products', value: '48', icon: Package, color: 'text-blue-500' },
                    { label: 'Total Orders', value: '156', icon: ShoppingCart, color: 'text-green-500' },
                    { label: 'Revenue (₹)', value: '₹2.45L', icon: DollarSign, color: 'text-emerald-500' },
                    { label: 'Messages', value: '12', icon: MessageSquare, color: 'text-purple-500' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="p-4 bg-card border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <p className="text-3xl font-bold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Products */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Recent Products</h2>
                    <Link href="#products">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {sellerProducts.map((product) => (
                      <div key={product.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">Stock: {product.stock} units</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₹{product.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{(product as any).views || 0} views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">Sales Performance</h2>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                    Chart placeholder - Sales data visualization
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Products</h2>
                  <Link href="/seller/add-product">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Product
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allProducts.map((product) => (
                    <div key={product.id} className="p-4 bg-card border border-border rounded-lg hover:shadow-lg transition">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-3xl mb-3 overflow-hidden">
                        {Array.isArray(product.images) && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          '📦'
                        )}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
                      <p className="text-lg font-bold text-primary mb-3">₹{product.price.toLocaleString()}</p>
                      <div className="text-xs text-muted-foreground mb-4">
                        <p>Stock: {product.stock} | Views: {(product as any).views || 0}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Recent Orders</h2>
                <div className="space-y-3">
                  {[
                    { id: 'ORD001', customer: 'Rajesh Kumar', items: 15, total: '₹4,500', status: 'pending' },
                    { id: 'ORD002', customer: 'Priya Electronics', items: 8, total: '₹2,400', status: 'processing' },
                    { id: 'ORD003', customer: 'TechHub India', items: 25, total: '₹7,500', status: 'shipped' },
                    { id: 'ORD004', customer: 'ElectroShop', items: 12, total: '₹3,600', status: 'delivered' },
                  ].map((order) => (
                    <div key={order.id} className="p-4 bg-card border border-border rounded-lg hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{order.id}</h3>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : order.status === 'shipped'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{order.items} items</span>
                        <p className="font-bold text-primary">{order.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-card border border-border rounded-lg">
                    <h3 className="font-semibold mb-4">Top Products</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Samsung Battery', sales: 156 },
                        { name: 'Arduino Sensor', sales: 128 },
                        { name: 'LED Display', sales: 95 },
                      ].map((product, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm">{product.name}</span>
                          <div className="w-24 bg-muted rounded h-2">
                            <div
                              className="bg-primary h-full rounded"
                              style={{ width: `${(product.sales / 156) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold ml-2">{product.sales}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-card border border-border rounded-lg">
                    <h3 className="font-semibold mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Conversion Rate', value: '4.2%' },
                        { label: 'Avg Order Value', value: '₹3,240' },
                        { label: 'Customer Retention', value: '68%' },
                      ].map((metric, i) => (
                        <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                          <span className="text-muted-foreground">{metric.label}</span>
                          <span className="font-bold text-primary">{metric.value}</span>
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
