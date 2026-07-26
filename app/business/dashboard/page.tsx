'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Users, MessageSquare, Plus } from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';

export default function BusinessDashboard() {
  const stats = [
    { label: 'Active Products', value: 156, icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'This Month Sales', value: '₹4.2L', icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'New Orders', value: 24, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Messages', value: 12, icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Business Dashboard</h1>
            <Link href="/seller/add-product">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{1000 + i}</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm">Completed</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/seller/add-product" className="block w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors text-center font-medium">
                  Add Product
                </Link>
                <Link href="/seller/products" className="block w-full bg-muted p-3 rounded-lg hover:bg-muted/80 transition-colors text-center font-medium">
                  View Products
                </Link>
                <Link href="/seller/orders" className="block w-full bg-muted p-3 rounded-lg hover:bg-muted/80 transition-colors text-center font-medium">
                  View Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
