'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  brand?: string;
  manufacturer?: string;
  category?: string;
  stock?: number;
  minOrderQuantity?: number;
  leadTime?: string;
  rating?: number;
  reviewCount?: number;
  supplier?: any;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => boolean; // returns true if added, false if removed
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalWishlistItems: number;
  isLoaded: boolean;
}

const WISHLIST_STORAGE_KEY = 'electromart_wishlist_items';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error loading wishlist from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('wishlist-change'));
    } catch (e) {
      console.warn('Error saving wishlist to localStorage', e);
    }
  }, [items, isLoaded]);

  const addToWishlist = (newItem: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === newItem.id)) {
        return prev;
      }
      const resolvedImage =
        newItem.image ||
        (Array.isArray(newItem.images) && newItem.images[0] ? newItem.images[0] : '') ||
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60';

      return [
        ...prev,
        {
          ...newItem,
          image: resolvedImage,
        },
      ];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleWishlist = (item: WishlistItem): boolean => {
    const exists = items.some((i) => i.id === item.id);
    if (exists) {
      removeFromWishlist(item.id);
      return false;
    } else {
      addToWishlist(item);
      return true;
    }
  };

  const isInWishlist = (id: string): boolean => {
    return items.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    setItems([]);
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
      window.dispatchEvent(new Event('wishlist-change'));
    } catch {}
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        totalWishlistItems: items.length,
        isLoaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
