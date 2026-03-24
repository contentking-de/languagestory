import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { institutions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || !['super_admin', 'institution_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const institutionId = parseInt(id);

    if (isNaN(institutionId)) {
      return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 });
    }

    const [institution] = await db
      .select({
        id: institutions.id,
        name: institutions.name,
        type: institutions.type,
        address: institutions.address,
        contact_email: institutions.contactEmail,
        is_active: institutions.isActive,
        created_at: institutions.createdAt,
        updated_at: institutions.updatedAt,
        student_count: sql<number>`(SELECT count(*)::int FROM users WHERE users.institution_id = ${institutions.id} AND users.role = 'student')`,
        teacher_count: sql<number>`(SELECT count(*)::int FROM users WHERE users.institution_id = ${institutions.id} AND users.role = 'teacher')`,
        course_count: sql<number>`(SELECT count(*)::int FROM courses WHERE courses.institution_id = ${institutions.id})`,
      })
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1);

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json({ error: 'Failed to fetch institution' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || !['super_admin', 'institution_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const institutionId = parseInt(id);

    if (isNaN(institutionId)) {
      return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, type, address, contactEmail, isActive } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const [updated] = await db
      .update(institutions)
      .set({
        name,
        type,
        address: address || null,
        contactEmail: contactEmail || null,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(institutions.id, institutionId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json({ error: 'Failed to update institution' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || !['super_admin', 'institution_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const institutionId = parseInt(id);

    if (isNaN(institutionId)) {
      return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: institutions.id })
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    await db.delete(institutions).where(eq(institutions.id, institutionId));

    return NextResponse.json({ success: true, message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json({ error: 'Failed to delete institution' }, { status: 500 });
  }
}
