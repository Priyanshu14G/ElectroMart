'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Package,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Tag,
  Check,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/lib/providers/wishlist-provider';
import { useCart } from '@/lib/providers/cart-provider';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist, totalWishlistItems, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  const [addedCartIds, setAddedCartIds] = useState<{ [key: string]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.minOrderQuantity || 1,
      image: item.image,
      brand: item.brand,
      category: item.category,
      minOrderQuantity: item.minOrderQuantity || 1,
      stock: item.stock,
      leadTime: item.leadTime,
    });

    setAddedCartIds((prev) => ({ ...prev, [item.id]: true }));
    showToast(`Added "${item.name}" to your cart.`);
    setTimeout(() => {
      setAddedCartIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleRemove = (id: string, name: string) => {
    removeFromWishlist(id);
    showToast(`Removed "${name}" from your wishlist.`);
  };

  if (!isLoaded) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading wishlist...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
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

          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                <Heart className="h-8 w-8 fill-red-500 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalWishlistItems > 0
                  ? `You have saved ${totalWishlistItems} ${totalWishlistItems === 1 ? 'component' : 'components'} for later`
                  : 'Your wishlist is currently empty'}
              </p>
            </div>

            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlist}
                className="text-destructive hover:bg-destructive/10 border-border gap-1.5 self-start sm:self-auto"
              >
                <Trash2 className="h-4 w-4" />
                Clear Wishlist
              </Button>
            )}
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500">
                <Heart className="h-10 w-10 fill-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Explore thousands of electronic components, semiconductors, and sensors. Click the heart icon on any
                product card to save it to your wishlist.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/search">
                  <Button size="lg" className="gap-2">
                    Browse Marketplace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button size="lg" variant="outline" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    View My Cart
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Wishlist Items Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden border-b border-border">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-muted/60">
                          📦
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id, item.name)}
                        className="absolute top-2.5 right-2.5 p-2 bg-background/90 hover:bg-destructive hover:text-white text-muted-foreground rounded-full transition shadow-sm backdrop-blur-sm"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {item.category && (
                        <span className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-md border border-border capitalize">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-5">
                      {item.brand && (
                        <span className="text-xs text-muted-foreground font-medium block mb-1">
                          Brand: {item.brand}
                        </span>
                      )}
                      <Link href={`/product/${item.id}`}>
                        <h3 className="font-semibold text-base text-foreground line-clamp-2 hover:text-primary transition" title={item.name}>
                          {item.name}
                        </h3>
                      </Link>

                      <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-border/60">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            MOQ: {item.minOrderQuantity || 1} units
                          </span>
                        </div>
                        {item.stock !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              item.stock > 10
                                ? 'bg-green-500/10 text-green-600'
                                : item.stock > 0
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-red-500/10 text-red-600'
                            }`}
                          >
                            {item.stock > 10 ? 'In Stock' : item.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex gap-2">
                    <Button
                      className={`w-full gap-2 transition font-semibold ${
                        addedCartIds[item.id] ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                      }`}
                      onClick={() => handleAddToCart(item)}
                    >
                      {addedCartIds[item.id] ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Move to Cart
                        </>
                      )}
                    </Button>
                    <Link href={`/product/${item.id}`} target="_blank">
                      <Button variant="outline" size="icon" title="View Product">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
