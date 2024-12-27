// src/app/api/payments/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get('limit');

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
      // Fetch all payments
      const payments = await prisma.payment.findMany({
        take: limit ? Number(limit) : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(payments, { status: 200 });
    } else {
      // Fetch payments for the authenticated user
      const payments = await prisma.payment.findMany({
        where: { invoice: { userId: userId } },
        take: limit ? Number(limit) : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(payments, { status: 200 });
    }
  } catch (error: unknown) {
    console.error('Error fetching payment(s):', error);
    return NextResponse.json({ error: 'Failed to fetch payment(s)' }, { status: 500 });
  }
}