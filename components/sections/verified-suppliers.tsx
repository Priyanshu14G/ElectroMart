'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Shield, Truck, Award } from 'lucide-react';

export function VerifiedSuppliers() {
  const features = [
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Verified Suppliers',
      description: 'All suppliers go through strict verification and compliance checks',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Quality Assured',
      description: 'Products come with certifications: ISO, RoHS, CE, and more',
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Fast Delivery',
      description: 'Average delivery time of 2-3 days across India',
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Best Prices',
      description: 'Competitive pricing with bulk order discounts available',
    },
  ];

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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why ElectroMart?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We ensure quality, reliability, and transparency in every transaction.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-muted rounded-lg hover:shadow-lg transition-all text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
