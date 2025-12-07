// ABOUTME: CSV export endpoint for waitlist data
// ABOUTME: Exports all waitlist entries as downloadable CSV

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (type && type !== 'all') {
      where.type = type;
    }

    const entries = await prisma.waitlist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = [
      'ID',
      'Type',
      'Email',
      'Name',
      'Phone',
      'Business Name',
      'Service Type',
      'State',
      'Zip Code',
      'Repair Type',
      'Status',
      'Source',
      'Created At',
    ];

    const rows = entries.map((entry) => [
      entry.id,
      entry.type,
      entry.email,
      entry.name || '',
      entry.phone || '',
      entry.businessName || '',
      entry.serviceType || '',
      entry.state || '',
      entry.zipCode || '',
      entry.repairType || '',
      entry.status,
      entry.source || '',
      entry.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="waitlist-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Waitlist export error:', error);
    return NextResponse.json(
      { error: 'Failed to export waitlist' },
      { status: 500 }
    );
  }
}
