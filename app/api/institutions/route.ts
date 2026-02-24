import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { institutions } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

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
        student_count: sql<number>`(SELECT count(*)::int FROM users WHERE users.institution_id = ${institutions.id} AND users.role = 'student')`,
        teacher_count: sql<number>`(SELECT count(*)::int FROM users WHERE users.institution_id = ${institutions.id} AND users.role = 'teacher')`,
        course_count: sql<number>`(SELECT count(*)::int FROM courses WHERE courses.institution_id = ${institutions.id})`,
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