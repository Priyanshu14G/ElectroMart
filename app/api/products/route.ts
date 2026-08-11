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
