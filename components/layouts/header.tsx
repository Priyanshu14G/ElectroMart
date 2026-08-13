'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, Heart, User, X, Bell, MessageSquare, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useAuth } from '@/lib/providers/auth-provider';
import { useCart } from '@/lib/providers/cart-provider';
import { useWishlist } from '@/lib/providers/wishlist-provider';
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
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
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
              <Link href="/community" className="px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                Community
              </Link>
            </nav>

            {/* Wishlist Button */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-red-500/10 hover:text-red-500 transition"
                title="View My Wishlist"
              >
                <Heart className="h-5 w-5" />
                {mounted && totalWishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                    {totalWishlistItems > 99 ? '99+' : totalWishlistItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Shopping Cart Button */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 hover:text-primary transition"
                title="View My Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Action Icons for Logged In User */}
            {isAuthenticated && (
              <>
                <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
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
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                    alt={user?.name || 'User'}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="hidden sm:inline text-sm font-medium">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-border bg-muted/40">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <nav className="py-2" onClick={() => setUserMenuOpen(false)}>
                      <Link href="/cart" className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted font-medium text-primary">
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" /> My Cart
                        </span>
                        {totalItems > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                      <Link href="/wishlist" className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted font-medium text-red-500">
                        <span className="flex items-center gap-2">
                          <Heart className="h-4 w-4" /> Wishlist
                        </span>
                        {totalWishlistItems > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {totalWishlistItems}
                          </span>
                        )}
                      </Link>
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted">
                        My Profile
                      </Link>
                      {user?.role === 'business_owner' && (
                        <Link href="/seller/dashboard" className="block px-4 py-2 text-sm hover:bg-muted">
                          Seller Dashboard
                        </Link>
                      )}
                      {user?.role === 'customer' && (
                        <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-muted">
                          Customer Dashboard
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/10 text-primary font-medium">
                          <Shield className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}
                      <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-muted">
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive font-medium border-t border-border mt-1"
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
              placeholder="Search components..."
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
            <Link
              href="/cart"
              className="px-3 py-2 hover:bg-background rounded-lg flex items-center justify-between font-medium text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> My Cart
              </span>
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              href="/wishlist"
              className="px-3 py-2 hover:bg-background rounded-lg flex items-center justify-between font-medium text-red-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> My Wishlist
              </span>
              {totalWishlistItems > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalWishlistItems}
                </span>
              )}
            </Link>
            <Link
              href="/search"
              className="px-3 py-2 hover:bg-background rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>

            <Link
              href="/community"
              className="px-3 py-2 hover:bg-background rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
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

