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

// GET /api/cart?userId=<id>  — fetch the user's cart
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const cart = await withTimeout(
      prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      })
    );

    return NextResponse.json({ items: cart?.items ?? [] });
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === 'DB Timeout';
    console.error('GET /api/cart error:', error);
    return NextResponse.json(
      { error: isTimeout ? 'Service temporarily unavailable' : 'Failed to fetch cart' },
      { status: isTimeout ? 503 : 500 }
    );
  }
}

// PUT /api/cart  — full cart replace (used when merging guest cart on login)
// body: { userId: string, items: CartItem[] }
export async function PUT(request: NextRequest) {
  try {
    const { userId, items } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const cartItems = Array.isArray(items) ? items : [];

    // Upsert cart, then replace all items
    const cart = await withTimeout(
      prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: { updatedAt: new Date() },
      })
    );

    // Delete existing items and re-insert merged set
    await withTimeout(
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    );

    if (cartItems.length > 0) {
      await withTimeout(
        prisma.cartItem.createMany({
          data: cartItems.map((item: any) => ({
            cartId: cart.id,
            productId: item.id ?? item.productId,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.image ?? null,
            brand: item.brand ?? null,
            manufacturer: item.manufacturer ?? null,
            supplierName: item.supplierName ?? null,
            minOrderQuantity: Number(item.minOrderQuantity) || 1,
            stock: Number(item.stock) || 100,
            category: item.category ?? null,
            leadTime: item.leadTime ?? null,
            packaging: item.packaging ?? null,
          })),
        })
      );
    }

    const updatedCart = await withTimeout(
      prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      })
    );

    return NextResponse.json({ items: updatedCart?.items ?? [] });
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === 'DB Timeout';
    console.error('PUT /api/cart error:', error);
    return NextResponse.json(
      { error: isTimeout ? 'Service temporarily unavailable' : 'Failed to update cart' },
      { status: isTimeout ? 503 : 500 }
    );
  }
}
