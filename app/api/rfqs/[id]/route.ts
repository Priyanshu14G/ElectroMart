import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { mockRFQs } from '@/lib/mock-data';
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        items: true,
        quotations: {
          include: { items: true },
        },
      },
    });

    if (!rfq) {
      const mock = mockRFQs.find((r) => r.id === id) || mockRFQs[0];
      return NextResponse.json({ rfq: mock });
    }

    return NextResponse.json({
      rfq: { ...rfq, bom: safeJsonParse(rfq.bom, null) },
    });
  } catch (error) {
    console.error('RFQ GET error, using mock data:', error);
    const { id } = await params;
    const mock = mockRFQs.find((r) => r.id === id) || mockRFQs[0];
    return NextResponse.json({ rfq: mock });
  }
}

const patchSchema = z.object({
  status: z.enum(['draft', 'published', 'quoted', 'ordered', 'completed', 'cancelled']).optional(),
  targetPrice: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const rfq = await prisma.rFQ.findUnique({ where: { id } });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.customerId !== session.user.id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = patchSchema.parse(body);

    const updated = await prisma.rFQ.update({
      where: { id },
      data: { ...validated },
      include: { items: true },
    });

    return NextResponse.json({ rfq: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('RFQ PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update RFQ' }, { status: 500 });
  }
}
