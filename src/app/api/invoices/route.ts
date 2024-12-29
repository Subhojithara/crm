// src/app/api/invoices/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { Prisma, PaymentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const url = new URL(req.url);
  const limit = url.searchParams.get('limit');

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user is an admin, moderator, or member
    if (['ADMIN', 'MODERATOR', 'MEMBER'].includes(user.role)) {
      // Fetch all invoices with relations
      const paymentStatus = url.searchParams.get('paymentStatus');
      const whereClause: Prisma.InvoiceTableWhereInput = { userId: userId }; // Start with userId filter

      if (paymentStatus) {
        // Add paymentStatus filter if present and valid
        if (Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
          whereClause.paymentStatus = paymentStatus as PaymentStatus;
        } else {
          return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
        }
      }
      const invoices = await prisma.invoiceTable.findMany({
        where: whereClause, // Apply combined whereClause for ADMIN, MODERATOR, MEMBER
        take: limit ? Number(limit) : undefined,
        include: {
          company: true,
          client: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(invoices, { status: 200 });
    } else {
      // Fetch invoices for the authenticated user with relations
      const paymentStatus = url.searchParams.get('paymentStatus');
      const whereClause: Prisma.InvoiceTableWhereInput = { userId: userId }; // Start with userId filter

      if (paymentStatus) {
        // Add paymentStatus filter if present and valid
        if (Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
          whereClause.paymentStatus = paymentStatus as PaymentStatus;
        } else {
          return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
        }
      }

      const invoices = await prisma.invoiceTable.findMany({
        where: whereClause, // Apply combined whereClause for other users
        take: limit ? Number(limit) : undefined,
        include: {
          company: true,
          client: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(invoices, { status: 200 });
    }
  } catch (error: unknown) {
    console.error('Error fetching invoice(s):', error);
    return NextResponse.json({ error: 'Failed to fetch invoice(s)' }, { status: 500 });
  }
}