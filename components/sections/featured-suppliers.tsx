'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSuppliers, type ApiSupplier } from '@/lib/api';
import { mockSuppliers } from '@/lib/mock-data';

export function FeaturedSuppliers() {
  const [featured, setFeatured] = useState<ApiSupplier[]>(mockSuppliers.slice(0, 3) as any);

  useEffect(() => {
    getSuppliers({ verified: true, limit: 3 })
      .then((res) => setFeatured(res.suppliers.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Suppliers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted partners delivering quality components with excellent service and support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {featured.map((supplier, idx) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/supplier/${supplier.id}`}>
                <div className="group bg-muted rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Banner */}
                  <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
                    <img
                      src={supplier.banner}
                      alt={supplier.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Logo & Name */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                        <img
                          src={supplier.logo}
                          alt={supplier.name}
                          className="w-8 h-8"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {supplier.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(supplier.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {supplier.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {supplier.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {supplier.badges?.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      )}
                      {supplier.badges?.topRated && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                          <TrendingUp className="h-3 w-3" /> Top Rated
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-t border-border text-xs">
                      <div>
                        <p className="text-muted-foreground">Response Rate</p>
                        <p className="font-bold text-green-600 dark:text-green-400">{supplier.stats?.responseRate || 99}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Orders</p>
                        <p className="font-bold">{(supplier.stats?.ordersCompleted || 500).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {supplier.address?.city && (
                      <div className="flex items-center gap-2 mb-4 text-xs">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{supplier.address.city}, {supplier.address.state}</span>
                      </div>
                    )}

                    {/* Button */}
                    <Button className="w-full mt-auto" size="sm">
                      View Products
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
          <Link href="/suppliers" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            Browse All Suppliers →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
