'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

const CART_STORAGE_KEY = 'electromart_cart_items';
const COUPON_STORAGE_KEY = 'electromart_cart_coupon';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        setDiscountCode(parsed.code || '');
        setDiscountPercent(parsed.percent || 0);
      }
    } catch (e) {
      console.warn('Error loading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('cart-change'));
    } catch (e) {
      console.warn('Error saving cart to localStorage', e);
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number; images?: string[] }) => {
    const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : (newItem.minOrderQuantity || 1);
    const resolvedImage =
      newItem.image ||
      (Array.isArray(newItem.images) && newItem.images[0] ? newItem.images[0] : '') ||
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60';

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === newItem.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + qtyToAdd;
        const maxStock = updated[existingIndex].stock || 9999;
        updated[existingIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: newItem.id,
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
          },
        ];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxStock = item.stock || 9999;
          const minQty = 1;
          const targetQty = Math.max(minQty, Math.min(quantity, maxStock));
          return { ...item, quantity: targetQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
    setDiscountPercent(0);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
      window.dispatchEvent(new Event('cart-change'));
    } catch {}
  };

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ELECTRO10' || clean === 'WELCOME10') {
      setDiscountCode(clean);
      setDiscountPercent(10);
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({ code: clean, percent: 10 }));
      return true;
    } else if (clean === 'MEGA20' || clean === 'ELECTRO20') {
      setDiscountCode(clean);
      setDiscountPercent(20);
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({ code: clean, percent: 20 }));
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setDiscountCode('');
    setDiscountPercent(0);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {}
  };

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
