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

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch all businesses and business owner users
    const allBusinesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const businessUsers = await prisma.user.findMany({
      where: { role: 'business_owner' },
    });

    // Match each business owner user with their business or create a virtual pending item
    const pendingBusinessesList: any[] = [];
    const seenBusinessIds = new Set<string>();

    for (const b of allBusinesses) {
      const badges = safeJsonParse(b.badges, {});
      const stats = safeJsonParse(b.stats, {});
      const bStatus = (b as any).status || badges.status || stats.status || (badges.verified === true ? 'approved' : 'pending');

      const isPending =
        bStatus === 'pending' ||
        badges.status === 'pending' ||
        badges.verified === false ||
        b.gst?.startsWith('PENDING') ||
        (!badges.verified && bStatus !== 'approved');

      if (isPending && bStatus !== 'approved' && badges.verified !== true && bStatus !== 'rejected') {
        seenBusinessIds.add(b.id);
        pendingBusinessesList.push({
          ...b,
          status: 'pending',
        });
      }
    }

    // Also check for any business_owner users who might not have a business record yet
    for (const u of businessUsers) {
      const hasBiz = allBusinesses.some(
        (b) => b.ownerId === u.id || b.email === u.email
      );
      if (!hasBiz) {
        // Auto-create a pending business record for them
        try {
          const uniqueGst = `PENDING${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
          const newBiz = await prisma.business.create({
            data: {
              ownerId: u.id,
              name: u.name,
              legalName: u.name,
              description: 'Electronic components and hardware supplier awaiting admin verification.',
              businessTypes: JSON.stringify(['supplier']),
              gst: uniqueGst,
              email: u.email,
              phone: u.phone || '+91-9876543210',
              address: JSON.stringify({ street: '', city: 'Bengaluru', state: 'Karnataka', country: 'India' }),
              badges: JSON.stringify({ verified: false, status: 'pending' }),
              stats: JSON.stringify({ status: 'pending', responseRate: 95 }),
              rating: 5.0,
            },
          });
          pendingBusinessesList.push({
            ...newBiz,
            status: 'pending',
          });
        } catch (err) {
          console.error('Failed to auto-create business for user:', u.email, err);
        }
      }
    }

    // 2. Fetch pending products using lifecycle field
    const pendingProductsList = await prisma.product.findMany({
      where: { lifecycle: 'pending' },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });

    const existingProductsList = await prisma.product.findMany({
      where: {
        lifecycle: {
          in: ['active', 'discontinued', 'obsolete'],
        },
      },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      products: pendingProductsList,
      businesses: pendingBusinessesList,
      existingProducts: existingProductsList,
    });
  } catch (error: any) {
    console.error('Failed to fetch pending items:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

