import { getUserWithTeamData, getAccessStatus } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardNavigation } from './components/DashboardNavigation';
import { TrialGuard } from './components/TrialGuard';
import { isSuperAdmin } from '@/lib/auth/rbac';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get team data for access status check
  let accessStatus: ReturnType<typeof getAccessStatus> | null = null;
  
  if (user.teamId) {
    const teamResult = await db
      .select({
        subscriptionStatus: teams.subscriptionStatus,
        trialEndsAt: teams.trialEndsAt,
        planName: teams.planName,
      })
      .from(teams)
      .where(eq(teams.id, user.teamId))
      .limit(1);

    if (teamResult.length > 0) {
      accessStatus = getAccessStatus(teamResult[0]);
    }
  }

  // Super admins always have full access regardless of subscription status
  const userIsSuperAdmin = isSuperAdmin(user.role as any);
  // Teachers and institution admins without a team are treated as active
  // (they may have been created with a manual role assignment)
  const hasNoTeam = !user.teamId;
  const isAdminRole = user.role === 'teacher' || user.role === 'institution_admin';
  const effectiveAccessStatus = userIsSuperAdmin || (hasNoTeam && isAdminRole)
    ? 'active'
    : (accessStatus?.status || 'expired');

  return (
    <DashboardNavigation 
      userRole={user.role}
      accessStatus={effectiveAccessStatus}
      trialDaysRemaining={userIsSuperAdmin ? null : (accessStatus?.trialDaysRemaining ?? null)}
      trialEndsAt={userIsSuperAdmin ? null : (accessStatus?.trialEndsAt?.toISOString() ?? null)}
      planName={userIsSuperAdmin ? 'Super Admin' : (accessStatus?.planName ?? null)}
    >
      <TrialGuard accessStatus={effectiveAccessStatus} userRole={user.role}>
        {children}
      </TrialGuard>
    </DashboardNavigation>
  );
}
