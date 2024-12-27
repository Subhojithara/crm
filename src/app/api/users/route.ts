import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, number, bio, dateOfBirth } = body;

    // Input validation
    if (!name || !username || !number || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user already has a profile
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User profile already exists' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        clerkUserId: userId,
        name,
        username,
        number,
        bio,
        role: 'USER',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    // Create a notification for the new user
    await prisma.notification.create({
      data: {
        message: `New user ${user.name} created.`,
        type: 'USER_CREATED',
        userId: userId,
      },
    });

    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Prisma unique constraint failed
      return NextResponse.json(
        { error: 'Username or Clerk User ID already exists' },
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

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}