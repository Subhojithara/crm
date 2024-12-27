import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { productPurchaseId, sellingPrice, unit } = body;

    // Validate required fields
    if (!productPurchaseId || !sellingPrice || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the product selling record
    const updatedProductSelling = await prisma.productSelling.update({
      where: { id: parseInt(id) },
      data: {
        productPurchaseId: parseInt(productPurchaseId),
        sellingPrice,
        unit,
      },
    });

    // Create notification
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `Product selling updated for ID: ${id}`,
          type: 'product_selling_update',
          userId: user.clerkUserId,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Product selling updated successfully',
        productSelling: updatedProductSelling,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating product selling:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Find the product selling record to get the productPurchaseId
    const productSelling = await prisma.productSelling.findUnique({
      where: { id: parseInt(id) },
    });

    if (!productSelling) {
      return NextResponse.json(
        { error: 'Product selling not found' },
        { status: 404 }
      );
    }

    // Delete the product selling record
    await prisma.productSelling.delete({
      where: { id: parseInt(id) },
    });

    // Revert the product purchase status to 'not deducted'
    await prisma.productPurchase.update({
      where: { id: productSelling.productPurchaseId },
      data: { status: 'not deducted' },
    });

    // Create notification
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `Product selling deleted for ID: ${id}`,
          type: 'product_selling_delete',
          userId: user.clerkUserId,
        },
      });
    }

    return NextResponse.json(
      { message: 'Product selling deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting product selling:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user to check role (Optional: if you want role-based access)
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Fetch the product selling record
    const productSelling = await prisma.productSelling.findUnique({
      where: { id: parseInt(id) },
      include: { productPurchase: true }, // Include related data if needed
    });

    if (!productSelling) {
      return NextResponse.json(
        { error: 'Product selling not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(productSelling, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching product selling:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}