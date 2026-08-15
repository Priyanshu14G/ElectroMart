import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mockProducts } from '@/lib/mock-data';

function safeJsonParse(value: string | null | undefined, fallback: any = {}) {
  if (!value) return fallback;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

function withTimeout<T>(promise: Promise<T>, ms = 800): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const supplierId = searchParams.get('supplierId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'createdAt_desc';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const inStock = searchParams.get('inStock') === 'true';
    const rohs = searchParams.get('rohs') === 'true';

    // Build where clause
    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { brand: { contains: query } },
        { manufacturer: { contains: query } },
        { manufacturerPartNumber: { contains: query } },
        { supplierPartNumber: { contains: query } },
        { category: { contains: query } },
      ];
    }

    if (category) {
      where.category = { contains: category };
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (rohs) {
      where.rohs = true;
    }

    // Admin/Seller status filter vs Public filter
    const statusParam = searchParams.get('status');
    if (statusParam) {
      if (statusParam === 'approved') {
        where.lifecycle = 'active';
      } else {
        where.lifecycle = statusParam;
      }
    } else if (!supplierId) {
      // Public marketplace search only shows approved products
      where.lifecycle = 'active';
    }

    // Dynamic component attributes filters are stored in product specs/filterAttributes JSON.
    // Apply them in memory after fetch so older product records without a direct DB column still work.
    const dynamicFilters: Record<string, string[]> = {};
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (!value || value === 'undefined') return;
      const isDynamicFilterKey = !['q', 'category', 'supplierId', 'page', 'limit', 'sort', 'minPrice', 'maxPrice', 'inStock', 'rohs', 'status', 'manufacturer', 'mounting', 'package', 'temperature', 'connectortype', 'engineered'].includes(key.toLowerCase());
      if (isDynamicFilterKey && /^[a-zA-Z0-9]+$/.test(key)) {
        dynamicFilters[key] = value.split(',').map((v) => v.trim()).filter(Boolean);
      }
    });

    // Build orderBy
    const [sortField, sortDir] = sort.split('_');
    const orderBy: any = {};
    const validSortFields = ['price', 'rating', 'createdAt', 'reviewCount', 'stock', 'name'];
    if (validSortFields.includes(sortField)) {
      orderBy[sortField] = sortDir === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;

    const fetchLimit = Math.max(limit * 10, 200);
    const [products, total] = await withTimeout(
      Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: fetchLimit,
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                rating: true,
                badges: true,
                address: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ])
    );

    const parsedProducts = products.map((p: any) => ({
      ...p,
      images: safeJsonParse(p.images, []),
      specs: safeJsonParse(p.specs, {}),
      filterAttributes: safeJsonParse(p.filterAttributes, {}),
      supplier: p.supplier
        ? {
            ...p.supplier,
            badges: safeJsonParse(p.supplier.badges, {}),
            address: safeJsonParse(p.supplier.address, {}),
          }
        : null,
    }));

    const filteredProducts = Object.keys(dynamicFilters).length
      ? parsedProducts.filter((product) => {
          const allFilterValues = {
            ...(product.filterAttributes || {}),
            ...(product.specs || {}),
            ...(product as Record<string, any>),
          };

          return Object.entries(dynamicFilters).every(([key, values]) => {
            const rawValue = allFilterValues[key];
            if (rawValue === undefined || rawValue === null || rawValue === '') return false;

            const normalizedValues = Array.isArray(rawValue)
              ? rawValue.map((v) => String(v).toLowerCase())
              : [String(rawValue).toLowerCase()];

            return values.some((selected) => {
              const normalizedSelected = selected.toLowerCase();
              return normalizedValues.some((v) => v === normalizedSelected || v.includes(normalizedSelected) || normalizedSelected.includes(v));
            });
          });
        })
      : parsedProducts;

    const filteredTotal = filteredProducts.length;
    const totalPages = Math.ceil(filteredTotal / limit);
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        total: filteredTotal,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.warn('DB search failed or timed out, returning fallback mock products:', error);
    // Return mock products fallback
    let filtered = [...mockProducts];
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();
    const category = searchParams.get('category')?.toLowerCase();

    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    if (category) {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes(category));
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      products: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authIdentifier = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

    const body = await request.json();

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: 'Missing required product fields: name, price, category' }, { status: 400 });
    }

    // Find the business/supplier for this user
    let business = null;
    try {
      if (authIdentifier && isMongoId(authIdentifier)) {
        business = await prisma.business.findFirst({
          where: {
            OR: [
              { ownerId: authIdentifier },
              { id: authIdentifier },
            ],
          },
        });
      }

      if (!business && authIdentifier && authIdentifier.includes('@')) {
        business = await prisma.business.findFirst({
          where: { email: authIdentifier },
        });
      }

      if (!business && authIdentifier) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: isMongoId(authIdentifier) ? authIdentifier : undefined },
              { email: authIdentifier },
            ],
          },
        });
        if (dbUser) {
          business = await prisma.business.findFirst({
            where: {
              OR: [
                { ownerId: dbUser.id },
                { email: dbUser.email },
              ],
            },
          });
        }
      }

      if (!business) {
        business = await prisma.business.findFirst();
      }
    } catch (bizErr) {
      console.warn('Business lookup warning:', bizErr);
      business = await prisma.business.findFirst();
    }

    if (!business) {
      return NextResponse.json({ error: 'No supplier or business account found to associate product' }, { status: 400 });
    }

    // Check if the seller business account is approved by admin
    const businessBadges = safeJsonParse(business.badges, {});
    const businessStats = safeJsonParse(business.stats, {});
    const isApproved =
      businessBadges.status === 'approved' ||
      businessBadges.verified === true ||
      businessStats.status === 'approved' ||
      (business as any).status === 'approved';

    if (!isApproved) {
      return NextResponse.json(
        {
          error: 'Your seller account is currently pending admin approval. You will be able to add and list products once your seller account has been approved by the admin.',
        },
        { status: 403 }
      );
    }

    // Process and normalize product images
    let productImages: string[] = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      productImages = body.images;
    } else if (typeof body.images === 'string' && body.images.trim()) {
      try {
        const parsed = JSON.parse(body.images);
        productImages = Array.isArray(parsed) ? parsed : [body.images];
      } catch {
        productImages = [body.images];
      }
    } else {
      productImages = [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
      ];
    }

    // Process specs & dynamic technical attributes
    let baseSpecs: any = {};
    if (body.specs) {
      baseSpecs = typeof body.specs === 'string' ? safeJsonParse(body.specs, {}) : body.specs;
    } else if (body.specifications) {
      baseSpecs = typeof body.specifications === 'string' ? { details: body.specifications } : body.specifications;
    }

    const filterAttributes: Record<string, any> = {};
    const rawFilterAttributes = typeof body.filterAttributes === 'string' ? safeJsonParse(body.filterAttributes, {}) : (body.filterAttributes || {});
    Object.entries(rawFilterAttributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filterAttributes[key] = value;
      }
    });

    const dynamicAttrs: any = {
      ...baseSpecs,
      ...rawFilterAttributes,
      ...filterAttributes,
      status: 'pending',
      capacitance: body.capacitance || rawFilterAttributes.capacitance || null,
      voltageRating: body.voltageRating || rawFilterAttributes.voltageRating || null,
      tolerance: body.tolerance || rawFilterAttributes.tolerance || null,
      dielectric: body.dielectric || rawFilterAttributes.dielectric || null,
      esr: body.esr || rawFilterAttributes.esr || null,
      rippleCurrent: body.rippleCurrent || rawFilterAttributes.rippleCurrent || null,
      temperature: body.temperature || rawFilterAttributes.temperature || null,
      caseSize: body.caseSize || rawFilterAttributes.caseSize || null,
      dimensions: body.dimensions || rawFilterAttributes.dimensions || null,
      mounting: body.mounting || rawFilterAttributes.mounting || null,
      termination: body.termination || rawFilterAttributes.termination || null,
      resistance: body.resistance || rawFilterAttributes.resistance || null,
      powerRating: body.powerRating || rawFilterAttributes.powerRating || null,
      tempCoefficient: body.tempCoefficient || rawFilterAttributes.tempCoefficient || null,
      technology: body.technology || rawFilterAttributes.technology || null,
      manufacturer: body.manufacturer || body.brand || rawFilterAttributes.manufacturer || null,
    };
    const specsData = JSON.stringify(dynamicAttrs);
    const filterAttributesData = JSON.stringify(filterAttributes);

    const price = parseFloat(body.price) || 0;
    const stock = parseInt(body.stock, 10) || 0;
    const minOrderQuantity = parseInt(body.minOrderQuantity, 10) || 1;
    const brand = body.brand || body.manufacturer || 'ElectroMart';
    const manufacturer = body.manufacturer || body.brand || 'ElectroMart';
    const manufacturerPartNumber = body.manufacturerPartNumber || `MPN-${Date.now().toString(36).toUpperCase()}`;
    const supplierPartNumber = body.supplierPartNumber || `SPN-${Date.now().toString(36).toUpperCase()}`;
    const category = (body.category || 'general').toLowerCase().trim();
    const leadTime = body.leadTime || '2-4 business days';
    const packaging = body.packaging || 'Standard Packaging';
    const countryOfOrigin = body.countryOfOrigin || 'India';
    const warranty = body.warranty || '1 Year Standard Warranty';

    const product = await prisma.product.create({
      data: {
        name: body.name,
        category,
        subcategory: body.subcategory || null,
        brand,
        manufacturer,
        manufacturerPartNumber,
        supplierPartNumber,
        description: body.description || body.name || '',
        images: JSON.stringify(productImages),
        datasheet: body.datasheet || null,
        supplierId: business.id,
        stock,
        minOrderQuantity,
        price,
        leadTime,
        packaging,
        countryOfOrigin,
        warranty,
        specs: specsData,
        filterAttributes: filterAttributesData,
        lifecycle: 'pending',
        rohs: body.rohs !== undefined ? Boolean(body.rohs) : true,
        reach: body.reach !== undefined ? Boolean(body.reach) : true,
        rating: 5.0,
        reviewCount: 0,
        likes: 0,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product listing:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create product listing in MongoDB' },
      { status: 500 }
    );
  }
}
