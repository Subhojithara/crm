import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      carName,
      carNumber,
      driverName,
      driverLicense,
      driverPhone,
      carModel,
      carColor,
      carType,
      status
    } = body;

    // Validate required fields
    if (!carName || !carNumber || !driverName || !driverLicense || !driverPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const car = await prisma.car.create({
      data: {
        clerkUserId: userId,
        carName,
        carNumber,
        driverName,
        driverLicense,
        driverPhone,
        carModel,
        carColor,
        carType,
        status: status || 'active'
      },
    });

    // Create a notification for the new car
    await prisma.notification.create({
      data: {
        message: `New car ${car.carName} added.`,
        type: 'CAR_ADDED',
        userId: userId,
      },
    });

    return NextResponse.json(
      { message: 'Car saved successfully', car },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving car:', error);
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
      // Fetch all cars
      const cars = await prisma.car.findMany({
        orderBy: { createdAt: 'desc' },
      });

      console.log("Fetched cars (all):", cars);
      return NextResponse.json({ cars }, { status: 200 });
    } else {
      // Fetch cars for the authenticated user
      const cars = await prisma.car.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: 'desc' },
      });

      console.log("Fetched cars (user-specific):", cars);
      return NextResponse.json({ cars }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}