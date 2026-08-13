import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mockProducts } from '@/lib/mock-data';

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
      // SQLite doesn't support mode:'insensitive' — use contains without mode
      // (SQLite LIKE is case-insensitive for ASCII characters by default)
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
      // SQLite LIKE is case-insensitive for ASCII — contains works fine
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
      where.status = statusParam;
    } else if (!supplierId) {
      // Public marketplace search only shows approved products
      where.status = 'approved';
    }

    // Dynamic component attributes filters
    const dynamicAttrs = [
      'capacitance', 'voltageRating', 'tolerance', 'dielectric', 'esr',
      'rippleCurrent', 'temperature', 'caseSize', 'dimensions', 'mounting',
      'termination', 'resistance', 'powerRating', 'tempCoefficient', 'technology'
    ];
    
    for (const attr of dynamicAttrs) {
      const val = searchParams.getAll(attr); // e.g., ?capacitance=1uf-10uf&capacitance=10uf-100uf
      if (val.length > 0) {
        // If multiple values selected for the same filter, OR them together
        where[attr] = { in: val };
      }
    }

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

function withTimeout<T>(promise: Promise<T>, ms = 500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

    const [products, total] = await withTimeout(
      Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
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

    // Parse JSON fields
    const parsedProducts = products.map((p: { images: string | null | undefined; specs: string | null | undefined; supplier: { badges: string | null | undefined; address: string | null | undefined; }; }) => ({
      ...p,
      images: safeJsonParse(p.images, []),
      specs: safeJsonParse(p.specs, null),
      supplier: p.supplier
        ? {
            ...p.supplier,
            badges: safeJsonParse(p.supplier.badges, {}),
            address: safeJsonParse(p.supplier.address, {}),
          }
        : null,
    }));

    if (parsedProducts.length > 0) {
      return NextResponse.json({
        products: parsedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    return getMockProductsResponse(request);
  } catch (error) {
    console.error('Products API error, falling back to mock data:', error);
    return getMockProductsResponse(request);
  }
}

function getMockProductsResponse(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').toLowerCase();
  const category = (searchParams.get('category') || '').toLowerCase();
  const supplierId = searchParams.get('supplierId') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  let filtered = mockProducts;

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

  if (supplierId) {
    filtered = filtered.filter((p) => p.supplierId === supplierId);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    products: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

function safeJsonParse(value: string | null | undefined, fallback: any) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Simple auth: expecting Authorization header with userId or email
    const authHeader = request.headers.get('authorization');
    const authIdentifier = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

    const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    // Find or create Business linked to this user/seller
    let business = null;

    try {
      if (authIdentifier && isMongoId(authIdentifier)) {
        business = await prisma.business.findFirst({
          where: { ownerId: authIdentifier },
        });
      }

      if (!business && authIdentifier && authIdentifier.includes('@')) {
        business = await prisma.business.findFirst({
          where: { email: authIdentifier },
        });
      }

      if (!business) {
        // Find existing business or create a default one
        business = await prisma.business.findFirst();
      }

      if (!business) {
        // Auto-create a minimal Business profile
        const uniqueGst = `27GST${Date.now().toString(36).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
        business = await prisma.business.create({
          data: {
            ownerId: authIdentifier && isMongoId(authIdentifier) ? authIdentifier : undefined,
            name: authIdentifier && authIdentifier.includes('@') ? authIdentifier.split('@')[0] : 'ElectroMart Seller',
            legalName: 'ElectroMart Verified Business',
            description: 'Electronic components supplier and distributor',
            businessTypes: JSON.stringify(['distributor', 'supplier']),
            gst: uniqueGst,
            email: authIdentifier && authIdentifier.includes('@') ? authIdentifier : 'seller@electromart.com',
            phone: '+91-9876543210',
            address: JSON.stringify({ city: 'Bengaluru', state: 'Karnataka', country: 'India' }),
            badges: JSON.stringify({ verified: true, topRated: false }),
            stats: JSON.stringify({ responseRate: '99%', avgDeliveryTime: '2-3 days' }),
          },
        });
      }
    } catch (bizErr) {
      console.warn('Business lookup/create warning:', bizErr);
      // Fallback business if DB creation had an issue
      business = await prisma.business.findFirst();
    }

    if (!business) {
      return NextResponse.json({ error: 'No supplier or business account found to associate product' }, { status: 400 });
    }

    // Check if the seller business account is approved by admin
    const businessBadges = safeJsonParse(business.badges, {});
    const businessStats = safeJsonParse(business.stats, {});
    const resolvedBusinessStatus =
      (business as any).status ||
      businessBadges.status ||
      businessStats.status ||
      (businessBadges.verified === true ? 'approved' : 'pending');

    if (resolvedBusinessStatus !== 'approved') {
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
      // Default high quality electronic component image
      productImages = [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
      ];
    }

    // Process specs
    let specsData: string | null = null;
    if (body.specs) {
      specsData = typeof body.specs === 'string' ? body.specs : JSON.stringify(body.specs);
    } else if (body.specifications) {
      specsData = typeof body.specifications === 'string' ? JSON.stringify({ details: body.specifications }) : JSON.stringify(body.specifications);
    }

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
        capacitance: body.capacitance || null,
        voltageRating: body.voltageRating || null,
        tolerance: body.tolerance || null,
        dielectric: body.dielectric || null,
        esr: body.esr || null,
        rippleCurrent: body.rippleCurrent || null,
        temperature: body.temperature || null,
        caseSize: body.caseSize || null,
        dimensions: body.dimensions || null,
        mounting: body.mounting || null,
        termination: body.termination || null,
        resistance: body.resistance || null,
        powerRating: body.powerRating || null,
        tempCoefficient: body.tempCoefficient || null,
        technology: body.technology || null,
        rohs: body.rohs !== undefined ? Boolean(body.rohs) : true,
        reach: body.reach !== undefined ? Boolean(body.reach) : true,
        status: 'pending',
        rating: 5.0,
        reviewCount: 0,
        likes: 0,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

