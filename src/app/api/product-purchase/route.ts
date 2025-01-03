import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the status from query parameters
    const status = request.nextUrl.searchParams.get('status');

    // Build the where clause based on the status
    const whereClause = status ? { status } : {};

    const productPurchases = await prisma.productPurchase.findMany({
      where: whereClause,
    });

    return NextResponse.json(productPurchases);
  } catch (error: unknown) {
    console.error('Error in GET /api/product-purchase:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      companyId,
      sellerId,
      products,
      kantaWeight,
      truckNumber,
      chNo,
      fare,
      remarks,
    } = body;

    // Validate required fields
    if (!companyId || !sellerId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create multiple product purchase records
    const productPurchases = await Promise.all(
      products.map(async (product) => {
        const {
          productName,
          productQuantity,
          purchaseAmount,
          received,
          leaf,
          rej,
          shortage,
        } = product;

        return prisma.productPurchase.create({
          data: {
            companyId: parseInt(companyId),
            sellerId: parseInt(sellerId),
            productName,
            productQuantity,
            clerkUserId: userId,
            purchaseAmount,
            received,
            leaf,
            rej,
            shortage,
            kantaWeight,
            truckNumber,
            chNo,
            fare,
            remarks,
          },
        });
      })
    );

    // Create PurchaseInvoice after creating ProductPurchases
    const totalAmount = productPurchases.reduce(
      (sum, product) => sum + product.productQuantity * product.purchaseAmount,
      0
    );

    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
    });
    const seller = await prisma.seller.findUnique({
      where: { id: parseInt(sellerId) },
    });

    if (!company || !seller) {
      return NextResponse.json(
        { error: "Company or Seller not found" },
        { status: 404 }
      );
    }

    const purchaseInvoice = await prisma.purchaseInvoice.create({
      data: {
        companyId: parseInt(companyId),
        sellerId: parseInt(sellerId),
        totalAmount,
        companyDetails: JSON.stringify(company),
        sellerDetails: JSON.stringify(seller),
        productPurchases: {
          connect: productPurchases.map((product) => ({ id: product.id })),
        },
      },
    });

    // Update ProductPurchase records to link to PurchaseInvoice
    await Promise.all(
      productPurchases.map(async (product) => {
        await prisma.productPurchase.update({
          where: { id: product.id },
          data: { purchaseInvoiceId: purchaseInvoice.id },
        });
      })
    );

    // Create notification for admin/moderator
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `A new purchase has been made by ${user.name} ${userId} for ${products.length} items from ${companyId} at a total cost of ${products.reduce((sum, product) => sum + product.purchaseAmount, 0)} INR `,
          type: 'new_purchase',
          user: { connect: { clerkUserId: user.clerkUserId } },
        },
      });
    }

    return NextResponse.json(
      { message: 'Purchases saved successfully', productPurchases },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error saving purchase:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body; // Expecting an array of ids

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Missing purchase IDs' }, { status: 400 });
    }

    // Delete multiple purchases
    const deletedPurchases = await prisma.productPurchase.deleteMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
    });

    // Create notification for delete
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `Purchases with IDs ${ids.join(', ')} have been deleted by ${user.name}.`,
          type: 'purchase_delete',
          user: { connect: { clerkUserId: user.clerkUserId } },
        },
      });
    }

    return NextResponse.json({ message: 'Purchases deleted successfully', deletedPurchases }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting purchases:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    id, 
    companyId, 
    sellerId, 
    productName, 
    productQuantity, 
    purchaseAmount,
    received,
    leaf,
    rej,
    shortage,
    kantaWeight,
    truckNumber,
    chNo,
    fare,
    remarks
  } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing purchase ID' }, { status: 400 });
  }

  try {
    const updatedPurchase = await prisma.productPurchase.update({
      where: { id: parseInt(id) },
      data: {
        companyId: companyId ? parseInt(companyId) : undefined,
        sellerId: sellerId ? parseInt(sellerId) : undefined,
        productName,
        productQuantity,
        purchaseAmount,
        received,
        leaf,
        rej,
        shortage,
        kantaWeight,
        truckNumber,
        chNo,
        fare,
        remarks
      },
    });

    // Create notification for update
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `Purchase ID ${id} has been updated by ${user.name}. More details like ${companyId}, ${sellerId}, ${productName}, ${productQuantity}, ${purchaseAmount} have been updated.`,
          type: 'purchase_update',
          user: { connect: { clerkUserId: user.clerkUserId } },
        },
      });
    }

    return NextResponse.json({ message: 'Purchase updated successfully', updatedPurchase }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}