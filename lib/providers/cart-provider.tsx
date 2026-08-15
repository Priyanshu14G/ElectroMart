'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/providers/auth-provider';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
  manufacturer?: string;
  supplierName?: string;
  minOrderQuantity?: number;
  stock?: number;
  category?: string;
  leadTime?: string;
  packaging?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number; images?: string[] }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  discountCode: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  total: number;
  isLoaded: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Guest cart key (unauthenticated users). */
const GUEST_CART_KEY = 'electromart_cart_guest';

function couponKey(userId: string) {
  return `electromart_coupon_${userId}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a DB CartItem (has `productId`) to the local CartItem shape (uses `id`). */
function dbItemToLocal(dbItem: any): CartItem {
  return {
    id: dbItem.productId ?? dbItem.id,
    name: dbItem.name,
    price: Number(dbItem.price) || 0,
    quantity: Number(dbItem.quantity) || 1,
    image: dbItem.image ?? '',
    brand: dbItem.brand ?? '',
    manufacturer: dbItem.manufacturer ?? '',
    supplierName: dbItem.supplierName ?? 'ElectroMart Verified',
    minOrderQuantity: Number(dbItem.minOrderQuantity) || 1,
    stock: Number(dbItem.stock) || 100,
    category: dbItem.category ?? '',
    leadTime: dbItem.leadTime ?? '2-4 business days',
    packaging: dbItem.packaging ?? 'Standard packaging',
  };
}

/** Merge guest items into existing DB items. Guest items increment existing quantities; new items are appended. */
function mergeItems(dbItems: CartItem[], guestItems: CartItem[]): CartItem[] {
  const merged = [...dbItems];
  for (const guestItem of guestItems) {
    const idx = merged.findIndex((i) => i.id === guestItem.id);
    if (idx > -1) {
      const maxStock = merged[idx].stock || 9999;
      merged[idx] = {
        ...merged[idx],
        quantity: Math.min(merged[idx].quantity + guestItem.quantity, maxStock),
      };
    } else {
      merged.push(guestItem);
    }
  }
  return merged;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Track the last userId we loaded for so we don't double-fetch
  const lastLoadedUserId = useRef<string | null | undefined>(undefined);

  // ── Coupon helpers ──────────────────────────────────────────────────────────

  const loadCoupon = useCallback((uid: string | null) => {
    try {
      const key = uid ? couponKey(uid) : '';
      const saved = key ? localStorage.getItem(key) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        setDiscountCode(parsed.code || '');
        setDiscountPercent(parsed.percent || 0);
      } else {
        setDiscountCode('');
        setDiscountPercent(0);
      }
    } catch {
      setDiscountCode('');
      setDiscountPercent(0);
    }
  }, []);

  // ── Cart loading ────────────────────────────────────────────────────────────

  const loadCart = useCallback(async (uid: string | null) => {
    setIsLoaded(false);

    if (!uid) {
      // Guest — load from localStorage
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        setItems(saved ? JSON.parse(saved) : []);
      } catch {
        setItems([]);
      }
      loadCoupon(null);
      setIsLoaded(true);
      return;
    }

    // Authenticated — fetch from DB
    try {
      // Read any guest items that were in localStorage before login
      let guestItems: CartItem[] = [];
      try {
        const guestRaw = localStorage.getItem(GUEST_CART_KEY);
        if (guestRaw) {
          guestItems = JSON.parse(guestRaw);
        }
      } catch { /* ignore */ }

      const res = await fetch(`/api/cart?userId=${uid}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const dbItems: CartItem[] = (data.items ?? []).map(dbItemToLocal);

      if (guestItems.length > 0) {
        // Merge guest items into DB cart
        const merged = mergeItems(dbItems, guestItems);
        // Persist the merged cart back to DB
        const putRes = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, items: merged }),
        });
        const putData = putRes.ok ? await putRes.json() : null;
        setItems(putData?.items ? putData.items.map(dbItemToLocal) : merged);
        // Clear the guest cart now that it's been merged
        localStorage.removeItem(GUEST_CART_KEY);
      } else {
        setItems(dbItems);
      }
    } catch (error) {
      console.warn('CartProvider: Failed to fetch cart from DB, using empty cart', error);
      setItems([]);
    }

    loadCoupon(uid);
    setIsLoaded(true);
  }, [loadCoupon]);

  // ── React to auth changes ───────────────────────────────────────────────────

  useEffect(() => {
    // Only reload when userId actually changes (avoids infinite loops)
    if (userId === lastLoadedUserId.current) return;
    lastLoadedUserId.current = userId;
    loadCart(userId);
  }, [userId, loadCart]);

  // ── Persist guest cart to localStorage ──────────────────────────────────────

  useEffect(() => {
    if (!isLoaded) return;
    if (userId) return; // authenticated users are persisted via API calls
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('cart-change'));
    } catch { /* ignore */ }
  }, [items, isLoaded, userId]);

  // ── Mutations ───────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    (newItem: Omit<CartItem, 'quantity'> & { quantity?: number; images?: string[] }) => {
      const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : (newItem.minOrderQuantity || 1);
      const resolvedImage =
        newItem.image ||
        (Array.isArray(newItem.images) && newItem.images[0] ? newItem.images[0] : '') ||
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60';

      const itemForApi = {
        productId: newItem.id,
        name: newItem.name,
        price: Number(newItem.price) || 0,
        quantity: qtyToAdd,
        image: resolvedImage,
        brand: newItem.brand || '',
        manufacturer: newItem.manufacturer || newItem.brand || '',
        supplierName: newItem.supplierName || 'ElectroMart Verified',
        minOrderQuantity: newItem.minOrderQuantity || 1,
        stock: newItem.stock !== undefined ? newItem.stock : 100,
        category: newItem.category || '',
        leadTime: newItem.leadTime || '2-4 business days',
        packaging: newItem.packaging || 'Standard packaging',
      };

      // Optimistic local update
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === newItem.id);
        if (idx > -1) {
          const updated = [...prev];
          const maxStock = updated[idx].stock || 9999;
          updated[idx] = { ...updated[idx], quantity: Math.min(updated[idx].quantity + qtyToAdd, maxStock) };
          return updated;
        }
        return [...prev, { ...itemForApi, id: newItem.id }];
      });

      // Persist to DB if logged in
      if (userId) {
        fetch('/api/cart/item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, item: itemForApi }),
        }).catch((err) => console.warn('addToCart DB sync failed', err));
      }

      window.dispatchEvent(new Event('cart-change'));
    },
    [userId]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));

      if (userId) {
        fetch('/api/cart/item', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: id }),
        }).catch((err) => console.warn('removeFromCart DB sync failed', err));
      }

      window.dispatchEvent(new Event('cart-change'));
    },
    [userId]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const maxStock = item.stock || 9999;
            return { ...item, quantity: Math.max(1, Math.min(quantity, maxStock)) };
          }
          return item;
        })
      );

      if (userId) {
        fetch('/api/cart/item', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: id, quantity }),
        }).catch((err) => console.warn('updateQuantity DB sync failed', err));
      }

      window.dispatchEvent(new Event('cart-change'));
    },
    [userId, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountCode('');
    setDiscountPercent(0);

    if (userId) {
      // Clear in DB
      fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).catch((err) => console.warn('clearCart DB sync failed', err));
      try { localStorage.removeItem(couponKey(userId)); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem(GUEST_CART_KEY); } catch { /* ignore */ }
    }

    window.dispatchEvent(new Event('cart-change'));
  }, [userId]);

  // ── Coupon ──────────────────────────────────────────────────────────────────

  const applyCoupon = useCallback(
    (code: string): boolean => {
      const clean = code.trim().toUpperCase();
      let percent = 0;
      if (clean === 'ELECTRO10' || clean === 'WELCOME10') percent = 10;
      else if (clean === 'MEGA20' || clean === 'ELECTRO20') percent = 20;

      if (percent > 0) {
        setDiscountCode(clean);
        setDiscountPercent(percent);
        if (userId) {
          try { localStorage.setItem(couponKey(userId), JSON.stringify({ code: clean, percent })); } catch { /* ignore */ }
        }
        return true;
      }
      return false;
    },
    [userId]
  );

  const removeCoupon = useCallback(() => {
    setDiscountCode('');
    setDiscountPercent(0);
    if (userId) {
      try { localStorage.removeItem(couponKey(userId)); } catch { /* ignore */ }
    }
  }, [userId]);

  // ── Derived values ──────────────────────────────────────────────────────────

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const tax = taxableSubtotal * 0.18; // 18% GST
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99; // Free shipping above ₹999
  const total = taxableSubtotal + tax + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        tax,
        shipping,
        discount,
        discountCode,
        applyCoupon,
        removeCoupon,
        total,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
