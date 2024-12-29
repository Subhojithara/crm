// src/app/api/payments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Payment } from '@/types/Payment';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const limit = req.nextUrl.searchParams.get('limit');
    const take = limit ? parseInt(limit, 10) : 5;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch payments for the specified user
    const payments = await prisma.payment.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take,
    });

    // Map Prisma Payment model to Payment type
    const formattedPayments: Payment[] = payments.map((payment) => ({
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      userId: payment.userId,
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error('Failed to fetch recent payments:', error);
    return NextResponse.json({ error: 'Failed to fetch recent payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId, amount, paymentMethod } = await request.json();

    // Input validation (add more as needed)
    if (!invoiceId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod,
        userId, // Assign the logged-in user's ID to the payment
      },
    });

    return NextResponse.json(
      { message: 'Payment created successfully', payment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}