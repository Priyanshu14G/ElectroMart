import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function safeJsonParse(value: string | null | undefined, fallback: any) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supplier = await prisma.business.findUnique({
      where: { id },
      include: {
        products: {
          take: 12,
          orderBy: { rating: 'desc' },
          select: {
            id: true,
            name: true,
            category: true,
            images: true,
            price: true,
            rating: true,
            reviewCount: true,
            stock: true,
            minOrderQuantity: true,
            leadTime: true,
            lifecycle: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userName: true,
            rating: true,
            title: true,
            content: true,
            verified: true,
            helpful: true,
            categories: true,
            createdAt: true,
          },
        },
        _count: { select: { products: true, reviews: true } },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const parsed = {
      ...supplier,
      businessTypes: safeJsonParse(supplier.businessTypes, []),
      address: safeJsonParse(supplier.address, {}),
      factoryAddress: safeJsonParse(supplier.factoryAddress, null),
      certifications: safeJsonParse(supplier.certifications, {}),
      gallery: safeJsonParse(supplier.gallery, []),
      badges: safeJsonParse(supplier.badges, {}),
      stats: safeJsonParse(supplier.stats, {}),
      productCount: supplier._count.products,
      reviewCount: supplier._count.reviews,
      products: supplier.products.map((p) => ({
        ...p,
        images: safeJsonParse(p.images, []),
      })),
      reviews: supplier.reviews.map((r) => ({
        ...r,
        categories: safeJsonParse(r.categories, null),
      })),
    };

    return NextResponse.json({ supplier: parsed });
  } catch (error) {
    console.error('Supplier detail API error:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
}
