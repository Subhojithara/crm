import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Ensure you have a Prisma client instance
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the user to check role
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const sellers = await prisma.seller.findMany();
  return NextResponse.json(sellers);
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the user to check role
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { name, address, email, number } = await request.json();

  if (!name || !address || !email || !number) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    const newSeller = await prisma.seller.create({
      data: {
        name,
        address,
        email,
        number,
        clerkUserId: userId.toString(), // Convert userId to string
      },
    });

    // Create notification for admin/moderator
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MODERATOR'] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `New seller ${name} added`,
          type: 'new_seller',
          userId: user.clerkUserId,
        },
      });
    }

    return NextResponse.json(newSeller, { status: 201 });
  } catch (error) {
    console.error('Error creating seller:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target.includes('email')) {
          return NextResponse.json(
            { error: 'A seller with this email already exists.' },
            { status: 409 }
          );
        } else if (target.includes('clerkUserId')) {
          return NextResponse.json(
            { error: 'A seller with this clerkUserId already exists.' },
            { status: 409 }
          );
        } else {
          return NextResponse.json(
            { error: 'A unique constraint violation occurred.' },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json({ error: 'Error creating seller' }, { status: 500 });
  }
}