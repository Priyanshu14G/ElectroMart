import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function safeJsonParse(value: string | null | undefined, fallback: any) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verified = searchParams.get('verified');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by verified (badges.verified = true)
    // Since badges is a JSON string, we filter in JS after fetching
    // For better performance in production, use a proper JSON DB

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
          rating: true,
          email: true,
          phone: true,
          badges: true,
          address: true,
          stats: true,
          certifications: true,
          businessTypes: true,
          yearEstablished: true,
          msme: true,
          _count: { select: { products: true, reviews: true } },
        },
      }),
      prisma.business.count({ where }),
    ]);

    let parsed = businesses.map((b: any) => ({
      ...b,
      businessTypes: safeJsonParse(b.businessTypes, []),
      badges: safeJsonParse(b.badges, {}),
      address: safeJsonParse(b.address, {}),
      stats: safeJsonParse(b.stats, {}),
      certifications: safeJsonParse(b.certifications, {}),
      productCount: b._count.products,
      reviewCount: b._count.reviews,
    }));

    // Apply verified filter in memory (SQLite limitation)
    if (verified === 'true') {
      parsed = parsed.filter((b: any) => b.badges?.verified === true);
    }

    return NextResponse.json({
      suppliers: parsed,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Suppliers API error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}
