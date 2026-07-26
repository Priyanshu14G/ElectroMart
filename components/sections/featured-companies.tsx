'use client';

import { motion } from 'framer-motion';

const companies = [
  { name: 'TechCorp Solutions', logo: '🔧' },
  { name: 'AutomationHub', logo: '⚙️' },
  { name: 'IoT Innovations', logo: '🌐' },
  { name: 'DigitalSystems Inc', logo: '💻' },
  { name: 'ElectronicsPlus', logo: '⚡' },
  { name: 'SmartComponents', logo: '🎯' },
];

export function FeaturedCompanies() {
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Leading Companies</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Over 10,000 businesses rely on ElectroMart for their component procurement needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {companies.map((company, idx) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="flex items-center justify-center p-6 bg-background rounded-lg border border-border hover:shadow-lg transition-all"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{company.logo}</div>
                <p className="text-sm font-medium text-muted-foreground">{company.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
