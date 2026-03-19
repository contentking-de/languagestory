import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamClassNames } from '@/lib/db/schema';
import { getUserWithTeamData } from '@/lib/db/queries';
import { eq, asc, and } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUserWithTeamData();

    if (!user?.teamId) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 401 });
    }

    const classNames = await db
      .select({ id: teamClassNames.id, name: teamClassNames.name })
      .from(teamClassNames)
      .where(eq(teamClassNames.teamId, user.teamId))
      .orderBy(asc(teamClassNames.name));

    return NextResponse.json({ classNames });
  } catch (error) {
    console.error('Error fetching class names:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class names' },
      { status: 500 }
    );
  }
}
