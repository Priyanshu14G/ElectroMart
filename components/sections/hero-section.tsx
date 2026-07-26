'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const suggestions = [
    'STM32F103RB Microcontroller',
    '470µF Capacitor',
    '10kΩ Resistor',
    'DHT22 Sensor',
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-b from-primary/5 to-transparent">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">India&apos;s Electronics Marketplace</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance">
            Find Electronic Components{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              from Verified Suppliers
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Connect with 500+ verified electronics suppliers. Discover semiconductors, microcontrollers, sensors, and components with competitive pricing and fast delivery.
          </p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSearch}
            className="mb-8"
          >
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-xl -z-10"></div>
              <div className="relative bg-background border border-primary/20 rounded-2xl p-2 flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground ml-4" />
                <Input
                  type="text"
                  placeholder="Search: 'STM32F103', '470µF Capacitor', 'DHT22'..."
                  className="flex-1 border-0 bg-transparent focus:ring-0 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  className="bg-gradient-primary text-white rounded-lg mr-1 gap-2"
                >
                  Search <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.form>

          {/* Search Suggestions */}
          <div className="mb-12">
            <p className="text-sm text-muted-foreground mb-4">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map((suggestion, idx) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                  }}
                  className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors text-sm"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-gradient-primary text-white gap-2"
              onClick={() => router.push('/search')}
            >
              Browse Marketplace <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/auth/business-signup')}
            >
              Register as Supplier
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-12 border-t border-border grid grid-cols-3 gap-8"
          >
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <p className="text-sm text-muted-foreground">Verified Suppliers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">50k+</div>
              <p className="text-sm text-muted-foreground">Components</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">10k+</div>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
