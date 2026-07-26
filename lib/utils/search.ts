import { Product, FilterOption } from '@/lib/types';

// Component type to filter specification mapping
export const componentFilterSpecs: Record<string, string[]> = {
  battery: [
    'voltage',
    'capacity',
    'chemistry',
    'rechargeable',
    'dimensions',
    'connector_type',
    'max_discharge_current',
    'weight',
    'temperature',
  ],
  capacitor: [
    'capacitance',
    'voltage_rating',
    'tolerance',
    'dielectric_type',
    'package',
    'esr',
    'temperature_rating',
    'mounting_type',
  ],
  resistor: [
    'resistance',
    'tolerance',
    'power_rating',
    'package',
    'temperature_coefficient',
    'mounting_type',
  ],
  diode: [
    'forward_voltage',
    'current',
    'reverse_voltage',
    'recovery_time',
    'package',
    'type',
  ],
  ic_microcontroller: [
    'flash_size',
    'ram_size',
    'core_type',
    'frequency',
    'pins',
    'operating_temperature',
    'package',
  ],
  connector: [
    'pitch',
    'current_rating',
    'voltage_rating',
    'gender',
    'connector_type',
    'mounting_type',
    'pins',
  ],
  sensor: [
    'sensor_type',
    'measurement_range',
    'accuracy',
    'operating_temperature',
    'output_type',
    'package',
  ],
  inductor: [
    'inductance',
    'current_rating',
    'dc_resistance',
    'frequency',
    'package',
    'temperature_rating',
  ],
  transformer: [
    'input_voltage',
    'output_voltage',
    'power_rating',
    'frequency',
    'turns_ratio',
    'core_type',
  ],
  led: [
    'color',
    'wavelength',
    'brightness',
    'forward_voltage',
    'current_rating',
    'package',
    'viewing_angle',
  ],
};

// Filter value options for each filter type
export const filterValueOptions: Record<string, Record<string, string[]>> = {
  voltage: {
    battery: ['3.7V', '5V', '12V', '24V', '48V', '230V'],
    connector: ['5V', '12V', '24V', '48V', '100V', '220V'],
  },
  chemistry: {
    battery: ['Lithium Ion', 'LiFePO4', 'Lead Acid', 'NiMH', 'Coin Cell', 'Alkaline'],
  },
  capacitance: {
    capacitor: ['1µF', '10µF', '100µF', '1000µF', '10000µF'],
  },
  dielectric_type: {
    capacitor: ['Ceramic', 'Electrolytic', 'Film', 'Tantalum', 'Mica'],
  },
  package: {
    capacitor: ['0603', '0805', '1206', 'Through Hole', 'Radial'],
    resistor: ['0603', '0805', '1206', 'Axial', '1/4W', '1/2W'],
    ic_microcontroller: ['DIP', 'QFP', 'BGA', 'LQFP', 'TQFP'],
  },
  tolerance: {
    capacitor: ['±5%', '±10%', '±20%'],
    resistor: ['±0.1%', '±0.5%', '±1%', '±5%', '±10%', '±20%'],
  },
  power_rating: {
    resistor: ['1/8W', '1/4W', '1/2W', '1W', '2W', '5W', '10W'],
  },
  mounting_type: {
    capacitor: ['SMD', 'Through Hole'],
    resistor: ['SMD', 'Through Hole', 'Axial'],
    sensor: ['SMD', 'Through Hole', 'Module'],
  },
  temperature_rating: {
    capacitor: ['-20 to 85°C', '-20 to 105°C', '-40 to 125°C'],
  },
  connector_type: {
    connector: ['USB', 'HDMI', 'RJ45', 'DB9', 'Barrel Jack', 'JST', 'DuPont'],
  },
  frequency: {
    ic_microcontroller: ['8MHz', '16MHz', '24MHz', '32MHz', '48MHz', '100MHz'],
  },
  gender: {
    connector: ['Male', 'Female', 'Both'],
  },
};

// Search and filter products
export function searchProducts(
  products: Product[],
  query: string,
  filters: any = {}
): Product[] {
  let filtered = [...products];

  // Text search
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.manufacturer.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  // Price range filter
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    filtered = filtered.filter((p) => {
      const price = p.price;
      if (filters.priceMin !== undefined && price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && price > filters.priceMax) return false;
      return true;
    });
  }

  // Rating filter
  if (filters.minRating !== undefined && filters.minRating > 0) {
    filtered = filtered.filter((p) => (p.rating || 0) >= filters.minRating!);
  }

  // Verified suppliers only
  if (filters.verifiedOnly) {
    filtered = filtered.filter((p: any) => p.supplier?.verified);
  }

  // Stock filter
  if (filters.inStockOnly) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  // GST verified
  if (filters.gstVerified) {
    filtered = filtered.filter((p: any) => p.supplier?.gstVerified);
  }

  // Manufacturer filter
  if (filters.manufacturers && filters.manufacturers.length > 0) {
    filtered = filtered.filter((p) => filters.manufacturers!.includes(p.manufacturer));
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_low_to_high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high_to_low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'relevance':
      default:
        // Keep original order for relevance
        break;
    }
  }

  return filtered;
}

// Get available filters for a category
export function getFiltersForCategory(category: string): string[] {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '_');
  return componentFilterSpecs[categoryKey] || [];
}

// Get filter options for a specific filter type and category
export function getFilterOptions(filterType: string, category?: string): string[] {
  const options = filterValueOptions[filterType];
  if (!options) return [];

  if (category && options[category.toLowerCase()]) {
    return options[category.toLowerCase()];
  }

  // Return all options for this filter type if category-specific not found
  const allOptions = Object.values(options).flat();
  return [...new Set(allOptions)];
}

// Extract keywords from search query for AI-like parsing
export function parseSearchQuery(query: string): {
  keywords: string[];
  components: string[];
  specifications: Record<string, string>;
} {
  const lowerQuery = query.toLowerCase();
  
  // Common component keywords
  const componentKeywords = [
    'battery', 'capacitor', 'resistor', 'diode', 'transistor', 'ic', 'microcontroller',
    'connector', 'sensor', 'inductor', 'transformer', 'led', 'switch', 'relay',
  ];

  // Common specification keywords
  const specKeywords: Record<string, string[]> = {
    voltage: ['v', 'volt', 'voltage'],
    capacity: ['mah', 'ah', 'capacity'],
    current: ['a', 'amp', 'current', 'ma'],
    temperature: ['celsius', '°c', 'temp'],
    frequency: ['hz', 'mhz', 'ghz', 'frequency'],
    watts: ['w', 'watts', 'power'],
  };

  const keywords = lowerQuery.split(/[\s,]+/).filter(Boolean);
  const components = keywords.filter((k) => componentKeywords.includes(k));
  const specifications: Record<string, string> = {};

  // Parse specifications from keywords
  keywords.forEach((keyword) => {
    Object.entries(specKeywords).forEach(([spec, patterns]) => {
      if (patterns.some((p) => keyword.includes(p))) {
        specifications[spec] = keyword;
      }
    });
  });

  return { keywords, components, specifications };
}

// Calculate relevance score
export function calculateRelevanceScore(product: Product, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Exact name match
  if (product.name.toLowerCase() === lowerQuery) score += 100;
  // Name contains query
  else if (product.name.toLowerCase().includes(lowerQuery)) score += 50;
  // Description contains query
  if (product.description.toLowerCase().includes(lowerQuery)) score += 30;
  // Manufacturer match
  if (product.manufacturer.toLowerCase().includes(lowerQuery)) score += 20;

  // Boost verified suppliers
  if ((product as any).supplier?.verified) score += 15;
  // Boost by rating
  score += (product.rating || 0) * 2;

  return score;
}
