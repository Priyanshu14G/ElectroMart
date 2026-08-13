'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LogOut,
  ShoppingCart,
  Heart,
  MessageSquare,
  Settings,
  FileText,
  TrendingUp,
  Plus,
  Eye,
  Trash2,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { mockRFQs, allProducts } from '@/lib/mock-data';
import { authUtils } from '@/lib/utils/auth';
import { useWishlist } from '@/lib/providers/wishlist-provider';
import { useCart } from '@/lib/providers/cart-provider';
import { Check } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rfqs' | 'wishlist' | 'messages' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const { items: wishlistItems, removeFromWishlist, totalWishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const [addedCartIds, setAddedCartIds] = useState<{ [key: string]: boolean }>({});


  useEffect(() => {
    // Fetch logged in user dynamically from authUtils / localStorage
    const currentUser = authUtils.getCurrentUser() || (typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    // Sellers are not allowed on the customer dashboard
    if (currentUser.role === 'business_owner' || currentUser.role === 'seller') {
      router.push('/seller/dashboard');
      return;
    }

    setUser(currentUser);
    setLoading(false);

    // Refresh dynamic user profile directly from MongoDB database
    if (currentUser.email) {
      fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            authUtils.setCurrentUser(data.user);
          }
        })
        .catch((err) => console.warn('Could not refresh user from DB:', err));
    }
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

  const userRFQs = mockRFQs.slice(0, 3);
  const recentProducts = allProducts.slice(0, 4);

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
              <h1 className="text-4xl font-bold mb-2">Welcome {user?.name || 'User'},</h1>
              {/* <p className="text-muted-foreground">{user?.email}</p> */}
            </div>
            {/* <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button> */}
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 border-b border-border mb-8 overflow-x-auto"
          >
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'rfqs', label: 'RFQs', icon: FileText },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings },
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
                    { label: 'Total RFQs', value: '12', icon: ShoppingCart },
                    { label: 'Wishlist Items', value: totalWishlistItems.toString(), icon: Heart },
                    { label: 'Unread Messages', value: '3', icon: MessageSquare },
                    { label: 'Orders Completed', value: '24', icon: TrendingUp },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="p-4 bg-card border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>


                {/* Recent RFQs */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Recent RFQs</h2>
                    <Link href="#rfqs">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {userRFQs.map((rfq) => (
                      <div key={rfq.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{rfq.title}</h3>
                            <p className="text-sm text-muted-foreground">Created on {new Date(rfq.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            rfq.status === 'published'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : rfq.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {rfq.status}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">{rfq.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Items: {rfq.items?.length || 1} | {rfq.quotations?.length || 0} quotes received
                          </span>
                          <Button size="sm" variant="ghost">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently Viewed Products */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentProducts.map((product) => (
                      <Link key={product.id} href={`/product/${product.id}`}>
                        <div className="p-4 border border-border rounded-lg hover:shadow-lg transition group cursor-pointer">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-3xl mb-3 group-hover:scale-105 transition overflow-hidden">
                            {Array.isArray(product.images) && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              '📦'
                            )}
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary">{product.name}</h3>
                          <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RFQs Tab */}
            {activeTab === 'rfqs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your RFQs</h2>
                  <Link href="/search">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create New RFQ
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {mockRFQs.map((rfq) => (
                    <div key={rfq.id} className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{rfq.title}</h3>
                          <p className="text-foreground/80 mb-3">{rfq.description}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Items: {rfq.items?.length || 1}</span>
                            <span>Quotes: {rfq.quotations?.length || 0}</span>
                            <span>Budget: {(rfq as any).targetPrice || (rfq as any).budgetMin || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        rfq.status === 'published'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : rfq.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {rfq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Your Wishlist</h2>
                    <p className="text-sm text-muted-foreground">
                      {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                  </div>
                  <Link href="/wishlist">
                    <Button variant="outline" size="sm">
                      Open Full Wishlist Page →
                    </Button>
                  </Link>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-1">Your wishlist is empty</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore our marketplace and click the heart icon on any component to save it here.
                    </p>
                    <Link href="/search">
                      <Button size="sm">Explore Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {wishlistItems.map((product) => {
                      const img = product.image || (Array.isArray(product.images) ? product.images[0] : null);
                      return (
                        <div key={product.id} className="p-4 bg-card border border-border rounded-xl hover:shadow-lg transition flex flex-col justify-between group">
                          <div>
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-3xl mb-3 overflow-hidden relative">
                              {img ? (
                                <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                              ) : (
                                '📦'
                              )}
                              <button
                                type="button"
                                onClick={() => removeFromWishlist(product.id)}
                                className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-white rounded-full transition shadow-sm text-muted-foreground"
                                title="Remove"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-2 mb-1" title={product.name}>
                              {product.name}
                            </h3>
                            <p className="text-base font-bold text-primary mb-3">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-border/60">
                            <Button
                              size="sm"
                              className={`flex-1 text-xs gap-1 ${
                                addedCartIds[product.id] ? 'bg-green-600 hover:bg-green-700' : ''
                              }`}
                              onClick={() => {
                                addToCart({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  quantity: product.minOrderQuantity || 1,
                                  image: img || undefined,
                                  brand: product.brand,
                                  category: product.category,
                                  minOrderQuantity: product.minOrderQuantity || 1,
                                  stock: product.stock,
                                });
                                setAddedCartIds((prev) => ({ ...prev, [product.id]: true }));
                                setTimeout(() => setAddedCartIds((prev) => ({ ...prev, [product.id]: false })), 1800);
                              }}
                            >
                              {addedCartIds[product.id] ? (
                                <>
                                  <Check className="h-3.5 w-3.5" /> Added
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                                </>
                              )}
                            </Button>
                            <Link href={`/product/${product.id}`} target="_blank">
                              <Button size="sm" variant="outline" className="px-2" title="View details">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}


            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Messages</h2>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Start a conversation with a supplier</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Account Settings</h2>
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <label className="text-sm font-semibold block mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full border border-border rounded-lg px-4 py-2 bg-muted"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full border border-border rounded-lg px-4 py-2 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91-9876543210"
                      className="w-full border border-border rounded-lg px-4 py-2 bg-background"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
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
