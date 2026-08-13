import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Utility endpoint to promote a user to admin (for development/setup only)
// In production, remove this or add proper authorization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secretKey } = body;

    // Basic secret key to prevent unauthorized elevation
    if (secretKey !== process.env.ADMIN_SECRET_KEY && secretKey !== 'electromart-admin-2024') {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.name} has been promoted to admin.`,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found with that email' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
