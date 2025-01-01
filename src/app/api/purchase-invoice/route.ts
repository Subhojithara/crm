import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, sellerId, productPurchases, ...otherData } = body;

    // Validate required fields
    if (!companyId || !sellerId || !productPurchases || !Array.isArray(productPurchases) || productPurchases.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch company and seller details
    const company = await prisma.company.findUnique({ where: { id: parseInt(companyId) } });
    const seller = await prisma.seller.findUnique({ where: { id: parseInt(sellerId) } });

    if (!company || !seller) {
      return NextResponse.json({ error: 'Company or Seller not found' }, { status: 404 });
    }

    // Calculate total amount
    const totalAmount = productPurchases.reduce(
      (sum, product) => sum + product.productQuantity * product.purchaseAmount,
      0
    );

    // Create PurchaseInvoice record
    const purchaseInvoice = await prisma.purchaseInvoice.create({
      data: {
        companyId: parseInt(companyId),
        sellerId: parseInt(sellerId),
        totalAmount,
        companyDetails: JSON.stringify(company),
        sellerDetails: JSON.stringify(seller),
        ...otherData,
        productPurchases: {
          connect: productPurchases.map((product) => ({ id: product.id })),
        },
      },
    });

    return NextResponse.json(
      { message: 'Purchase invoice saved successfully', purchaseInvoice },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error saving purchase invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 