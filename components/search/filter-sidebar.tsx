'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import type { FilterCategory, FilterConfig } from '@/lib/utils/search-filters';

interface FilterState {
  [key: string]: string[] | number[];
}

interface FilterSidebarProps {
  config: FilterConfig;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function FilterSidebar({ config, onFilterChange, onReset }: FilterSidebarProps) {
  const [expandedFilters, setExpandedFilters] = useState<string[]>(
    config.filters.slice(0, 3).map(f => f.id)
  );
  const [filters, setFilters] = useState<FilterState>({});

  const toggleExpanded = (id: string) => {
    setExpandedFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleCheckboxChange = (filterId: string, value: string, checked: boolean) => {
    setFilters(prev => {
      const current = (prev[filterId] as string[]) || [];
      const updated = checked
        ? [...current, value]
        : current.filter(v => v !== value);
      const newFilters = { ...prev, [filterId]: updated };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleRangeChange = (filterId: string, values: number[]) => {
    const newFilters = { ...filters, [filterId]: values };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => 
    Array.isArray(v) ? v.length > 0 : false
  );

  return (
    <div className="w-64 bg-card border-r border-border rounded-lg p-4 sticky top-20 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-2">
        {config.filters.map((filter, idx) => (
          <motion.div
            key={filter.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="border border-border rounded-lg"
          >
            <button
              onClick={() => toggleExpanded(filter.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors"
            >
              <label className="font-medium text-sm cursor-pointer">
                {filter.label}
              </label>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedFilters.includes(filter.id) ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedFilters.includes(filter.id) && (
              <div className="p-3 border-t border-border bg-muted/30 space-y-3">
                {filter.type === 'checkbox' && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map(option => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${filter.id}-${option.value}`}
                          checked={
                            ((filters[filter.id] as string[]) || []).includes(
                              option.value
                            )
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(filter.id, option.value, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`${filter.id}-${option.value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {option.label}
                        </label>
                        {option.count && (
                          <span className="text-xs text-muted-foreground">
                            ({option.count})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {filter.type === 'range' && (
                  <div className="space-y-3">
                    <Slider
                      defaultValue={[filter.min || 0, filter.max || 100]}
                      min={filter.min || 0}
                      max={filter.max || 100}
                      step={filter.unit === '°C' ? 1 : (filter.max || 100) / 100}
                      onValueChange={(values) =>
                        handleRangeChange(filter.id, values as number[])
                      }
                      className="w-full"
                    />
                    <div className="flex gap-2 text-xs">
                      <span>
                        {((filters[filter.id] as number[])?.[0] || filter.min || 0).toFixed(2)}
                        {filter.unit ? ` ${filter.unit}` : ''}
                      </span>
                      <span>-</span>
                      <span>
                        {((filters[filter.id] as number[])?.[1] || filter.max || 100).toFixed(2)}
                        {filter.unit ? ` ${filter.unit}` : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
