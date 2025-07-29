import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { institutions } from '@/lib/db/schema';

export async function GET() {
  try {
    const institutionsData = await db
      .select({
        id: institutions.id,
        name: institutions.name,
        type: institutions.type,
        address: institutions.address,
        contact_email: institutions.contactEmail,
        is_active: institutions.isActive,
        created_at: institutions.createdAt,
      })
      .from(institutions)
      .orderBy(institutions.name);

    return NextResponse.json(institutionsData);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
} 