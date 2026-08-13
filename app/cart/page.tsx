'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  FileCheck,
  CheckCircle2,
  Tag,
  AlertCircle,
  Package,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/providers/cart-provider';

export default function CartPage() {
  const {
    items,
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
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<any>(null);

  // Delivery & Checkout Details form state
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    companyName: '',
    gstNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    paymentMethod: 'upi',
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput);
    if (success) {
      setCouponSuccess(`Coupon "${couponInput.toUpperCase()}" applied successfully!`);
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try ELECTRO10 or MEGA20');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.fullName || !checkoutForm.address || !checkoutForm.phone) {
      alert('Please fill in your name, delivery address, and phone number.');
      return;
    }

    const orderId = `EM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const placedData = {
      orderId,
      items: [...items],
      total,
      subtotal,
      tax,
      shipping,
      discount,
      deliveryAddress: checkoutForm,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      estDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    setOrderPlaced(placedData);
    clearCart();
    setIsCheckingOut(false);
  };

  if (!isLoaded) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Page Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-primary" />
                My Cart
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalItems > 0
                  ? `You have ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your electronic components cart`
                  : 'Your shopping cart is currently empty'}
              </p>
            </div>

            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:bg-destructive/10 border-border gap-1.5 self-start sm:self-auto"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </Button>
            )}
          </div>

          {/* Order Success Modal */}
          <AnimatePresence>
            {orderPlaced && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-12 p-8 bg-green-500/10 border-2 border-green-500/40 rounded-2xl text-center max-w-3xl mx-auto shadow-xl"
              >
                <div className="w-16 h-16 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Order Placed Successfully!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your order. We have sent a confirmation email with GST invoice to{' '}
                  <strong className="text-foreground">{orderPlaced.deliveryAddress.email || 'your registered email'}</strong>.
                </p>

                <div className="bg-card border border-border p-6 rounded-xl text-left grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <span className="text-xs text-muted-foreground block">Order ID</span>
                    <strong className="text-base font-mono text-primary">{orderPlaced.orderId}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Estimated Delivery</span>
                    <strong className="text-base text-foreground">{orderPlaced.estDelivery}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Total Paid (incl. GST)</span>
                    <strong className="text-base text-green-600 dark:text-green-400 font-bold">
                      ₹{orderPlaced.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                  <Button onClick={() => setOrderPlaced(null)} className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Shop More Components
                  </Button>
                  <Link href="/orders">
                    <Button variant="outline">View All Orders</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty Cart State */}
          {items.length === 0 && !orderPlaced ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-primary">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Looks like you haven't added any electronic components to your cart yet. Explore our marketplace for
                semiconductors, sensors, modules, and passive components.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/search">
                  <Button size="lg" className="gap-2">
                    Browse Marketplace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/search?category=microcontroller">
                  <Button size="lg" variant="outline">
                    Explore Microcontrollers
                  </Button>
                </Link>
              </div>
            </div>
          ) : items.length > 0 && !isCheckingOut ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 sm:p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Item Image & Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {item.category && (
                            <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">
                              {item.category}
                            </span>
                          )}
                          {item.brand && (
                            <span className="text-[11px] text-muted-foreground font-medium">
                              Brand: {item.brand}
                            </span>
                          )}
                        </div>

                        <Link href={`/product/${item.id}`} className="hover:underline">
                          <h3 className="font-semibold text-base text-foreground line-clamp-2" title={item.name}>
                            {item.name}
                          </h3>
                        </Link>

                        <p className="text-xs text-muted-foreground mt-1">
                          Supplier: <span className="font-medium text-foreground">{item.supplierName}</span>
                          {item.leadTime && ` • Lead: ${item.leadTime}`}
                        </p>

                        <div className="mt-2 text-sm">
                          <span className="font-bold text-primary">₹{item.price.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-muted-foreground"> / unit</span>
                          {item.minOrderQuantity && item.minOrderQuantity > 1 && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
                              (MOQ: {item.minOrderQuantity})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Item Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                      {/* Quantity Buttons */}
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition rounded-l-lg"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center text-sm font-semibold border-x border-border bg-transparent focus:outline-none"
                          min={item.minOrderQuantity || 1}
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition rounded-r-lg"
                          title="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[90px]">
                        <p className="text-lg font-bold text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{item.quantity} units</p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition rounded-lg hover:bg-destructive/10"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Free Shipping Progress Indicator */}
                <div className="p-4 bg-muted/40 border border-border rounded-xl flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="text-xs flex-1">
                    {subtotal >= 999 ? (
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        🎉 You have qualified for FREE standard delivery across India!
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Add <strong className="text-foreground">₹{(999 - subtotal).toFixed(0)}</strong> more of eligible
                        components to get <strong className="text-primary">FREE Delivery</strong>.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="mb-6">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      Have a coupon code?
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. ELECTRO10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="h-9 uppercase font-mono text-xs"
                      />
                      <Button type="submit" size="sm" variant="outline" className="h-9 px-3">
                        Apply
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                    {couponSuccess && <p className="text-xs text-green-600 mt-1">{couponSuccess}</p>}
                    {discountCode && (
                      <div className="flex items-center justify-between text-xs bg-green-500/10 text-green-700 dark:text-green-400 p-2 rounded-lg mt-2">
                        <span>Applied: <strong>{discountCode}</strong> ({discount > 0 ? 'Discount applied' : ''})</span>
                        <button type="button" onClick={removeCoupon} className="text-red-500 hover:underline">
                          Remove
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Price Breakdown */}
                  <div className="space-y-3 text-sm pb-4 border-b border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items Subtotal</span>
                      <span className="text-foreground font-medium">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount ({discountCode})</span>
                        <span>-₹{discount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        GST (18% B2B Tax)
                        <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                      <span className="text-foreground font-medium">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping & Handling</span>
                      <span className="text-foreground font-medium">
                        {shipping === 0 ? <strong className="text-green-600 dark:text-green-400">FREE</strong> : `₹${shipping}`}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-baseline py-4 mb-6">
                    <div>
                      <span className="text-base font-bold">Total Amount</span>
                      <p className="text-[11px] text-muted-foreground">Includes all applicable taxes</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    size="lg"
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full gap-2 h-12 text-base font-semibold shadow-md hover:shadow-lg transition"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-border space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>100% Genuine & Verified Components</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Official GST Invoice for Input Tax Credit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span>Fast Pan-India Express Logistics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isCheckingOut ? (
            /* Checkout View */
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold">Checkout & Delivery Details</h2>
                  <p className="text-sm text-muted-foreground">Provide your shipping address and billing details</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsCheckingOut(false)}>
                  Back to Cart
                </Button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5">
                      Full Name * <span className="text-red-500">(Required)</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={checkoutForm.fullName}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5">Company / Business Name (Optional)</label>
                    <Input
                      placeholder="e.g. Acme Embedded Labs Pvt Ltd"
                      value={checkoutForm.companyName}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5">Email Address *</label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. rajesh@example.com"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5">Phone Number *</label>
                    <Input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold block mb-1.5">GST Number for Tax Credit (Optional)</label>
                    <Input
                      placeholder="e.g. 27AABCP1234H1Z0"
                      value={checkoutForm.gstNumber}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, gstNumber: e.target.value.toUpperCase() })}
                      className="font-mono text-xs uppercase"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold block mb-1.5">
                      Delivery Address * <span className="text-red-500">(Required)</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House/Plot no., Building name, Street, Landmark"
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5">City *</label>
                    <Input
                      required
                      placeholder="e.g. Bengaluru"
                      value={checkoutForm.city}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5">PIN Code *</label>
                    <Input
                      required
                      placeholder="e.g. 560001"
                      value={checkoutForm.pincode}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-bold block mb-3">Select Payment Option</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'upi', label: 'UPI / QR Code', sub: 'Instant via GPay, PhonePe, Paytm', icon: Sparkles },
                      { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, MasterCard, RuPay', icon: CreditCard },
                      { id: 'netbanking', label: 'Corporate NetBanking / NEFT', sub: 'For B2B bulk orders', icon: Building },
                    ].map(({ id, label, sub, icon: Icon }) => (
                      <label
                        key={id}
                        onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: id })}
                        className={`p-4 border rounded-xl cursor-pointer transition flex flex-col justify-between ${
                          checkoutForm.paymentMethod === id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <input
                            type="radio"
                            name="payment"
                            checked={checkoutForm.paymentMethod === id}
                            onChange={() => setCheckoutForm({ ...checkoutForm, paymentMethod: id })}
                            className="accent-primary"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Summary Confirmation */}
                <div className="p-4 bg-muted/40 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">Total Payable</span>
                    <strong className="text-2xl font-bold text-primary">
                      ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCheckingOut(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="lg" className="gap-2">
                      Place Order
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
