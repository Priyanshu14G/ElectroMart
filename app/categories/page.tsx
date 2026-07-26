'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Cpu, Radio, Gauge, Lightbulb, Wifi, Gamepad2, Settings,
  Wrench, Microscope, Battery, Puzzle, ToggleLeft, Layers,
  CircuitBoard, Cable, FlaskConical, Magnet, Box, Radar,
  Search, ArrowRight, TrendingUp,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Input } from '@/components/ui/input';
import { getCategories, type ApiCategory } from '@/lib/api';

/* ─── Icon & colour map ───────────────────────────────────────────── */
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  battery:              { icon: <Battery className="h-8 w-8" />,      color: '#f59e0b', gradient: 'from-amber-500/20 to-amber-600/5' },
  capacitor:            { icon: <Zap className="h-8 w-8" />,          color: '#8b5cf6', gradient: 'from-violet-500/20 to-violet-600/5' },
  resistor:             { icon: <Radio className="h-8 w-8" />,         color: '#06b6d4', gradient: 'from-cyan-500/20 to-cyan-600/5' },
  diode:                { icon: <Zap className="h-8 w-8" />,           color: '#ec4899', gradient: 'from-pink-500/20 to-pink-600/5' },
  ic:                   { icon: <Cpu className="h-8 w-8" />,           color: '#3b82f6', gradient: 'from-blue-500/20 to-blue-600/5' },
  microcontroller:      { icon: <Cpu className="h-8 w-8" />,           color: '#6366f1', gradient: 'from-indigo-500/20 to-indigo-600/5' },
  connector:            { icon: <Puzzle className="h-8 w-8" />,        color: '#14b8a6', gradient: 'from-teal-500/20 to-teal-600/5' },
  sensor:               { icon: <Gauge className="h-8 w-8" />,         color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  led:                  { icon: <Lightbulb className="h-8 w-8" />,    color: '#f97316', gradient: 'from-orange-500/20 to-orange-600/5' },
  motor:                { icon: <Settings className="h-8 w-8" />,      color: '#64748b', gradient: 'from-slate-500/20 to-slate-600/5' },
  display:              { icon: <Microscope className="h-8 w-8" />,    color: '#0ea5e9', gradient: 'from-sky-500/20 to-sky-600/5' },
  relay:                { icon: <Wrench className="h-8 w-8" />,        color: '#78716c', gradient: 'from-stone-500/20 to-stone-600/5' },
  mosfet:               { icon: <Layers className="h-8 w-8" />,        color: '#a855f7', gradient: 'from-purple-500/20 to-purple-600/5' },
  transformer:          { icon: <Magnet className="h-8 w-8" />,        color: '#ef4444', gradient: 'from-red-500/20 to-red-600/5' },
  switch:               { icon: <ToggleLeft className="h-8 w-8" />,    color: '#22c55e', gradient: 'from-green-500/20 to-green-600/5' },
  inductor:             { icon: <CircuitBoard className="h-8 w-8" />,  color: '#d946ef', gradient: 'from-fuchsia-500/20 to-fuchsia-600/5' },
  crystal:              { icon: <FlaskConical className="h-8 w-8" />,  color: '#7dd3fc', gradient: 'from-sky-300/20 to-sky-400/5' },
  fuse:                 { icon: <Zap className="h-8 w-8" />,           color: '#fb923c', gradient: 'from-orange-400/20 to-orange-500/5' },
  pcb:                  { icon: <CircuitBoard className="h-8 w-8" />,  color: '#4ade80', gradient: 'from-green-400/20 to-green-500/5' },
  cable:                { icon: <Cable className="h-8 w-8" />,         color: '#94a3b8', gradient: 'from-slate-400/20 to-slate-500/5' },
  development_board:    { icon: <Cpu className="h-8 w-8" />,           color: '#6366f1', gradient: 'from-indigo-500/20 to-indigo-600/5' },
  robotics:             { icon: <Gamepad2 className="h-8 w-8" />,      color: '#f43f5e', gradient: 'from-rose-500/20 to-rose-600/5' },
  iot:                  { icon: <Wifi className="h-8 w-8" />,          color: '#06b6d4', gradient: 'from-cyan-500/20 to-cyan-600/5' },
  rf_component:         { icon: <Radar className="h-8 w-8" />,         color: '#84cc16', gradient: 'from-lime-500/20 to-lime-600/5' },
  test_equipment:       { icon: <Gauge className="h-8 w-8" />,         color: '#fbbf24', gradient: 'from-yellow-500/20 to-yellow-600/5' },
  embedded_board:       { icon: <CircuitBoard className="h-8 w-8" />,  color: '#818cf8', gradient: 'from-indigo-400/20 to-indigo-500/5' },
  power_electronics:    { icon: <Zap className="h-8 w-8" />,           color: '#f59e0b', gradient: 'from-amber-500/20 to-amber-600/5' },
  industrial_automation:{ icon: <Settings className="h-8 w-8" />,      color: '#475569', gradient: 'from-slate-600/20 to-slate-700/5' },
  passive_component:    { icon: <Layers className="h-8 w-8" />,        color: '#a3a3a3', gradient: 'from-neutral-400/20 to-neutral-500/5' },
  semiconductor:        { icon: <Cpu className="h-8 w-8" />,           color: '#6366f1', gradient: 'from-indigo-500/20 to-indigo-600/5' },
  other:                { icon: <Box className="h-8 w-8" />,           color: '#9ca3af', gradient: 'from-gray-400/20 to-gray-500/5' },
};

const DEFAULT_META = { icon: <Cpu className="h-8 w-8" />, color: '#6366f1', gradient: 'from-indigo-500/20 to-indigo-600/5' };

/* ─── Component ───────────────────────────────────────────────────── */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">

        {/* ── Hero Banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b border-border py-16">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <TrendingUp className="h-4 w-4" />
                {categories.length} Categories Available
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Browse by <span className="text-primary">Category</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Explore {totalProducts.toLocaleString()}+ electronic components across {categories.length} categories — from resistors to robotics kits.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl border-border/80 bg-background/80 backdrop-blur"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Categories Grid ── */}
        <section className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No categories found</h2>
              <p className="text-muted-foreground">Try a different search term.</p>
            </div>
          ) : (
            <>
              {search && (
                <p className="text-muted-foreground mb-6 text-sm">
                  Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filtered.map((cat, idx) => {
                  const meta = CATEGORY_META[cat.id] || DEFAULT_META;
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.03 }}
                    >
                      <Link href={`/search?category=${cat.id}`}>
                        <div className={`group relative p-5 rounded-2xl bg-gradient-to-br ${meta.gradient} border border-border hover:border-[${meta.color}]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center h-full`}>
                          {/* Icon */}
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                            style={{ color: meta.color, backgroundColor: `${meta.color}18` }}
                          >
                            {meta.icon}
                          </div>

                          {/* Name */}
                          <h3 className="font-semibold text-sm leading-tight mb-2 group-hover:text-primary transition-colors">
                            {cat.name}
                          </h3>

                          {/* Count badge */}
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                          >
                            {cat.count.toLocaleString()} items
                          </span>

                          {/* Hover arrow */}
                          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            Browse <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ── Stats Row ── */}
        {!loading && categories.length > 0 && (
          <section className="border-t border-border bg-muted/30 py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {[
                  { label: 'Categories', value: categories.length },
                  { label: 'Total Products', value: totalProducts.toLocaleString() },
                  { label: 'Avg per Category', value: Math.round(totalProducts / Math.max(categories.length, 1)) },
                  { label: 'Verified Suppliers', value: '500+' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
