import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq, sql, isNull, and } from 'drizzle-orm';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const individualsData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        preferredLanguage: users.preferredLanguage,
        isActive: users.isActive,
        createdAt: users.createdAt,
        teamName: teams.name,
        subscriptionStatus: teams.subscriptionStatus,
        planName: teams.planName,
        trialEndsAt: teams.trialEndsAt,
      })
      .from(users)
      .innerJoin(teamMembers, eq(teamMembers.userId, users.id))
      .innerJoin(teams, eq(teams.id, teamMembers.teamId))
      .where(
        and(
          isNull(users.institutionId),
          eq(teams.subscriptionType, 'individual'),
          isNull(users.deletedAt)
        )
      )
      .orderBy(sql`${users.createdAt} DESC`);

    const roleCounts = individualsData.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeCount = individualsData.filter((u) => u.isActive).length;
    const trialCount = individualsData.filter(
      (u) => u.subscriptionStatus === 'trialing' || (!u.subscriptionStatus && u.trialEndsAt)
    ).length;
    const subscribedCount = individualsData.filter(
      (u) => u.subscriptionStatus === 'active'
    ).length;

    return NextResponse.json({
      individuals: individualsData,
      stats: {
        total: individualsData.length,
        active: activeCount,
        inactive: individualsData.length - activeCount,
        trial: trialCount,
        subscribed: subscribedCount,
        roleCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching individuals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch individuals' },
      { status: 500 }
    );
  }
}
