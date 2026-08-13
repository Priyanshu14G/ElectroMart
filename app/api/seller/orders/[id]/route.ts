import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber } = body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ order: updatedOrder, message: 'Order status updated in MongoDB' });
  } catch (error: any) {
    console.error('Error updating order status in MongoDB:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status: 500 });
  }
}
