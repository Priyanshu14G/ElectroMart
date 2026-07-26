import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

function safeJsonParse(value: string | null | undefined, fallback: any) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = { customerId: session.user.id };
    if (status) where.status = status;

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          quotations: {
            select: {
              id: true,
              supplierId: true,
              supplierName: true,
              totalPrice: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return NextResponse.json({
      rfqs: rfqs.map((r) => ({ ...r, bom: safeJsonParse(r.bom, null) })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('RFQs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch RFQs' }, { status: 500 });
  }
}

const rfqItemSchema = z.object({
  partNumber: z.string().min(1),
  componentName: z.string().min(1),
  quantity: z.number().int().positive(),
  specifications: z.string().optional(),
  notes: z.string().optional(),
});

const rfqSchema = z.object({
  title: z.string().min(3, 'Title too short'),
  description: z.string().min(10, 'Description too short'),
  items: z.array(rfqItemSchema).min(1, 'At least one item required'),
  targetPrice: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  deliveryDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  expiresAt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validated = rfqSchema.parse(body);

    const expiresAt = validated.expiresAt
      ? new Date(validated.expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const rfq = await prisma.rFQ.create({
      data: {
        customerId: session.user.id!,
        customerName: session.user.name || 'Unknown',
        title: validated.title,
        description: validated.description,
        targetPrice: validated.targetPrice,
        budgetMin: validated.budgetMin,
        budgetMax: validated.budgetMax,
        deliveryDate: validated.deliveryDate,
        priority: validated.priority,
        status: 'published',
        expiresAt,
        items: {
          create: validated.items.map((item) => ({
            partNumber: item.partNumber,
            componentName: item.componentName,
            quantity: item.quantity,
            specifications: item.specifications,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ rfq }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('RFQ POST error:', error);
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 });
  }
}
