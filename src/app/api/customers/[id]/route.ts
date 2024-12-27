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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, address } = body;

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    // Create notification for customer update
    await prisma.notification.create({
      data: {
        userId,
        type: 'CUSTOMER_UPDATED',
        message: `Customer ${name} has been updated`,
        read: false
      }
    });

    return NextResponse.json(customer, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating customer:', error);
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });

    // Create notification for customer deletion
    await prisma.notification.create({
      data: {
        userId,
        type: 'CUSTOMER_DELETED',
        message: `Customer ${customer.name} has been deleted`,
        read: false
      }
    });

    return NextResponse.json(
      { message: 'Customer deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}