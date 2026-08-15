import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mockProducts } from '@/lib/mock-data';

function safeJsonParse(value: string | null | undefined, fallback: any) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            logo: true,
            email: true,
            phone: true,
            whatsapp: true,
            rating: true,
            badges: true,
            address: true,
            stats: true,
            certifications: true,
            yearEstablished: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userId: true,
            userName: true,
            rating: true,
            title: true,
            content: true,
            verified: true,
            helpful: true,
            unhelpful: true,
            categories: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      const mock = mockProducts.find((p) => p.id === id) || mockProducts[0];
      return NextResponse.json({ product: mock });
    }

    const parsedProduct = {
      ...product,
      images: safeJsonParse(product.images, []),
      videos: safeJsonParse(product.videos, []),
      specs: safeJsonParse(product.specs, null),
      supplier: product.supplier
        ? {
            ...product.supplier,
            badges: safeJsonParse(product.supplier.badges, {}),
            address: safeJsonParse(product.supplier.address, {}),
            stats: safeJsonParse(product.supplier.stats, {}),
            certifications: safeJsonParse(product.supplier.certifications, {}),
          }
        : null,
      reviews: product.reviews.map((r) => ({
        ...r,
        categories: safeJsonParse(r.categories, null),
      })),
    };

    return NextResponse.json({ product: parsedProduct });
  } catch (error) {
    console.error('Product detail API error, using mock data:', error);
    const { id } = await params;
    const mock = mockProducts.find((p) => p.id === id) || mockProducts[0];
    return NextResponse.json({ product: mock });
  }
}

const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const authIdentifier = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

    if (!authIdentifier) {
      return NextResponse.json(
        { error: 'Unauthorized: seller session is required to update a product.' },
        { status: 401 }
      );
    }

    let dbUser = null;
    if (isMongoId(authIdentifier)) {
      dbUser = await prisma.user.findUnique({ where: { id: authIdentifier } });
    }

    if (!dbUser && authIdentifier.includes('@')) {
      dbUser = await prisma.user.findUnique({ where: { email: authIdentifier } });
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized: seller account not found.' }, { status: 401 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { supplier: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const sellerBusiness = await prisma.business.findFirst({
      where: {
        OR: [{ ownerId: dbUser.id }, { email: dbUser.email }],
      },
    });

    if (!sellerBusiness || existingProduct.supplierId !== sellerBusiness.id) {
      return NextResponse.json(
        { error: 'Forbidden: you can only edit products you personally listed.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawFilterAttributes = typeof body.filterAttributes === 'string'
      ? safeJsonParse(body.filterAttributes, {})
      : (body.filterAttributes || {});

    const filterAttributes = { ...rawFilterAttributes };
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && [
        'manufacturer', 'capacitance', 'voltageRating', 'tolerance', 'dielectric', 'esr', 'rippleCurrent',
        'temperature', 'caseSize', 'dimensions', 'mounting', 'termination', 'resistance', 'powerRating',
        'tempCoefficient', 'technology', 'chemistry', 'voltage', 'capacity', 'certification', 'architecture',
        'frequency', 'flash', 'peripherals', 'package', 'connectorType', 'pitch', 'currentRating', 'sensorType',
        'interface', 'color', 'wavelength', 'brightness', 'inductance', 'dcResistance', 'outputType',
        'measurementRange', 'accuracy', 'viewingAngle', 'forwardVoltage', 'forwardCurrent', 'reverseVoltage',
        'recoveryTime', 'type', 'turnsRatio', 'coreType', 'inputVoltage', 'outputVoltage', 'powerRatingValue',
        'mountedStyle', 'orientation', 'gender', 'pins', 'current'
      ].includes(key)) {
        filterAttributes[key] = value;
      }
    });

    const mergedSpecs = {
      ...(safeJsonParse(existingProduct.specs, {})),
      ...(safeJsonParse(body.specs, {})),
      ...filterAttributes,
      status: existingProduct.status,
    };

    const productData: any = {
      name: body.name || existingProduct.name,
      category: body.category || existingProduct.category,
      subcategory: body.subcategory ?? existingProduct.subcategory,
      brand: body.brand || existingProduct.brand,
      manufacturer: body.manufacturer || body.brand || existingProduct.manufacturer,
      manufacturerPartNumber: body.manufacturerPartNumber || existingProduct.manufacturerPartNumber,
      supplierPartNumber: body.supplierPartNumber || existingProduct.supplierPartNumber,
      description: body.description ?? existingProduct.description,
      images: body.images ? JSON.stringify(Array.isArray(body.images) ? body.images : [body.images]) : existingProduct.images,
      datasheet: body.datasheet ?? existingProduct.datasheet,
      stock: body.stock !== undefined ? Number(body.stock) : existingProduct.stock,
      minOrderQuantity: body.minOrderQuantity !== undefined ? Number(body.minOrderQuantity) : existingProduct.minOrderQuantity,
      price: body.price !== undefined ? Number(body.price) : existingProduct.price,
      leadTime: body.leadTime || existingProduct.leadTime,
      packaging: body.packaging || existingProduct.packaging,
      countryOfOrigin: body.countryOfOrigin || existingProduct.countryOfOrigin,
      warranty: body.warranty || existingProduct.warranty,
      specs: JSON.stringify(mergedSpecs),
      filterAttributes: JSON.stringify(filterAttributes),
      lifecycle: existingProduct.lifecycle === 'active' ? 'active' : 'pending',
      status: existingProduct.status === 'approved' ? 'approved' : 'pending',
      rohs: body.rohs !== undefined ? Boolean(body.rohs) : existingProduct.rohs,
      reach: body.reach !== undefined ? Boolean(body.reach) : existingProduct.reach,
      updatedAt: new Date(),
    };

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: productData,
    });

    return NextResponse.json({ product: updatedProduct, success: true });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const authIdentifier = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

    if (!authIdentifier) {
      return NextResponse.json(
        { error: 'Unauthorized: seller session is required to delete a product.' },
        { status: 401 }
      );
    }

    let dbUser = null;
    if (isMongoId(authIdentifier)) {
      dbUser = await prisma.user.findUnique({ where: { id: authIdentifier } });
    }

    if (!dbUser && authIdentifier.includes('@')) {
      dbUser = await prisma.user.findUnique({ where: { email: authIdentifier } });
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized: seller account not found.' },
        { status: 401 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { supplier: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const sellerBusiness = await prisma.business.findFirst({
      where: {
        OR: [{ ownerId: dbUser.id }, { email: dbUser.email }],
      },
    });

    const isOwner =
      sellerBusiness && product.supplierId === sellerBusiness.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden: you can only delete products you personally listed.' },
        { status: 403 }
      );
    }

    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    await prisma.review.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

