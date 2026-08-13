'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Barcode,
  DollarSign,
  Truck,
  Box,
  Image as ImageIcon,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { authUtils } from '@/lib/utils/auth';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  'Microcontroller',
  'Sensor',
  'Battery',
  'Resistor',
  'Capacitor',
  'LED',
  'Motor',
  'Power Supply',
  'Cable',
  'Connector',
];

export default function AddProductPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    description: '',
    manufacturerPartNumber: '',
    supplierPartNumber: '',
    price: '',
    stock: '',
    minOrderQuantity: '',
    leadTime: '',
    packaging: '',
    countryOfOrigin: '',
    warranty: '',
    specifications: '',
    capacitance: '',
    voltageRating: '',
    tolerance: '',
    dielectric: '',
    esr: '',
    rippleCurrent: '',
    temperature: '',
    caseSize: '',
    dimensions: '',
    mounting: '',
    termination: '',
    resistance: '',
    powerRating: '',
    tempCoefficient: '',
    technology: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [sellerStatus, setSellerStatus] = useState<string>('pending');
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  useEffect(() => {
    const currentUser = authUtils.getCurrentUser() || (typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
    if (!currentUser) {
      router.push('/auth/business-signup');
      return;
    }
    setUser(currentUser);

    // Check seller business status
    const token = currentUser.id || currentUser.email || '';
    fetch('/api/seller/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        const b = data?.business;
        const isApproved =
          b?.status === 'approved' ||
          b?.badges?.verified === true ||
          b?.badges?.status === 'approved' ||
          b?.stats?.status === 'approved';
        setSellerStatus(isApproved ? 'approved' : 'pending');
      })
      .catch(() => setSellerStatus('pending'))
      .finally(() => setCheckingStatus(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...images, ...files].slice(0, 5);
    setImages(newFiles);

    Promise.all(
      newFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((previews) => {
      setImagePreviews(previews);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (sellerStatus !== 'approved') {
      setError('Your seller account is currently pending admin approval. You can only list products once your seller account has been approved by the admin.');
      return;
    }

    // Validation
    if (
      !formData.name ||
      !formData.category ||
      !formData.price ||
      !formData.stock ||
      !formData.minOrderQuantity
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const session = authUtils.getSession();
      const currentUser = authUtils.getCurrentUser();
      const token = session?.userId || currentUser?.id || currentUser?.email || 'seller';

      const payload = {
        ...formData,
        images: imagePreviews.length > 0 ? imagePreviews : undefined,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create product');
      }

      const data = await res.json();
      setSuccess('Product submitted for review! It has been sent to the Admin Dashboard for approval and will be listed on the marketplace once approved.');
      setTimeout(() => router.push('/seller/dashboard'), 2500);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create product listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                Add New Product
              </h1>
              <p className="text-muted-foreground">List your electronic components on ElectroMart India</p>
            </div>

            {/* Seller Status Notice */}
            {!checkingStatus && sellerStatus !== 'approved' && (
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3.5 text-amber-800 dark:text-amber-300">
                <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
                  <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Seller Account Pending Admin Approval</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your seller account is currently under review by our admin team. Once your account is verified and approved, you will be able to submit products for marketplace listing.
                  </p>
                </div>
              </div>
            )}

            {/* Product Approval Notice */}
            {!checkingStatus && sellerStatus === 'approved' && (
              <div className="mb-8 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300">
                <span className="font-bold uppercase tracking-wider text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded">Process Note</span>
                <span>All newly added products are sent to the Admin Dashboard for verification before going live on the marketplace.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Basic Info */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Product Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Product Name * <span className="text-red-500">(Required)</span>
                    </label>
                    <Input
                      name="name"
                      placeholder="e.g., Samsung 18650 Battery 3000mAh"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Category * <span className="text-red-500">(Required)</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-border rounded-lg px-4 py-2.5 bg-background"
                      required
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Brand</label>
                    <Input
                      name="brand"
                      placeholder="e.g., Samsung, Bosch, Sony"
                      value={formData.brand}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Country of Origin</label>
                    <Input
                      name="countryOfOrigin"
                      placeholder="e.g., South Korea, Germany"
                      value={formData.countryOfOrigin}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Description</label>
                  <textarea
                    name="description"
                    placeholder="Detailed description of your product, features, and benefits"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg px-4 py-2 bg-background resize-none"
                    rows={4}
                  />
                </div>
              </div>

              {/* Specification Info */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-primary" />
                  Specifications
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Manufacturer Part Number</label>
                    <Input
                      name="manufacturerPartNumber"
                      placeholder="e.g., ICR18650-30B"
                      value={formData.manufacturerPartNumber}
                      onChange={handleChange}
                      className="h-11 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Supplier Part Number</label>
                    <Input
                      name="supplierPartNumber"
                      placeholder="e.g., SAM-ICR18650-30B"
                      value={formData.supplierPartNumber}
                      onChange={handleChange}
                      className="h-11 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Packaging</label>
                    <Input
                      name="packaging"
                      placeholder="e.g., Tape and Reel, Bulk, Blister pack"
                      value={formData.packaging}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Warranty</label>
                    <Input
                      name="warranty"
                      placeholder="e.g., 1 Year"
                      value={formData.warranty}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Additional Specifications</label>
                  <textarea
                    name="specifications"
                    placeholder="Any additional specifications or features"
                    value={formData.specifications}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg px-4 py-2 bg-background resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing & Inventory
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Price (₹) * <span className="text-red-500">(Required)</span>
                    </label>
                    <Input
                      type="number"
                      name="price"
                      placeholder="245"
                      value={formData.price}
                      onChange={handleChange}
                      className="h-11"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Stock Quantity * <span className="text-red-500">(Required)</span>
                    </label>
                    <Input
                      type="number"
                      name="stock"
                      placeholder="450"
                      value={formData.stock}
                      onChange={handleChange}
                      className="h-11"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Minimum Order Quantity * <span className="text-red-500">(Required)</span>
                    </label>
                    <Input
                      type="number"
                      name="minOrderQuantity"
                      placeholder="10"
                      value={formData.minOrderQuantity}
                      onChange={handleChange}
                      className="h-11"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Lead Time</label>
                    <Input
                      name="leadTime"
                      placeholder="e.g., 2-3 days"
                      value={formData.leadTime}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Product Images
                </h2>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 high-quality images of your product. (JPG, PNG)
                  </p>

                  <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-border rounded-lg hover:bg-muted/50 transition cursor-pointer">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={images.length >= 5}
                    />
                  </label>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                  {success}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || checkingStatus || sellerStatus !== 'approved'}
                  className="flex-1"
                >
                  {loading
                    ? 'Submitting for Review...'
                    : sellerStatus !== 'approved'
                    ? 'Account Pending Approval'
                    : 'Submit Product for Admin Approval'}
                  {!loading && sellerStatus === 'approved' && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
