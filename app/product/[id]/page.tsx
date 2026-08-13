'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  CheckCircle,
  TrendingUp,
  Download,
  FileText,
  ShoppingCart,
  Loader2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProduct, type ApiProduct } from '@/lib/api';
import { useCart } from '@/lib/providers/cart-provider';
import { useWishlist } from '@/lib/providers/wishlist-provider';
import { cn } from '@/lib/utils';

export default function ProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'details' | 'reviews' | 'specifications'>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);



  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then((res) => setProduct(res.product))
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

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product not found</h1>
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href={`/search?category=${product.category}`} className="hover:text-primary capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          {/* Product Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
            {/* Product Image */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-muted rounded-lg aspect-square flex items-center justify-center overflow-hidden mb-4 sticky top-24 border border-border"
              >
                {Array.isArray(product.images) && product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </motion.div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Title and Badges */}
                <div>
                  <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.supplier?.badges?.verified && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Verified Supplier
                      </span>
                    )}
                    {product.stock > 100 && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        High Stock
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-5 w-5',
                              i < Math.round(product.rating || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground'
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{product.rating || 0}</span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-2 p-4 bg-card border border-border rounded-lg">
                  <div className="text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
                </div>

                {/* Supplier Info */}
                {product.supplier && (
                  <Link href={`/supplier/${product.supplier.id}`}>
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg hover:border-accent/40 transition cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Sold by</p>
                          <p className="text-lg font-bold text-primary mt-1">{product.supplier.name}</p>
                          {product.supplier.address?.city && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {product.supplier.address.city}, {product.supplier.address.state}
                              </span>
                            </div>
                          )}
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                  </Link>
                )}

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">MOQ</p>
                    <p className="font-semibold">{product.minOrderQuantity} units</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Lead Time</p>
                    <p className="font-semibold">{product.leadTime}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Stock</p>
                    <p className="font-semibold text-green-600">{product.stock} units</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Manufacturer</p>
                    <p className="font-semibold text-sm">{product.manufacturer}</p>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex border border-border rounded-lg bg-background">
                      <button
                        onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                        className="px-3 py-2 hover:bg-muted transition text-muted-foreground hover:text-foreground"
                        title="Decrease"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(product.minOrderQuantity || 1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-l border-r border-border bg-background font-semibold"
                        min={product.minOrderQuantity || 1}
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-muted transition text-muted-foreground hover:text-foreground"
                        title="Increase"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      MOQ: {product.minOrderQuantity || 1} {product.minOrderQuantity && product.minOrderQuantity > 1 ? 'units minimum' : 'unit'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className={`flex-1 h-11 text-base font-semibold gap-2 transition-all ${
                        addedAnimation ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                      }`}
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          quantity,
                          images: Array.isArray(product.images) ? product.images : [product.images as any],
                          brand: product.brand,
                          manufacturer: product.manufacturer,
                          supplierName: product.supplier?.name || 'ElectroMart Supplier',
                          minOrderQuantity: product.minOrderQuantity || 1,
                          stock: product.stock,
                          category: product.category,
                          leadTime: product.leadTime,
                          packaging: product.packaging,
                        });
                        setAddedAnimation(true);
                        setTimeout(() => setAddedAnimation(false), 2000);
                      }}
                    >
                      {addedAnimation ? (
                        <>
                          <Check className="h-5 w-5 animate-in zoom-in" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-12 h-11 flex-shrink-0 transition"
                      onClick={() => {
                        const added = toggleWishlist({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          images: Array.isArray(product.images) ? product.images : [product.images as any],
                          brand: product.brand,
                          category: product.category,
                          minOrderQuantity: product.minOrderQuantity || 1,
                          stock: product.stock,
                          leadTime: product.leadTime,
                        });
                        setWishlistToast(added ? 'Saved to your Wishlist' : 'Removed from your Wishlist');
                        setTimeout(() => setWishlistToast(null), 2500);
                      }}
                      title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={cn('h-5 w-5 transition', isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                    </Button>
                  </div>

                  {wishlistToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between text-xs text-red-700 dark:text-red-300"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                        {wishlistToast}
                      </span>
                      <Link href="/wishlist" className="font-semibold underline flex items-center gap-1">
                        View Wishlist <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </motion.div>
                  )}


                  {addedAnimation && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between text-xs text-green-700 dark:text-green-300"
                    >
                      <span>Item added to your cart successfully.</span>
                      <Link href="/cart" className="font-semibold underline flex items-center gap-1">
                        View Cart <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </motion.div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full h-11 font-semibold"
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity,
                        images: Array.isArray(product.images) ? product.images : [product.images as any],
                        brand: product.brand,
                        manufacturer: product.manufacturer,
                        supplierName: product.supplier?.name || 'ElectroMart Supplier',
                        minOrderQuantity: product.minOrderQuantity || 1,
                        stock: product.stock,
                        category: product.category,
                        leadTime: product.leadTime,
                        packaging: product.packaging,
                      });
                      router.push('/cart');
                    }}
                  >
                    Buy Now
                  </Button>

                  <Button variant="ghost" className="w-full h-10 text-muted-foreground hover:text-foreground">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Supplier for Custom Quotation
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Product Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex gap-4 border-b border-border mb-8">
              {(['details', 'specifications', 'reviews'] as const).map((tab) => (
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
            <div className="space-y-6">
              {selectedTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About this product</h3>
                    <p className="text-foreground/80 leading-relaxed">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-card border border-border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <p className="font-semibold capitalize">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Brand</p>
                      <p className="font-semibold">{product.manufacturer}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'specifications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Part Numbers */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-muted/50 border-b border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Part Identification</p>
                    </div>
                    <div className="divide-y divide-border/50">
                      {[
                        { label: 'Manufacturer Part Number (MPN)', value: product.manufacturerPartNumber },
                        { label: 'Supplier Part Number (SPN)', value: product.supplierPartNumber },
                        { label: 'Category', value: product.category },
                        { label: 'Manufacturer / Brand', value: product.manufacturer || product.brand },
                        { label: 'Packaging', value: (product as any).packaging },
                        { label: 'Lead Time', value: (product as any).leadTime },
                        { label: 'RoHS Compliant', value: (product as any).rohs === true ? '✓ Yes' : (product as any).rohs === false ? '✗ No' : undefined },
                      ].filter(r => r.value).map(row => (
                        <div key={row.label} className="flex px-4 py-2.5 gap-4 hover:bg-muted/20 transition-colors">
                          <span className="text-sm text-muted-foreground w-52 flex-shrink-0">{row.label}</span>
                          <span className="text-sm font-medium font-mono break-all">{String(row.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Specs from specs JSON */}
                  {product.specs && Object.keys(product.specs).length > 0 && (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-primary/5 border-b border-border">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Technical Specifications</p>
                      </div>
                      <div className="divide-y divide-border/50">
                        {Object.entries(product.specs as Record<string, any>).map(([key, val]) => {
                          if (val === null || val === undefined || val === '') return null;
                          // Format key: camelCase or snake_case → Title Case
                          const label = key
                            .replace(/_/g, ' ')
                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                            .replace(/\b\w/g, c => c.toUpperCase());
                          const display = typeof val === 'boolean' ? (val ? '✓ Yes' : '✗ No') : String(val);
                          return (
                            <div key={key} className="flex px-4 py-2.5 gap-4 hover:bg-muted/20 transition-colors">
                              <span className="text-sm text-muted-foreground w-52 flex-shrink-0">{label}</span>
                              <span className="text-sm font-medium">{display}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Capacitor-specific quick specs pulled from top-level fields */}
                  {(() => {
                    const p = product as any;
                    const rows = [
                      { label: 'Capacitance', value: p.capacitance },
                      { label: 'Voltage Rating', value: p.voltageRating },
                      { label: 'Tolerance', value: p.tolerance },
                      { label: 'Dielectric', value: p.dielectric },
                      { label: 'ESR', value: p.esr },
                      { label: 'Ripple Current', value: p.rippleCurrent },
                      { label: 'Operating Temperature', value: p.temperature || p.operatingTemp },
                      { label: 'Case Size', value: p.caseSize },
                      { label: 'Dimensions', value: p.dimensions },
                      { label: 'Mounting Style', value: p.mounting || p.mountingType },
                      { label: 'Termination', value: p.termination },
                      { label: 'Technology', value: p.technology },
                      { label: 'Temp. Coefficient', value: p.tempCoefficient || p.temperatureCoefficient },
                      { label: 'Resistance', value: p.resistance },
                      { label: 'Power Rating', value: p.powerRating },
                    ].filter(r => r.value);
                    if (rows.length === 0) return null;
                    return (
                      <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-amber-500/5 border-b border-border">
                          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Component Attributes</p>
                        </div>
                        <div className="divide-y divide-border/50">
                          {rows.map(row => (
                            <div key={row.label} className="flex px-4 py-2.5 gap-4 hover:bg-muted/20 transition-colors">
                              <span className="text-sm text-muted-foreground w-52 flex-shrink-0">{row.label}</span>
                              <span className="text-sm font-medium">{String(row.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Datasheet (PDF)
                  </Button>
                </motion.div>
              )}

              {selectedTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {(product.reviews || []).length > 0 ? (
                    (product.reviews || []).map((review: any) => (
                      <div key={review.id} className="p-4 bg-card border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{review.userName}</p>
                            <p className="text-xs text-muted-foreground">Verified Purchase</p>
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
                        <p className="text-foreground/80 mb-2">{review.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>


        </div>
      </main>
      <Footer />
    </>
  );
}
