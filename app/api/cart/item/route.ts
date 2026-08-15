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

/** Ensure cart exists for user, return it */
async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

// POST /api/cart/item — add or increment a single item
// body: { userId, item: CartItem }
export async function POST(request: NextRequest) {
  try {
    const { userId, item } = await request.json();
    if (!userId || !item?.productId) {
      return NextResponse.json({ error: 'userId and item.productId are required' }, { status: 400 });
    }

    const cart = await withTimeout(getOrCreateCart(userId));

    // Check if item already exists in this cart
    const existing = await withTimeout(
      prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: item.productId },
      })
    );

    let cartItem;
    if (existing) {
      const newQty = Math.min(
        existing.quantity + (Number(item.quantity) || 1),
        Number(item.stock) || 9999
      );
      cartItem = await withTimeout(
        prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        })
      );
    } else {
      cartItem = await withTimeout(
        prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
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
          },
        })
      );
    }

    return NextResponse.json({ item: cartItem });
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === 'DB Timeout';
    console.error('POST /api/cart/item error:', error);
    return NextResponse.json(
      { error: isTimeout ? 'Service temporarily unavailable' : 'Failed to add item' },
      { status: isTimeout ? 503 : 500 }
    );
  }
}

// PATCH /api/cart/item — update quantity of a specific item
// body: { userId, productId, quantity }
export async function PATCH(request: NextRequest) {
  try {
    const { userId, productId, quantity } = await request.json();
    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json({ error: 'userId, productId, and quantity are required' }, { status: 400 });
    }

    const cart = await withTimeout(
      prisma.cart.findUnique({ where: { userId } })
    );
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (Number(quantity) <= 0) {
      // Remove the item if quantity is 0 or less
      await withTimeout(
        prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId },
        })
      );
      return NextResponse.json({ removed: true });
    }

    const updated = await withTimeout(
      prisma.cartItem.updateMany({
        where: { cartId: cart.id, productId },
        data: { quantity: Number(quantity) },
      })
    );

    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === 'DB Timeout';
    console.error('PATCH /api/cart/item error:', error);
    return NextResponse.json(
      { error: isTimeout ? 'Service temporarily unavailable' : 'Failed to update quantity' },
      { status: isTimeout ? 503 : 500 }
    );
  }
}

// DELETE /api/cart/item — remove one item from the cart
// body: { userId, productId }
export async function DELETE(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();
    if (!userId || !productId) {
      return NextResponse.json({ error: 'userId and productId are required' }, { status: 400 });
    }

    const cart = await withTimeout(
      prisma.cart.findUnique({ where: { userId } })
    );
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    await withTimeout(
      prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === 'DB Timeout';
    console.error('DELETE /api/cart/item error:', error);
    return NextResponse.json(
      { error: isTimeout ? 'Service temporarily unavailable' : 'Failed to remove item' },
      { status: isTimeout ? 503 : 500 }
    );
  }
}
