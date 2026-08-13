import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function safeJsonParse(value: string | null | undefined, fallback: any) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const authIdentifier =
      (authHeader ? authHeader.replace('Bearer ', '').trim() : '') ||
      searchParams.get('userId') ||
      searchParams.get('email') ||
      '';

    let business = null;

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

    if (!business && authIdentifier) {
      business = await prisma.business.findFirst({
        where: {
          OR: [
            { name: { contains: authIdentifier } },
            { email: { contains: authIdentifier } },
          ],
        },
      });
    }

    let products: any[] = [];

    if (business) {
      products = await prisma.product.findMany({
        where: { supplierId: business.id },
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              rating: true,
              badges: true,
            },
          },
        },
      });
    }

    // If no products specific to this business yet, return recently created products from DB
    if (products.length === 0) {
      products = await prisma.product.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              rating: true,
              badges: true,
            },
          },
        },
      });
    }

    const parsedProducts = products.map((p) => ({
      ...p,
      images: safeJsonParse(p.images, []),
      specs: safeJsonParse(p.specs, null),
      supplier: p.supplier
        ? {
            ...p.supplier,
            badges: safeJsonParse(p.supplier.badges, {}),
          }
        : null,
    }));

    return NextResponse.json({
      products: parsedProducts,
      total: parsedProducts.length,
      business: business ? { id: business.id, name: business.name } : null,
    });
  } catch (error: any) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json(
      {
        products: [],
        total: 0,
        error: error?.message || 'Failed to fetch seller products',
      },
      { status: 500 }
    );
  }
}
