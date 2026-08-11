'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  Lock,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authUtils } from '@/lib/utils/auth';

export default function BusinessSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    legalName: '',
    businessType: 'trader',
    email: '',
    phone: '',
    gstNumber: '',
    location: '',
    state: '',
    city: '',
    description: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.businessName || !formData.legalName || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.gstNumber || !formData.location || !formData.city) {
        setError('Please fill in all required fields');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register the business user in MongoDB via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.businessName,
          role: 'business_owner',
          phone: formData.phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Step 2: Sign in with NextAuth so a session is created
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but login failed. Please log in manually.');
        router.push('/auth/login');
        return;
      }

      // Step 3: Store user in local authUtils session
      authUtils.setCurrentUser({
        id: data.user?.id || `biz_${Date.now()}`,
        email: formData.email,
        name: formData.businessName,
        role: 'business_owner',
        avatar: data.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.businessName)}`,
        createdAt: data.user?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push('/seller/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      s <= step
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="h-6 w-6" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 transition ${
                        s < step ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold mb-2">Seller Registration</h1>
              <p className="text-muted-foreground">
                {step === 1 && 'Tell us about your business'}
                {step === 2 && 'Provide business details and location'}
                {step === 3 && 'Set up your account'}
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-6">
              {/* Step 1: Business Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="businessName" className="text-sm font-medium block mb-2">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="Your business name"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="legalName" className="text-sm font-medium block mb-2">
                      Legal Business Name *
                    </label>
                    <Input
                      id="legalName"
                      name="legalName"
                      placeholder="Legal registered name"
                      value={formData.legalName}
                      onChange={handleChange}
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="businessType" className="text-sm font-medium block mb-2">
                      Business Type *
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full border border-border rounded-lg px-4 py-2.5 bg-background"
                    >
                      <option value="trader">Trader</option>
                      <option value="distributor">Distributor</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="retailer">Retailer</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="email" className="text-sm font-medium block mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="business@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="text-sm font-medium block mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91-9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="gstNumber" className="text-sm font-medium block mb-2">
                      GST Number *
                    </label>
                    <Input
                      id="gstNumber"
                      name="gstNumber"
                      placeholder="27AAXPT5055K1Z0"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="h-11 font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="text-sm font-medium block mb-2">
                        State *
                      </label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="text-sm font-medium block mb-2">
                        City *
                      </label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="text-sm font-medium block mb-2">
                      Full Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <textarea
                        id="location"
                        name="location"
                        placeholder="Enter your complete business address"
                        value={formData.location}
                        onChange={handleChange}
                        className="pl-10 w-full border border-border rounded-lg px-4 py-2 bg-background resize-none"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="text-sm font-medium block mb-2">
                      Business Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Tell us about your business, products, and experience"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-border rounded-lg px-4 py-2 bg-background resize-none"
                      rows={4}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Account Setup */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-400">
                      <span className="font-semibold">Email:</span> {formData.email}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="password" className="text-sm font-medium block mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="text-sm font-medium block mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded mt-0.5" required />
                    <span className="text-sm text-muted-foreground">
                      I agree to the Terms of Service and authorize ElectroMart to verify my business details
                    </span>
                  </label>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/2 h-11"
                    onClick={() => setStep(step - 1)}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`flex-1 h-11 ${step === 3 ? '' : ''}`}
                  disabled={loading}
                >
                  {step === 3 ? (
                    loading ? 'Creating Account...' : 'Complete Registration'
                  ) : (
                    'Next'
                  )}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Footer Links */}
              {step === 1 && (
                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p>
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </main>
    </>
  );
}
