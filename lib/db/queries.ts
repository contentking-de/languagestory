import { desc, and, eq, isNull, gte, lte, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getUserWithTeamData() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      userRole: users.role,
      teamRole: teamMembers.role,
      institutionId: users.institutionId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      deletedAt: users.deletedAt,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const userData = result[0];
  // Use team role if available, otherwise fall back to user role
  return {
    ...userData,
    role: userData.teamRole || userData.userRole
  };
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
    subscriptionType?: 'individual' | 'institution' | 'family';
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

/**
 * Updates the role of the team owner (first member) in both the users
 * table and the team_members table. Used when a subscription changes
 * to assign the correct role (e.g. institution_admin or member).
 */
export async function updateUserAndTeamMemberRole(
  teamId: number,
  newRole: 'super_admin' | 'institution_admin' | 'teacher' | 'student' | 'parent' | 'content_creator' | 'member'
) {
  // Find the team owner (first team member / the one who subscribed)
  const members = await db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(teamMembers.joinedAt)
    .limit(1);

  if (members.length === 0) {
    console.error('No team members found for team:', teamId);
    return;
  }

  const ownerId = members[0].userId;

  // Update user role
  await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, ownerId));

  // Update team_members role
  await db
    .update(teamMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, ownerId)
      )
    );
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

// Enhanced activity analytics queries
export async function getActivityAnalytics(dateRange?: { from: Date; to: Date }, userId?: number) {
  const user = await getUserWithTeamData();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // For teachers/parents, they can view team activities; for students, only their own
  const targetUserId = userId && user.role !== 'student' ? userId : user.id;
  
  let whereConditions = and(
    eq(activityLogs.teamId, user.teamId!),
    targetUserId ? eq(activityLogs.userId, targetUserId) : undefined
  );

  if (dateRange) {
    whereConditions = and(
      whereConditions,
      gte(activityLogs.timestamp, dateRange.from),
      lte(activityLogs.timestamp, dateRange.to)
    );
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      userId: activityLogs.userId,
      userName: users.name,
      userRole: users.role
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(whereConditions)
    .orderBy(desc(activityLogs.timestamp));
}

export async function getActivityStatistics(dateRange?: { from: Date; to: Date }, userId?: number) {
  const user = await getUserWithTeamData();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const targetUserId = userId && user.role !== 'student' ? userId : user.id;
  
  let whereConditions = and(
    eq(activityLogs.teamId, user.teamId!),
    targetUserId ? eq(activityLogs.userId, targetUserId) : undefined
  );

  if (dateRange) {
    whereConditions = and(
      whereConditions,
      gte(activityLogs.timestamp, dateRange.from),
      lte(activityLogs.timestamp, dateRange.to)
    );
  }

  // Get activity counts by type
  const activityCounts = await db
    .select({
      action: activityLogs.action,
      count: sql<number>`count(*)`.as('count')
    })
    .from(activityLogs)
    .where(whereConditions)
    .groupBy(activityLogs.action);

  // Get daily activity for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyActivity = await db
    .select({
      date: sql<string>`DATE(${activityLogs.timestamp})`.as('date'),
      count: sql<number>`count(*)`.as('count'),
      action: activityLogs.action
    })
    .from(activityLogs)
    .where(and(
      whereConditions,
      gte(activityLogs.timestamp, thirtyDaysAgo)
    ))
    .groupBy(sql`DATE(${activityLogs.timestamp})`, activityLogs.action)
    .orderBy(sql`DATE(${activityLogs.timestamp})`);

  // Get total counts
  const totalActivities = await db
    .select({
      total: sql<number>`count(*)`.as('total')
    })
    .from(activityLogs)
    .where(whereConditions);

  return {
    activityCounts,
    dailyActivity,
    totalActivities: totalActivities[0]?.total || 0
  };
}

export async function getTeamMembers(teamId: number) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    })
    .from(users)
    .innerJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(users.name);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

// ─── Access Status (Trial / Subscription) ─────────────────────────────────────

export type AccessStatus = 'trial' | 'active' | 'expired' | 'canceled';

export interface AccessInfo {
  status: AccessStatus;
  trialEndsAt: Date | null;
  trialDaysRemaining: number | null;
  planName: string | null;
}

/**
 * Determines the current access status for a team.
 * Priority: active subscription > trialing subscription > app-level trial > expired
 */
export function getAccessStatus(team: {
  subscriptionStatus: string | null;
  trialEndsAt: Date | null;
  planName: string | null;
}): AccessInfo {
  // Active paid subscription
  if (team.subscriptionStatus === 'active') {
    return {
      status: 'active',
      trialEndsAt: team.trialEndsAt,
      trialDaysRemaining: null,
      planName: team.planName,
    };
  }

  // Stripe-level trialing (legacy, for existing subscriptions)
  if (team.subscriptionStatus === 'trialing') {
    return {
      status: 'active',
      trialEndsAt: team.trialEndsAt,
      trialDaysRemaining: null,
      planName: team.planName,
    };
  }

  // App-level trial (new flow: no Stripe yet)
  if (team.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(team.trialEndsAt);
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining > 0) {
      return {
        status: 'trial',
        trialEndsAt: trialEnd,
        trialDaysRemaining: daysRemaining,
        planName: null,
      };
    }
  }

  // Canceled subscription
  if (team.subscriptionStatus === 'canceled' || team.subscriptionStatus === 'unpaid') {
    return {
      status: 'canceled',
      trialEndsAt: team.trialEndsAt,
      trialDaysRemaining: null,
      planName: null,
    };
  }

  // Everything else = expired (trial ended, no subscription)
  return {
    status: 'expired',
    trialEndsAt: team.trialEndsAt,
    trialDaysRemaining: null,
    planName: null,
  };
}

/**
 * Gets the access info for the currently logged-in user's team.
 */
export async function getAccessInfoForCurrentUser(): Promise<AccessInfo | null> {
  const user = await getUser();
  if (!user) return null;

  const result = await db
    .select({
      subscriptionStatus: teams.subscriptionStatus,
      trialEndsAt: teams.trialEndsAt,
      planName: teams.planName,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (result.length === 0) return null;

  return getAccessStatus(result[0]);
}
