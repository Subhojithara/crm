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

    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      address,
      phone,
      email,
      website,
      gst,
      upi,
      bankName,
      accountNumber,
      ifsc,
      extraDetails,
      fssai,
    } = body;

    // Validate required fields
    if (!name || !address || !phone || !email || !gst) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        address,
        phone,
        email,
        website,
        gst,
        upi,
        bankName,
        accountNumber,
        ifsc,
        extraDetails,
        fssai,
        clerkUserId: userId,
      },
    });

    // Create notification for admin/moderator
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `New company ${name} created`,
          type: 'new_company',
          userId: user.clerkUserId,
        },
      });
    }

    return NextResponse.json(
      { message: 'Company saved successfully', company },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error saving company:', error);

    if (error instanceof Error && (error as { code?: string }).code === 'P2002') { // Prisma unique constraint failed
      return NextResponse.json(
        { error: 'A company with this clerkUserId already exists.' },
        { status: 409 }
      );
    }

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

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Allow ADMIN, MODERATOR, and MEMBER roles
    const allowedRoles = ['ADMIN', 'MODERATOR', 'MEMBER'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        gst: true,
        upi: true,
        bankName: true,
        accountNumber: true,
        ifsc: true,
        extraDetails: true,
        fssai: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("Fetched companies:", companies); // Log the data

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// You can similarly implement PUT, DELETE, GET methods with appropriate authorization
