import { getTeamForUser, getAccessStatus, getUser } from '@/lib/db/queries';

export async function GET() {
  const team = await getTeamForUser();
  
  if (!team) {
    return Response.json(null);
  }

  // Super admins always have full access regardless of subscription status
  const user = await getUser();
  if (user?.role === 'super_admin') {
    return Response.json({
      ...team,
      accessStatus: 'active',
      trialDaysRemaining: null,
    });
  }

  const accessInfo = getAccessStatus({
    subscriptionStatus: team.subscriptionStatus,
    trialEndsAt: team.trialEndsAt,
    planName: team.planName,
  });

  return Response.json({
    ...team,
    accessStatus: accessInfo.status,
    trialDaysRemaining: accessInfo.trialDaysRemaining,
  });
}
