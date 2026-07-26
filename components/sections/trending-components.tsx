'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts, type ApiProduct } from '@/lib/api';

export function TrendingComponents() {
  const [trending, setTrending] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 6, sort: 'rating_desc' })
      .then((res) => setTrending(res.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-9 w-64 bg-muted animate-pulse rounded mx-auto mb-4" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-background rounded-lg border border-border h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trending Components</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Most popular components this month based on demand and customer reviews.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trending.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/product/${product.id}`}>
                <div className="group bg-background rounded-lg border border-border hover:shadow-lg hover:border-primary/50 transition-all overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src={Array.isArray(product.images) ? product.images[0] : ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {product.category}
                      </span>
                      {product.reviewCount && product.rating && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-muted-foreground">({product.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-3 pb-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-bold">₹{product.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">MOQ</p>
                        <p className="font-bold">{product.minOrderQuantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lead Time</p>
                        <p className="font-bold text-xs">{product.leadTime}</p>
                      </div>
                    </div>

                    <Button size="sm" className="w-full gap-2 mt-auto">
                      <ShoppingCart className="h-4 w-4" /> Quote
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/search?sort=trending" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            See More Trending Components →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
