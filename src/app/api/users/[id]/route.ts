import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth, createClerkClient } from '@clerk/nextjs/server';

interface UserRouteParams {
  params: {
    id: string;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<UserRouteParams['params']> }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();
    const { id } = await params;

    // Validate role
    if (!['USER', 'ADMIN', 'MODERATOR', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update user in Prisma database
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });

    // Fetch the user from Prisma to get the clerkUserId
    const clerkUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { clerkUserId: true },
    });

    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize clerkClient with your secret key
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Update user's role in Clerk using updateUserMetadata
    await client.users.updateUserMetadata(clerkUser.clerkUserId, {
      publicMetadata: {
        role: role,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
