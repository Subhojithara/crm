import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed to Promise<{ id: string }>
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

    const { id } = await params; // Await the promise to get the id

    const deletedCar = await prisma.car.delete({
      where: { id: parseInt(id) },
    });

    // Create a notification for the deleted car
    await prisma.notification.create({
      data: {
        message: `Car ${deletedCar.carName} has been deleted.`,
        type: 'CAR_DELETED',
        userId: user.clerkUserId,
      },
    });

    return NextResponse.json(
      { message: 'Car deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/car/[id]
// Update a car
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

    const { id } = await params; // Await the promise to get the id
    const { carName, carNumber, driverName, driverLicense, status } =
      await request.json();

    // Validate required fields
    if (!carName || !carNumber || !driverName || !driverLicense) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedCar = await prisma.car.update({
      where: { id: parseInt(id) },
      data: {
        carName,
        carNumber,
        driverName,
        driverLicense,
        status,
      },
    });

    // Create a notification for the updated car
    await prisma.notification.create({
      data: {
        message: `Car ${updatedCar.carName} has been updated.`,
        type: 'CAR_UPDATED',
        userId: user.clerkUserId,
      },
    });

    return NextResponse.json(
      { message: 'Car updated successfully', car: updatedCar },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

}