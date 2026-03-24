import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { institutions } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUserWithTeamData();
    if (!user || !['super_admin', 'institution_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

export async function POST(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user || !['super_admin', 'institution_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, address, contactEmail } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const [newInstitution] = await db
      .insert(institutions)
      .values({
        name,
        type,
        address: address || null,
        contactEmail: contactEmail || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newInstitution, { status: 201 });
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json(
      { error: 'Failed to create institution' },
      { status: 500 }
    );
  }
} 