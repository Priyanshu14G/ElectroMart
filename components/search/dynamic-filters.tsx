'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getFilterOptions } from '@/lib/utils/search';

export interface DynamicFiltersProps {
  category?: string;
  availableFilters: string[];
  onFiltersChange: (filters: Record<string, string[]>) => void;
  priceRange?: [number, number];
  onPriceChange?: (range: [number, number]) => void;
}

interface FilterState {
  [key: string]: string[];
}

export function DynamicFilters({
  category,
  availableFilters,
  onFiltersChange,
  priceRange = [0, 10000],
  onPriceChange,
}: DynamicFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState(priceRange[0]);
  const [priceMax, setPriceMax] = useState(priceRange[1]);

  const toggleFilter = (filterType: string, value: string) => {
    setFilters((prev) => {
      const current = prev[filterType] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      const newFilters = { ...prev };
      if (updated.length === 0) {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = updated;
      }

      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const toggleExpandFilter = (filterType: string) => {
    const newExpanded = new Set(expandedFilters);
    if (newExpanded.has(filterType)) {
      newExpanded.delete(filterType);
    } else {
      newExpanded.add(filterType);
    }
    setExpandedFilters(newExpanded);
  };

  const handlePriceChange = () => {
    if (priceMin <= priceMax) {
      onPriceChange?.([priceMin, priceMax]);
    }
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-lg border border-border p-4 space-y-6 sticky top-24"
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Price Range Filter */}
      <motion.div
        className="space-y-3"
        layout
      >
        <button
          onClick={() => toggleExpandFilter('price')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-sm">Price Range</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expandedFilters.has('price') ? 'rotate-180' : ''
            )}
          />
        </button>

        {expandedFilters.has('price') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Min Price: ₹{priceMin}</label>
              <Input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(parseInt(e.target.value) || 0)}
                onBlur={handlePriceChange}
                placeholder="Min"
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Max Price: ₹{priceMax}</label>
              <Input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value) || 10000)}
                onBlur={handlePriceChange}
                placeholder="Max"
                className="h-8"
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Dynamic Filters */}
      {availableFilters.map((filterType) => {
        const options = getFilterOptions(filterType, category);
        const isExpanded = expandedFilters.has(filterType);

        return (
          <motion.div
            key={filterType}
            className="space-y-3"
            layout
          >
            <button
              onClick={() => toggleExpandFilter(filterType)}
              className="flex items-center justify-between w-full"
            >
              <span className="font-medium text-sm capitalize">
                {filterType.replace(/_/g, ' ')}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded ? 'rotate-180' : ''
                )}
              />
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {options.length > 0 ? (
                  options.slice(0, 8).map((option) => {
                    const isSelected = filters[filterType]?.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilter(filterType, option)}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                          {option}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground">No options available</p>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Stock Status */}
      <motion.div className="space-y-3" layout>
        <button
          onClick={() => toggleExpandFilter('stock')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-sm">Stock Status</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expandedFilters.has('stock') ? 'rotate-180' : ''
            )}
          />
        </button>

        {expandedFilters.has('stock') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm">Pre-order Available</span>
            </label>
          </motion.div>
        )}
      </motion.div>

      {/* Supplier Filter */}
      <motion.div className="space-y-3" layout>
        <button
          onClick={() => toggleExpandFilter('supplier')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-sm">Supplier</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expandedFilters.has('supplier') ? 'rotate-180' : ''
            )}
          />
        </button>

        {expandedFilters.has('supplier') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm">Verified Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm">GST Verified</span>
            </label>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
