'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-100 mt-20">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary to-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Stay Updated</h3>
            <p className="text-white/90 mb-6">Get latest components, supplier updates, and industry news delivered to your inbox.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                required
              />
              <Button className="bg-white text-primary hover:bg-white/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h3 className="font-bold text-lg">ElectroMart</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              India&apos;s trusted B2B marketplace connecting electronics manufacturers, OEMs, and component suppliers.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Heart className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-bold mb-4">Marketplace</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/search" className="block hover:text-primary transition-colors">
                Browse Components
              </Link>
              <Link href="/suppliers" className="block hover:text-primary transition-colors">
                Find Suppliers
              </Link>
              <Link href="/rfq" className="block hover:text-primary transition-colors">
                Request Quote
              </Link>
              <Link href="/deals" className="block hover:text-primary transition-colors">
                Best Deals
              </Link>
              <Link href="/trending" className="block hover:text-primary transition-colors">
                Trending Now
              </Link>
            </nav>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-bold mb-4">For Buyers</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/how-it-works" className="block hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/become-buyer" className="block hover:text-primary transition-colors">
                Register as Buyer
              </Link>
              <Link href="/bulk-orders" className="block hover:text-primary transition-colors">
                Bulk Orders
              </Link>
              <Link href="/buyer-protection" className="block hover:text-primary transition-colors">
                Buyer Protection
              </Link>
            </nav>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-bold mb-4">For Sellers</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/business/register" className="block hover:text-primary transition-colors">
                Register as Seller
              </Link>
              <Link href="/seller-guide" className="block hover:text-primary transition-colors">
                Seller Guide
              </Link>
              <Link href="/pricing" className="block hover:text-primary transition-colors">
                Pricing Plans
              </Link>
              <Link href="/seller-dashboard" className="block hover:text-primary transition-colors">
                Seller Dashboard
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <nav className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">+91-1234-567-890</p>
                  <p className="text-slate-400">Mon-Fri, 9AM-6PM IST</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@electromart.com" className="hover:text-primary transition-colors">
                  support@electromart.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Tech Park, Bangalore</p>
                  <p className="text-slate-400">Karnataka, India</p>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Footer Links */}
        <div className="border-t border-slate-700 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 text-sm">
            <Link href="/about" className="hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400">
            <p>&copy; 2024 ElectroMart India. All rights reserved.</p>
            <p>Made with ⚡ for the electronics community</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
