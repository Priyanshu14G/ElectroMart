'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Heart,
  MessageCircle,
  Grid3x3,
  List,
  ChevronDown,
  Search as SearchIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DynamicFilters } from '@/components/search/dynamic-filters';
import { getProducts, type ApiProduct } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  query: string;
  category?: string;
}

export function SearchResults({ query, category }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  useEffect(() => {
    setLoading(true);
    getProducts({
      q: searchInput,
      category,
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy === 'price_low_to_high' ? 'price_asc' : sortBy === 'price_high_to_low' ? 'price_desc' : sortBy === 'rating' ? 'rating_desc' : 'createdAt_desc',
    })
      .then((res) => {
        setProducts(res.products);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchInput, category, currentPage, sortBy]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Search Header */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm">
                Advanced Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <DynamicFilters
              category={category}
              availableFilters={[]}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Results Section */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">
                  {searchInput ? `Results for "${searchInput}"` : 'All Products'}
                </h1>
                {category && (
                  <p className="text-muted-foreground mt-1">Category: {category}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {total} {total === 1 ? 'product' : 'products'} found
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                {/* Sort Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="gap-2"
                  >
                    Sort
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 min-w-max"
                    >
                      {[
                        { value: 'relevance', label: 'Most Relevant' },
                        { value: 'price_low_to_high', label: 'Price: Low to High' },
                        { value: 'price_high_to_low', label: 'Price: High to Low' },
                        { value: 'rating', label: 'Highest Rated' },
                        { value: 'newest', label: 'Newest' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={cn(
                            'block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg',
                            sortBy === option.value && 'bg-primary text-primary-foreground'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

              {/* Product Grid/List */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length > 0 ? (
                <motion.div
                  className={cn(
                    'gap-4',
                    viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'
                  )}
                  layout
                >
                  {products.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group flex flex-col',
                        viewMode === 'list' && 'sm:flex-row gap-4 p-4'
                      )}
                    >
                      {/* Product Image */}
                      <div
                        className={cn(
                          'bg-muted flex items-center justify-center relative overflow-hidden flex-shrink-0',
                          viewMode === 'list' ? 'w-full sm:w-32 h-48 sm:h-32' : 'h-48'
                        )}
                      >
                        {Array.isArray(product.images) && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className={cn('p-4 flex-1 flex flex-col justify-between')}>
                        <div>
                          {/* Badges */}
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {product.supplier?.badges?.verified && (
                              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                                Verified
                              </span>
                            )}
                            {product.stock === 0 && (
                              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          {/* Name */}
                          <Link href={`/product/${product.id}`}>
                            <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Supplier & Location */}
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.supplier?.name || 'Supplier'}
                          </p>
                          {product.supplier?.address?.city && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              {product.supplier.address.city}, {product.supplier.address.state}
                            </p>
                          )}

                          {/* Rating */}
                          {product.rating !== undefined && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      'h-3 w-3',
                                      i < Math.round(product.rating || 0)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-muted-foreground'
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {product.rating} ({product.reviewCount || 0})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Price & Stock */}
                        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-primary">
                              ₹{product.price.toLocaleString('en-IN')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              MOQ: {product.minOrderQuantity} | Stock: {product.stock}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Link href={`/product/${product.id}`} className="w-full">
                            <Button size="sm" className="w-full h-8">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">No products found</h2>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </motion.div>
            )}

            {/* Pagination Controls */}
            {total > itemsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
