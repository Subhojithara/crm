import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

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
    const { name, email, phone, address } = body;

    // Validate required fields
    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        clerkUserId: userId,
        name,
        email,
        phone,
        address,
      },
    });

    // Create notification for new customer
    await prisma.notification.create({
      data: {
        userId,
        type: 'CUSTOMER_CREATED',
        message: `New customer ${name} has been created`,
        read: false
      }
    });

    return NextResponse.json(
      { message: 'Customer created successfully', customer },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user is an admin, moderator, or member
    if (['ADMIN', 'MODERATOR', 'MEMBER'].includes(user.role)) {
      // Fetch all customers
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
      });

      console.log("Fetched customers (all):", customers);
      return NextResponse.json({ customers }, { status: 200 });
    } else {
      // Fetch customers for the authenticated user
      const customers = await prisma.customer.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: 'desc' },
      });

      console.log("Fetched customers (user-specific):", customers);
      return NextResponse.json({ customers }, { status: 200 });
    }
  } catch (error: unknown) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}