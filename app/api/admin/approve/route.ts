import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function safeJsonParse(val: any, fallback: any = {}) {
  if (!val) return fallback;
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch {
    return fallback;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, status } = body;

    if (!id || !type || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status !== 'approved' && status !== 'rejected' && status !== 'deleted') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    let result;

    if (type === 'product') {
      if (status === 'deleted') {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await prisma.orderItem.deleteMany({ where: { productId: id } });
        await prisma.review.deleteMany({ where: { productId: id } });

        result = await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true, deleted: true, item: result });
      }

      const existing = await prisma.product.findUnique({ where: { id } });
      const specs = safeJsonParse(existing?.specs, {});
      specs.status = status;

      result = await prisma.product.update({
        where: { id },
        data: {
          lifecycle: status === 'approved' ? 'active' : 'discontinued',
          status: status === 'approved' ? 'approved' : 'rejected',
          specs: JSON.stringify(specs),
        },
      });
    } else if (type === 'business') {
      if (status === 'deleted') {
        return NextResponse.json({ error: 'Business deletion is not supported from this endpoint' }, { status: 400 });
      }

      const existing = await prisma.business.findUnique({ where: { id } });
      const badges = safeJsonParse(existing?.badges, {});
      const stats = safeJsonParse(existing?.stats, {});

      badges.verified = status === 'approved';
      badges.status = status;
      stats.status = status;

      result = await prisma.business.update({
        where: { id },
        data: {
          badges: JSON.stringify(badges),
          stats: JSON.stringify(stats),
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: result });
  } catch (error: any) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

