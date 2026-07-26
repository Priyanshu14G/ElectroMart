'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I find components on ElectroMart?',
    a: 'Use our search bar to find components by part number, category, or specifications. Apply filters to narrow down results by manufacturer, price, lead time, and more.',
  },
  {
    q: 'How can I request a quote?',
    a: 'Click "Request Quote" on any product page. Fill in the quantity and add to RFQ. You can also create a bulk RFQ by uploading a BOM file.',
  },
  {
    q: 'Are all suppliers verified?',
    a: 'Yes, all suppliers on ElectroMart go through strict verification and compliance checks. They must provide GST certificates, certifications, and business documents.',
  },
  {
    q: 'What is the typical delivery time?',
    a: 'Average delivery time is 2-3 days across India. Some suppliers offer same-day or next-day delivery for in-stock items. Check each product listing for exact lead times.',
  },
  {
    q: 'How do I become a supplier?',
    a: 'Register as a business owner, complete your profile with documents (GST, certifications), and add your products. Our team will verify your details before listing.',
  },
  {
    q: 'Is there buyer protection?',
    a: 'Yes, we offer buyer protection policies. All transactions are secure, and we mediate disputes between buyers and sellers to ensure fair outcomes.',
  },
];

export function FAQSection() {
  const [expanded, setExpanded] = useState<number | null>(0);

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
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about using ElectroMart.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors text-left"
              >
                <span className="font-semibold">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    expanded === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expanded === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-muted/50 border-t border-border"
                  >
                    <div className="px-6 py-4 text-muted-foreground">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
