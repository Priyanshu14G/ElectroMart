import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mockProducts } from '@/lib/mock-data';

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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            logo: true,
            email: true,
            phone: true,
            whatsapp: true,
            rating: true,
            badges: true,
            address: true,
            stats: true,
            certifications: true,
            yearEstablished: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userId: true,
            userName: true,
            rating: true,
            title: true,
            content: true,
            verified: true,
            helpful: true,
            unhelpful: true,
            categories: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      const mock = mockProducts.find((p) => p.id === id) || mockProducts[0];
      return NextResponse.json({ product: mock });
    }

    const parsedProduct = {
      ...product,
      images: safeJsonParse(product.images, []),
      videos: safeJsonParse(product.videos, []),
      specs: safeJsonParse(product.specs, null),
      supplier: product.supplier
        ? {
            ...product.supplier,
            badges: safeJsonParse(product.supplier.badges, {}),
            address: safeJsonParse(product.supplier.address, {}),
            stats: safeJsonParse(product.supplier.stats, {}),
            certifications: safeJsonParse(product.supplier.certifications, {}),
          }
        : null,
      reviews: product.reviews.map((r) => ({
        ...r,
        categories: safeJsonParse(r.categories, null),
      })),
    };

    return NextResponse.json({ product: parsedProduct });
  } catch (error) {
    console.error('Product detail API error, using mock data:', error);
    const { id } = await params;
    const mock = mockProducts.find((p) => p.id === id) || mockProducts[0];
    return NextResponse.json({ product: mock });
  }
}
