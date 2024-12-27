import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    if (!userId || userId !== userIdParam) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        name: true,
        role: true,
        // Add other fields you need
      },
    });

    if (user) {
      return NextResponse.json({ profile: user }, { status: 200 });
    } else {
      return NextResponse.json({ profile: null }, { status: 404 });
    }
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 