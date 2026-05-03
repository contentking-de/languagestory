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

    const instId = sql.raw('"institutions"."id"');

    const institutionsData = await db
      .select({
        id: institutions.id,
        name: institutions.name,
        type: institutions.type,
        address: institutions.address,
        contact_email: institutions.contactEmail,
        is_active: institutions.isActive,
        created_at: institutions.createdAt,
        subscription_status: sql<string | null>`(
          SELECT t.subscription_status FROM teams t
          WHERE t.institution_id = ${instId}
          ORDER BY CASE t.subscription_status
            WHEN 'active' THEN 1
            WHEN 'trialing' THEN 2
            ELSE 3
          END
          LIMIT 1
        )`,
        trial_ends_at: sql<string | null>`(
          SELECT t.trial_ends_at::text FROM teams t
          WHERE t.institution_id = ${instId}
          ORDER BY t.trial_ends_at DESC NULLS LAST
          LIMIT 1
        )`,
        plan_name: sql<string | null>`(
          SELECT t.plan_name FROM teams t
          WHERE t.institution_id = ${instId}
          ORDER BY CASE t.subscription_status
            WHEN 'active' THEN 1
            WHEN 'trialing' THEN 2
            ELSE 3
          END
          LIMIT 1
        )`,
        student_count: sql<number>`(
          SELECT count(*)::int FROM users
          WHERE users.role = 'student'
            AND (users.institution_id = ${instId}
                 OR users.id IN (
                   SELECT team_members.user_id FROM team_members
                   WHERE team_members.team_id IN (
                     SELECT teams.id FROM teams WHERE teams.institution_id = ${instId}
                   )
                 ))
        )`,
        teacher_count: sql<number>`(
          SELECT count(*)::int FROM users
          WHERE users.role = 'teacher'
            AND (users.institution_id = ${instId}
                 OR users.id IN (
                   SELECT team_members.user_id FROM team_members
                   WHERE team_members.team_id IN (
                     SELECT teams.id FROM teams WHERE teams.institution_id = ${instId}
                   )
                 ))
        )`,
        admin_count: sql<number>`(
          SELECT count(*)::int FROM users
          WHERE users.role = 'institution_admin'
            AND (users.institution_id = ${instId}
                 OR users.id IN (
                   SELECT team_members.user_id FROM team_members
                   WHERE team_members.team_id IN (
                     SELECT teams.id FROM teams WHERE teams.institution_id = ${instId}
                   )
                 ))
        )`,
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