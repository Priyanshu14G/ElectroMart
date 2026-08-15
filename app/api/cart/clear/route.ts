import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('DB Timeout')), ms)
    ),
  ]);
}

// DELETE /api/cart/clear — remove all items from a user's cart
// body: { userId }
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const cart = await withTimeout(
      prisma.cart.findUnique({ where: { userId } })
    );

    if (cart) {
      await withTimeout(
        prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === 'DB Timeout';
    console.error('DELETE /api/cart/clear error:', error);
    return NextResponse.json(
      { error: isTimeout ? 'Service temporarily unavailable' : 'Failed to clear cart' },
      { status: isTimeout ? 503 : 500 }
    );
  }
}
