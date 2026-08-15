'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Barcode,
  DollarSign,
  Image as ImageIcon,
  Minus,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { authUtils } from '@/lib/utils/auth';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFiltersForCategory } from '@/lib/utils/search-filters';

const CATEGORIES = [
  { label: 'Battery', value: 'battery' },
  { label: 'Capacitor', value: 'capacitor' },
  { label: 'Resistor', value: 'resistor' },
  { label: 'Diode', value: 'diode' },
  { label: 'Microcontroller', value: 'microcontroller' },
  { label: 'Connector', value: 'connector' },
  { label: 'Sensor', value: 'sensor' },
  { label: 'LED', value: 'led' },
  { label: 'Transformer', value: 'transformer' },
  { label: 'Inductor', value: 'inductor' },
  { label: 'Switch', value: 'switch' },
  { label: 'Fuse', value: 'fuse' },
  { label: 'Motor', value: 'motor' },
  { label: 'Display', value: 'display' },
  { label: 'General', value: 'general' },
];

// Helper to group filter fields by category for better organization
const getFilterGroups = (filters: any[]) => {
  const groups: { [key: string]: any[] } = {
    'Electrical Characteristics': [],
    'Physical Characteristics': [],
    'Packaging & Mounting': [],
    'Manufacturer': [],
  };

  const electricalIds = new Set(['capacitance', 'resistance', 'voltage', 'voltageRating', 'currentRating', 'powerRating', 'frequency', 'temperature', 'tolerance', 'esr', 'rippleCurrent', 'dielectric', 'chemistry', 'architecture', 'flash', 'peripherals', 'tempCoefficient', 'dcResistance', 'inductance', 'outputType', 'forwardVoltage', 'forwardCurrent', 'reverseVoltage', 'recoveryTime']);
  const physicalIds = new Set(['caseSize', 'dimensions', 'type', 'sensorType', 'interface', 'color', 'wavelength', 'brightness', 'viewingAngle', 'accuracy', 'measurementRange', 'turnsRatio', 'coreType', 'inputVoltage', 'outputVoltage', 'pins', 'gender', 'orientation', 'mountedStyle', 'capacity', 'connectorType', 'pitch']);
  const packagingIds = new Set(['mounting', 'termination', 'package', 'packaging', 'certification']);
  const manufacturerId = new Set(['manufacturer']);

  filters.forEach((field) => {
    if (electricalIds.has(field.id)) {
      groups['Electrical Characteristics'].push(field);
    } else if (physicalIds.has(field.id)) {
      groups['Physical Characteristics'].push(field);
    } else if (packagingIds.has(field.id)) {
      groups['Packaging & Mounting'].push(field);
    } else if (manufacturerId.has(field.id)) {
      groups['Manufacturer'].push(field);
    }
  });

  return groups;
};

const getFilterData = (product: any) => {
  const rawSpecData = product?.specs && typeof product.specs === 'object' ? product.specs : {};
  const rawFilterData = product?.filterAttributes && typeof product.filterAttributes === 'object' ? product.filterAttributes : {};
  const parsedRawFilterData = typeof product?.filterAttributes === 'string' ? JSON.parse(product.filterAttributes) : rawFilterData;
  const parsedSpecs = typeof product?.specs === 'string' ? JSON.parse(product.specs) : rawSpecData;

  return { ...parsedSpecs, ...parsedRawFilterData };
};

const emptyForm = {
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
  manufacturer: '',
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
  chemistry: '',
  voltage: '',
  capacity: '',
  certification: '',
  architecture: '',
  frequency: '',
  flash: '',
  peripherals: '',
  package: '',
  connectorType: '',
  pitch: '',
  currentRating: '',
  sensorType: '',
  interface: '',
  color: '',
  wavelength: '',
  brightness: '',
  inductance: '',
  dcResistance: '',
  outputType: '',
  measurementRange: '',
  accuracy: '',
  viewingAngle: '',
  forwardVoltage: '',
  forwardCurrent: '',
  reverseVoltage: '',
  recoveryTime: '',
  type: '',
  turnsRatio: '',
  coreType: '',
  inputVoltage: '',
  outputVoltage: '',
  powerRatingValue: '',
  mountedStyle: '',
  orientation: '',
  gender: '',
  pins: '',
  current: '',
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const productId = typeof params?.id === 'string' ? params.id : '';
  const filterFields = useMemo(() => getFiltersForCategory(formData.category || 'general').filters, [formData.category]);
  const filterGroups = useMemo(() => getFilterGroups(filterFields), [filterFields]);

  useEffect(() => {
    const currentUser = authUtils.getCurrentUser() || (typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
    if (!currentUser) {
      router.push('/auth/business-signup');
      return;
    }
    setUser(currentUser);

    if (!productId) {
      setError('Product not found.');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          throw new Error('Failed to load product');
        }
        const payload = await res.json();
        const product = payload?.product;

        if (!product) {
          throw new Error('Product not found');
        }

        const filterData = getFilterData(product);
        const nextForm = {
          ...emptyForm,
          name: product.name || '',
          category: product.category || '',
          brand: product.brand || '',
          description: product.description || '',
          manufacturerPartNumber: product.manufacturerPartNumber || '',
          supplierPartNumber: product.supplierPartNumber || '',
          price: String(product.price ?? ''),
          stock: String(product.stock ?? ''),
          minOrderQuantity: String(product.minOrderQuantity ?? ''),
          leadTime: product.leadTime || '',
          packaging: product.packaging || '',
          countryOfOrigin: product.countryOfOrigin || '',
          warranty: product.warranty || '',
          specifications: product.specifications || product.description || '',
          manufacturer: filterData.manufacturer || product.manufacturer || '',
          capacitance: filterData.capacitance || '',
          voltageRating: filterData.voltageRating || '',
          tolerance: filterData.tolerance || '',
          dielectric: filterData.dielectric || '',
          esr: filterData.esr || '',
          rippleCurrent: filterData.rippleCurrent || '',
          temperature: filterData.temperature || '',
          caseSize: filterData.caseSize || '',
          dimensions: filterData.dimensions || '',
          mounting: filterData.mounting || '',
          termination: filterData.termination || '',
          resistance: filterData.resistance || '',
          powerRating: filterData.powerRating || '',
          tempCoefficient: filterData.tempCoefficient || '',
          technology: filterData.technology || '',
          chemistry: filterData.chemistry || '',
          voltage: filterData.voltage || '',
          capacity: filterData.capacity || '',
          certification: filterData.certification || '',
          architecture: filterData.architecture || '',
          frequency: filterData.frequency || '',
          flash: filterData.flash || '',
          peripherals: filterData.peripherals || '',
          package: filterData.package || '',
          connectorType: filterData.connectorType || '',
          pitch: filterData.pitch || '',
          currentRating: filterData.currentRating || '',
          sensorType: filterData.sensorType || '',
          interface: filterData.interface || '',
          color: filterData.color || '',
          wavelength: filterData.wavelength || '',
          brightness: filterData.brightness || '',
          inductance: filterData.inductance || '',
          dcResistance: filterData.dcResistance || '',
          outputType: filterData.outputType || '',
          measurementRange: filterData.measurementRange || '',
          accuracy: filterData.accuracy || '',
          viewingAngle: filterData.viewingAngle || '',
          forwardVoltage: filterData.forwardVoltage || '',
          forwardCurrent: filterData.forwardCurrent || '',
          reverseVoltage: filterData.reverseVoltage || '',
          recoveryTime: filterData.recoveryTime || '',
          type: filterData.type || '',
          turnsRatio: filterData.turnsRatio || '',
          coreType: filterData.coreType || '',
          inputVoltage: filterData.inputVoltage || '',
          outputVoltage: filterData.outputVoltage || '',
          powerRatingValue: filterData.powerRatingValue || '',
          mountedStyle: filterData.mountedStyle || '',
          orientation: filterData.orientation || '',
          gender: filterData.gender || '',
          pins: filterData.pins || '',
          current: filterData.current || '',
        };

        setFormData(nextForm);
        if (Array.isArray(product.images) && product.images.length > 0) {
          setImagePreviews(product.images);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load this product for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.category || !formData.price || !formData.stock || !formData.minOrderQuantity) {
      setError('Please fill in all required fields.');
      return;
    }

    const activeFilterFields = getFiltersForCategory(formData.category || 'general').filters;
    const requiredFilterIds = new Set(['manufacturer', 'mounting', 'package', 'capacitance', 'resistance', 'voltageRating', 'chemistry', 'connectorType', 'sensorType', 'color']);
    const missingFilter = activeFilterFields.find((field) => requiredFilterIds.has(field.id) && !String(formData[field.id] || '').trim());
    if (missingFilter) {
      setError(`Please choose a value for "${missingFilter.label}" before saving the product.`);
      return;
    }

    try {
      const session = authUtils.getSession();
      const currentUser = authUtils.getCurrentUser();
      const token = session?.userId || currentUser?.id || currentUser?.email || 'seller';

      const filterAttributes: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value && [
          'manufacturer', 'capacitance', 'voltageRating', 'tolerance', 'dielectric', 'esr', 'rippleCurrent', 'temperature', 'caseSize', 'dimensions', 'mounting', 'termination', 'resistance', 'powerRating', 'tempCoefficient', 'technology', 'chemistry', 'voltage', 'capacity', 'certification', 'architecture', 'frequency', 'flash', 'peripherals', 'package', 'connectorType', 'pitch', 'currentRating', 'sensorType', 'interface', 'color', 'wavelength', 'brightness', 'inductance', 'dcResistance', 'outputType', 'measurementRange', 'accuracy', 'viewingAngle', 'forwardVoltage', 'forwardCurrent', 'reverseVoltage', 'recoveryTime', 'type', 'turnsRatio', 'coreType', 'inputVoltage', 'outputVoltage', 'powerRatingValue', 'mountedStyle', 'orientation', 'gender', 'pins', 'current'
        ].includes(key)) {
          filterAttributes[key] = String(value);
        }
      });

      const payload = {
        ...formData,
        filterAttributes,
        specs: { ...filterAttributes },
        images: imagePreviews.length > 0 ? imagePreviews : undefined,
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update product');
      }

      setSuccess('Product updated successfully.');
      setTimeout(() => router.push('/seller/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update product.');
    }
  };

  if (!user || loading) {
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
          <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                Edit Product
              </h1>
              <p className="text-muted-foreground">Update product details and filter metadata.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Basic Information */}
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
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
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

              {/* Category-Specific Product Characteristics */}
              {formData.category && filterFields.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Barcode className="h-5 w-5 text-primary" />
                    {CATEGORIES.find(c => c.value === formData.category)?.label} Details
                  </h2>

                  {/* Render filter groups */}
                  {Object.entries(filterGroups).map(([groupName, fields]) => 
                    fields.length > 0 ? (
                      <div key={groupName}>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">{groupName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fields.map((field) => {
                            const selectedValue = String(formData[field.id] || '');
                            const isRequired = new Set(['manufacturer', 'mounting', 'package', 'capacitance', 'resistance', 'voltageRating', 'chemistry', 'connectorType', 'sensorType', 'color']).has(field.id);

                            return (
                              <div key={field.id}>
                                <label className="text-sm font-medium block mb-2">
                                  {field.label}
                                  {isRequired && <span className="text-red-500"> *</span>}
                                </label>

                                {field.type === 'range' ? (
                                  <Input
                                    type="number"
                                    value={selectedValue}
                                    onChange={(e) => handleFilterFieldChange(field.id, e.target.value)}
                                    className="h-11"
                                    min={field.min ?? 0}
                                    max={field.max ?? undefined}
                                    placeholder={field.unit ? `${field.unit}` : ''}
                                  />
                                ) : (
                                  <select
                                    value={selectedValue}
                                    onChange={(e) => handleFilterFieldChange(field.id, e.target.value)}
                                    className="w-full border border-border rounded-lg px-4 py-2.5 bg-background"
                                    required={isRequired}
                                  >
                                    <option value="">Select {field.label}</option>
                                    {(field.options || []).map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}


              {/* Specifications */}
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
                    <label className="text-sm font-medium block mb-2">Packaging Type</label>
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

              {/* Pricing & Inventory */}
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
                </div>
              </div>

              {/* Product Images */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Product Images
                </h2>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Upload up to 5 images. Existing images remain if you do not upload new ones.</p>
                  <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-border rounded-lg hover:bg-muted/50 transition cursor-pointer">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={imagePreviews.length >= 5} />
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative group">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-border" />
                          <button type="button" onClick={() => setImagePreviews((prev) => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition">
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400" >
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400" >
                  {success}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">
                  Save Product Changes
                  <ArrowRight className="h-4 w-4 ml-2" />
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
