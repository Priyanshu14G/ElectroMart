'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Award,
  TrendingUp,
  MessageCircle,
  Share2,
  Clock,
  Truck,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { getSupplier, type ApiSupplier } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function SupplierPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';

  const [supplier, setSupplier] = useState<ApiSupplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'reviews'>('products');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSupplier(id)
      .then((res) => setSupplier(res.supplier))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (!supplier) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Supplier not found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }


  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-primary/20 to-secondary/20 h-64">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-6 w-full"
            >
              {/* Logo */}
              <div className="w-32 h-32 bg-card border-4 border-background rounded-lg shadow-lg flex items-center justify-center text-5xl font-bold text-primary overflow-hidden">
                {supplier.logo ? (
                  <img src={supplier.logo} alt={supplier.name} className="w-full h-full object-cover" />
                ) : (
                  supplier.name[0]
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{supplier.name}</h1>
                  {supplier.badges?.verified && (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <p className="text-muted-foreground mb-3">{supplier.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {supplier.rating || 4.5} ({supplier.reviewCount || supplier.reviews?.length || 0} reviews)
                  </span>
                  {supplier.address?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {supplier.address.city}, {supplier.address.state}
                    </span>
                  )}
                  {supplier.yearEstablished && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Established {supplier.yearEstablished}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
          >
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-2xl font-bold text-primary">{supplier.productCount || supplier.products?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-2xl font-bold text-primary">{supplier.stats?.responseTime || '2 hours'}</p>
              <p className="text-sm text-muted-foreground">Response Time</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-2xl font-bold text-primary">{supplier.stats?.onTimeDelivery || 98}%</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-2xl font-bold text-primary">{supplier.stats?.ordersCompleted || '500+'}</p>
              <p className="text-sm text-muted-foreground">Orders Completed</p>
            </div>
          </motion.div>

          {/* Contact & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          >
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 bg-card border border-border rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <a href={`mailto:${supplier.email}`} className="font-semibold hover:text-primary">
                    {supplier.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <a href={`tel:${supplier.phone}`} className="font-semibold hover:text-primary">
                    {supplier.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {supplier.address?.city ? `${supplier.address.city}, ${supplier.address.state}` : 'India'}
                  </p>
                </div>
              </div>

              {/* Certifications */}
              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Certifications
                </h3>
                <div className="space-y-2">
                  {supplier.certifications && Object.entries(supplier.certifications).map(([cert, hasIt]) => 
                    hasIt ? (
                      <div key={cert} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="uppercase">{cert}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>

            {/* Certifications & Documents */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 bg-card border border-border rounded-lg">
                <h3 className="font-semibold mb-4">Company Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">GST Number</p>
                    <p className="font-mono font-semibold">{supplier.gst || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">PAN</p>
                    <p className="font-mono font-semibold">AABCT1234D</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Import/Export Code</p>
                    <p className="font-mono font-semibold">0901025150</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Business Type</p>
                    <p className="font-semibold">Distributor & Trader</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="p-6 bg-card border border-border rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['GST Certificate', 'MSME Registration', 'ISO 9001', 'Trade License'].map((doc) => (
                    <button
                      key={doc}
                      className="p-3 border border-border rounded-lg hover:bg-muted transition text-sm font-medium flex items-center justify-between"
                    >
                      {doc}
                      <FileText className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Supplier
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Products & Reviews Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-4 border-b border-border mb-8">
              {(['products', 'reviews', 'overview'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={cn(
                    'px-4 py-3 font-medium border-b-2 transition capitalize',
                    selectedTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {selectedTab === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(supplier.products || []).map((product, idx) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-card border border-border rounded-lg hover:shadow-lg transition group cursor-pointer"
                    >
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-3 group-hover:scale-105 transition">
                        {Array.isArray(product.images) && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-primary mb-2">₹{product.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {product.rating || 0}
                        </span>
                        <span>Stock: {product.stock > 0 ? '✓' : '✗'}</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-4">
                {(supplier.reviews || []).length > 0 ? (
                  supplier.reviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{review.userName}</p>
                          <p className="text-xs text-muted-foreground">Verified Buyer</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground/80 mb-3">{review.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                )}
              </div>
            )}

            {selectedTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Response Time
                    </h3>
                    <p className="text-sm text-foreground/80">Average response within {supplier.stats?.responseTime || '2 hours'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-green-500" />
                      Shipping & Delivery
                    </h3>
                    <p className="text-sm text-foreground/80">Fast and reliable shipping with package tracking</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Business Performance
                    </h3>
                    <p className="text-sm text-foreground/80">Consistently rated highly by customers</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-2">About {supplier.name}</p>
                    <p className="text-sm text-foreground/80">{supplier.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
