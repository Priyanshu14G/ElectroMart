'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, User, X, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useAuth } from '@/lib/providers/auth-provider';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'business_owner' | 'admin' | 'moderator';
  avatar?: string;
}

export function Header() {
  const router = useRouter();
  const authContext = useAuth();
  const { user, isAuthenticated, logout } = authContext || { user: null, isAuthenticated: false, logout: () => {} };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg">ElectroMart</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search components, suppliers..."
                className="pl-10 pr-4 bg-muted border-0 focus:ring-2 ring-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/search" className="px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                Marketplace
              </Link>
              <button className="px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors flex items-center gap-1">
                Categories <ChevronDown className="h-3 w-3" />
              </button>
              <Link href="/community" className="px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                Community
              </Link>
            </nav>

            {/* Action Icons */}
            {isAuthenticated && (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </>
            )}

            <ThemeToggle />

            {/* User Menu or Auth Buttons */}
            {mounted && isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="hidden sm:inline text-sm">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <nav className="py-2">
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted">
                        My Profile
                      </Link>
                      {user?.role === 'business_owner' && (
                        <Link href="/business/dashboard" className="block px-4 py-2 text-sm hover:bg-muted">
                          Business Dashboard
                        </Link>
                      )}
                      {user?.role === 'customer' && (
                        <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-muted">
                          My Dashboard
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-muted">
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-muted">
                        Wishlist
                      </Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-muted">
                        Orders
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-muted">
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-red-600"
                      >
                        Logout
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : mounted ? (
              <div className="hidden sm:flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            ) : null}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 bg-muted border-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-muted/50 border-t border-border">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
            <Link href="/search" className="px-3 py-2 hover:bg-background rounded-lg">
              Marketplace
            </Link>
            <Link href="/community" className="px-3 py-2 hover:bg-background rounded-lg">
              Community
            </Link>
            {!isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    router.push('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="justify-start"
                  onClick={() => {
                    router.push('/signup');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
