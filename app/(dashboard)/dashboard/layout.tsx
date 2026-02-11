import { getUserWithTeamData, getAccessStatus } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardNavigation } from './components/DashboardNavigation';
import { TrialGuard } from './components/TrialGuard';

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

  return (
    <DashboardNavigation 
      userRole={user.role}
      accessStatus={accessStatus?.status || 'expired'}
      trialDaysRemaining={accessStatus?.trialDaysRemaining ?? null}
      trialEndsAt={accessStatus?.trialEndsAt?.toISOString() ?? null}
      planName={accessStatus?.planName ?? null}
    >
      <TrialGuard accessStatus={accessStatus?.status || 'expired'}>
        {children}
      </TrialGuard>
    </DashboardNavigation>
  );
}
