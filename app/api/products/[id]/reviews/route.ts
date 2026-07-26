import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

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

    const reviews = await prisma.review.findMany({
      where: { productId: id },
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
        images: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        ...r,
        categories: safeJsonParse(r.categories, null),
        images: safeJsonParse(r.images, []),
      })),
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, 'Title too short').max(100),
  content: z.string().min(10, 'Review too short').max(1000),
  categories: z.object({
    quality: z.number().min(1).max(5).optional(),
    originality: z.number().min(1).max(5).optional(),
    packaging: z.number().min(1).max(5).optional(),
    price: z.number().min(1).max(5).optional(),
    delivery: z.number().min(1).max(5).optional(),
    support: z.number().min(1).max(5).optional(),
  }).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { productId: id, userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        supplierId: product.supplierId,
        userId: session.user.id!,
        userName: session.user.name || 'Anonymous',
        rating: validated.rating,
        title: validated.title,
        content: validated.content,
        categories: validated.categories ? JSON.stringify(validated.categories) : null,
        verified: false,
      },
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Review POST error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
