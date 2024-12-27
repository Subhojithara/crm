import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

// DELETE /api/crates/[id]
// Delete a crate
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

    await prisma.crate.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: 'Crate deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting crate:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/crates/[id]
// Update a crate
export async function PUT(
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
    const { crateId, crateName, crateQuantity } = await request.json();

    // Validate required fields
    if (!crateId || !crateName || crateQuantity <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const updatedCrate = await prisma.crate.update({
      where: { id: parseInt(id) },
      data: {
        crateId,
        crateName,
        crateQuantity,
      },
    });

    return NextResponse.json(
      { message: 'Crate updated successfully', crate: updatedCrate },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating crate:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 