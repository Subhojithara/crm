import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  // Fetch user details from your database if needed
  return NextResponse.json({ user: { id: userId, role: 'Admin' } }, { status: 200 });
} 