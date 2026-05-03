import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teams, users, teamMembers, institutions } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { getUserWithTeamData } from '@/lib/db/queries';
import { sendTrialExtensionEmail } from '@/lib/email/trial-extension-email';

const EXTENSION_DAYS = 14;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const institutionId = parseInt(id);

    if (isNaN(institutionId)) {
      return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 });
    }

    const [institution] = await db
      .select({ id: institutions.id, name: institutions.name })
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1);

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    const institutionTeams = await db
      .select({
        id: teams.id,
        trialEndsAt: teams.trialEndsAt,
        subscriptionStatus: teams.subscriptionStatus,
      })
      .from(teams)
      .where(eq(teams.institutionId, institutionId));

    if (institutionTeams.length === 0) {
      return NextResponse.json(
        { error: 'No teams found for this institution' },
        { status: 404 }
      );
    }

    const now = new Date();
    const updatedTeams: { id: number; newTrialEnd: Date }[] = [];

    for (const team of institutionTeams) {
      const currentEnd = team.trialEndsAt ? new Date(team.trialEndsAt) : null;
      const baseDate = currentEnd && currentEnd > now ? currentEnd : now;
      const newTrialEnd = new Date(baseDate.getTime() + EXTENSION_DAYS * 24 * 60 * 60 * 1000);

      await db
        .update(teams)
        .set({ trialEndsAt: newTrialEnd, updatedAt: now })
        .where(eq(teams.id, team.id));

      updatedTeams.push({ id: team.id, newTrialEnd });
    }

    const latestTrialEnd = updatedTeams.reduce(
      (latest, t) => (t.newTrialEnd > latest ? t.newTrialEnd : latest),
      updatedTeams[0].newTrialEnd
    );

    const teacherRows = await db.execute(sql`
      SELECT DISTINCT u.name, u.email
      FROM users u
      WHERE u.role = 'teacher'
        AND (
          u.institution_id = ${institutionId}
          OR u.id IN (
            SELECT tm.user_id FROM team_members tm
            WHERE tm.team_id IN (
              SELECT t.id FROM teams t WHERE t.institution_id = ${institutionId}
            )
          )
        )
    `);

    let emailsSent = 0;
    for (const teacher of teacherRows) {
      const row = teacher as { name: string; email: string };
      if (row.email) {
        await sendTrialExtensionEmail({
          name: row.name || 'Teacher',
          email: row.email,
          institutionName: institution.name,
          newTrialEndDate: latestTrialEnd,
        });
        emailsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      teamsUpdated: updatedTeams.length,
      newTrialEndsAt: latestTrialEnd.toISOString(),
      emailsSent,
    });
  } catch (error) {
    console.error('Error extending trial:', error);
    return NextResponse.json(
      { error: 'Failed to extend trial period' },
      { status: 500 }
    );
  }
}
