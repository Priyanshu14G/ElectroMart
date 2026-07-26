'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Cpu,
  Radio,
  Gauge,
  Lightbulb,
  Wifi,
  Gamepad2,
  Settings,
  Wrench,
  Microscope,
  Battery,
  Puzzle,
} from 'lucide-react';
import { getCategories, type ApiCategory } from '@/lib/api';

const categoryIcons: Record<string, React.ReactNode> = {
  battery: <Battery className="h-8 w-8" />,
  capacitor: <Zap className="h-8 w-8" />,
  resistor: <Radio className="h-8 w-8" />,
  ic: <Cpu className="h-8 w-8" />,
  microcontroller: <Cpu className="h-8 w-8" />,
  connector: <Puzzle className="h-8 w-8" />,
  sensor: <Gauge className="h-8 w-8" />,
  led: <Lightbulb className="h-8 w-8" />,
  iot: <Wifi className="h-8 w-8" />,
  robotics: <Gamepad2 className="h-8 w-8" />,
  display: <Microscope className="h-8 w-8" />,
  motor: <Settings className="h-8 w-8" />,
  development_board: <Cpu className="h-8 w-8" />,
  relay: <Wrench className="h-8 w-8" />,
};

export function PopularCategories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayCategories = categories.slice(0, 12);

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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Popular Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our comprehensive collection of electronic components organized by category.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href={`/search?category=${category.id}`}>
                <div className="group p-6 bg-background border border-border rounded-xl hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center">
                  <div className="mb-4 text-primary group-hover:scale-110 transition-transform">
                    {categoryIcons[category.id] || <Cpu className="h-8 w-8" />}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {category.count.toLocaleString()}
                  </p>
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
          className="text-center mt-10"
        >
          <Link href="/categories" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
            View All Categories →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
