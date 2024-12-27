import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
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

    const { crateId, crateName, crateQuantity } = await request.json();

    // Validate required fields
    if (!crateId || !crateName || crateQuantity <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Create a new crate record
    const crate = await prisma.crate.create({
      data: {
        crateId,
        crateName,
        crateQuantity,
        clerkUserId: userId,
      },
    });

    return NextResponse.json(
      { message: 'Crate saved successfully', crate },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error saving crate:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET /api/crates
// Get all crates
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const crates = await prisma.crate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    console.log("Fetched crates:", crates); // Log the data

    return NextResponse.json({ crates }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching crates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 


