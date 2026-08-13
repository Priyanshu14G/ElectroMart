'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getFiltersForCategory, type FilterCategory } from '@/lib/utils/search-filters';

export interface DynamicFiltersProps {
  category?: string;
  availableFilters?: string[];
  onFiltersChange: (filters: Record<string, string[]>) => void;
  priceRange?: [number, number];
  onPriceChange?: (range: [number, number]) => void;
}

interface FilterState {
  [key: string]: string[];
}

export function DynamicFilters({
  category,
  onFiltersChange,
  priceRange = [0, 100000],
  onPriceChange,
}: DynamicFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(
    new Set(['capacitance', 'resistance', 'manufacturer', 'mounting', 'package', 'voltageRating'])
  );
  const [priceMin, setPriceMin] = useState(priceRange[0]);
  const [priceMax, setPriceMax] = useState(priceRange[1]);
  const [searchInFilter, setSearchInFilter] = useState<Record<string, string>>({});

  // Get filter config for current category
  const filterConfig = useMemo(() => {
    return getFiltersForCategory(category || 'general');
  }, [category]);

  const filterCategories = filterConfig.filters;

  const toggleFilter = (filterId: string, value: string) => {
    setFilters((prev) => {
      const current = prev[filterId] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      const newFilters = { ...prev };
      if (updated.length === 0) {
        delete newFilters[filterId];
      } else {
        newFilters[filterId] = updated;
      }

      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const toggleExpandFilter = (filterId: string) => {
    setExpandedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  };

  const handlePriceApply = () => {
    if (priceMin <= priceMax) {
      onPriceChange?.([priceMin, priceMax]);
    }
  };

  const clearAllFilters = () => {
    setFilters({});
    setPriceMin(priceRange[0]);
    setPriceMax(priceRange[1]);
    setSearchInFilter({});
    onFiltersChange({});
    onPriceChange?.(priceRange);
  };

  const totalActiveFilters = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  // Get filtered options for a filter section based on search input
  const getFilteredOptions = (fc: FilterCategory) => {
    const search = (searchInFilter[fc.id] || '').toLowerCase();
    const opts = fc.options || [];
    if (!search) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(search));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Filters</span>
          {totalActiveFilters > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 font-medium">
              {totalActiveFilters}
            </span>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
        {/* Active Filters Pills */}
        {totalActiveFilters > 0 && (
          <div className="px-4 py-3 border-b border-border/50 flex flex-wrap gap-1.5">
            {Object.entries(filters).map(([key, values]) =>
              values.map((val) => {
                const fc = filterCategories.find((f) => f.id === key);
                const opt = fc?.options?.find((o) => o.value === val);
                return (
                  <button
                    key={`${key}-${val}`}
                    onClick={() => toggleFilter(key, val)}
                    className="flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    {opt?.label || val}
                    <X className="h-3 w-3" />
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Price Range */}
        <div className="border-b border-border/50">
          <button
            onClick={() => toggleExpandFilter('__price')}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <span className="font-medium text-sm">Price Range (₹)</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedFilters.has('__price') ? 'rotate-180' : ''
              )}
            />
          </button>
          <AnimatePresence>
            {expandedFilters.has('__price') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Min (₹)</label>
                      <Input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(parseInt(e.target.value) || 0)}
                        className="h-8 text-sm"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Max (₹)</label>
                      <Input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(parseInt(e.target.value) || 100000)}
                        className="h-8 text-sm"
                        min={0}
                      />
                    </div>
                  </div>
                  <Button size="sm" className="w-full h-8 text-xs" onClick={handlePriceApply}>
                    Apply Price Filter
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Filter Sections */}
        {filterCategories.map((fc) => {
          const isExpanded = expandedFilters.has(fc.id);
          const selectedCount = (filters[fc.id] || []).length;
          const visibleOptions = getFilteredOptions(fc);

          return (
            <div key={fc.id} className="border-b border-border/50 last:border-0">
              <button
                onClick={() => toggleExpandFilter(fc.id)}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{fc.label}</span>
                  {selectedCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0 leading-5 font-medium min-w-[1.25rem] text-center">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform flex-shrink-0',
                    isExpanded ? 'rotate-180' : ''
                  )}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {/* Search within filter options if > 6 options */}
                      {(fc.options?.length || 0) > 6 && (
                        <Input
                          value={searchInFilter[fc.id] || ''}
                          onChange={(e) =>
                            setSearchInFilter((prev) => ({ ...prev, [fc.id]: e.target.value }))
                          }
                          placeholder={`Search ${fc.label.toLowerCase()}…`}
                          className="h-7 text-xs mb-2"
                        />
                      )}

                      {visibleOptions.length > 0 ? (
                        visibleOptions.map((option) => {
                          const isSelected = (filters[fc.id] || []).includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <div
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                  isSelected
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground/40 group-hover:border-primary/50'
                                )}
                                onClick={() => toggleFilter(fc.id, option.value)}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-2.5 h-2.5 text-primary-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={cn(
                                  'text-xs leading-tight transition-colors',
                                  isSelected
                                    ? 'text-primary font-medium'
                                    : 'text-foreground/80 group-hover:text-foreground'
                                )}
                                onClick={() => toggleFilter(fc.id, option.value)}
                              >
                                {option.label}
                              </span>
                              {option.count !== undefined && (
                                <span className="ml-auto text-xs text-muted-foreground/50 flex-shrink-0">
                                  {option.count.toLocaleString()}
                                </span>
                              )}
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No matching options</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
