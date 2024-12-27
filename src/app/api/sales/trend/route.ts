// src/app/api/sales/trend/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !['ADMIN', 'MODERATOR', 'MEMBER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Example: Aggregate sales data by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesData = await prisma.invoiceTable.groupBy({
      by: ['createdAt'], // Group by creation date
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        netAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format the data for the chart
    const formattedSalesData = salesData.map((entry) => ({
      month: entry.createdAt.toLocaleString('default', { month: 'short' }), // Format date to month name
      sales: entry._sum.netAmount,
    }));

    return NextResponse.json(formattedSalesData, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}