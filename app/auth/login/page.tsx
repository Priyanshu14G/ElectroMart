'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import { authUtils } from '@/lib/utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        // Fetch real user details from MongoDB database
        let dbUser = null;
        try {
          const userRes = await fetch('/api/auth/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            dbUser = userData.user;
          }
        } catch (e) {
          console.warn('Could not fetch DB user profile:', e);
        }

        const namePart = email.split('@')[0] || 'User';
        const fallbackName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const resolvedRole = dbUser?.role || (email.includes('business') ? 'business_owner' : 'customer');

        authUtils.setCurrentUser({
          id: dbUser?.id || email,
          email: dbUser?.email || email,
          name: dbUser?.name || fallbackName,
          role: resolvedRole,
          avatar: dbUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dbUser?.name || fallbackName)}`,
          createdAt: dbUser?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Role-based redirect: sellers go to seller dashboard, customers to customer dashboard
        if (resolvedRole === 'business_owner' || resolvedRole === 'seller') {
          router.push('/seller/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your ElectroMart India account</p>
            </div>

            {/* Demo Credentials Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-400 font-semibold mb-1">Demo Credentials</p>
              <p className="text-xs text-blue-800 dark:text-blue-300">📧 customer@example.com</p>
              <p className="text-xs text-blue-800 dark:text-blue-300">🔑 customer123</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Don&apos;t have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full h-11">
                Create New Account
              </Button>
            </Link>

            {/* Footer Links */}
            <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
              <p>
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </p>
              <p>
                Looking to sell?{' '}
                <Link href="/auth/business-signup" className="text-primary hover:underline font-semibold">
                  Register as a seller
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-primary mb-1">10K+</p>
              <p className="text-muted-foreground">Components</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary mb-1">500+</p>
              <p className="text-muted-foreground">Suppliers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary mb-1">50K+</p>
              <p className="text-muted-foreground">Users</p>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
