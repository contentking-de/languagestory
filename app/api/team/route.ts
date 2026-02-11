import { getTeamForUser, getAccessStatus } from '@/lib/db/queries';

export async function GET() {
  const team = await getTeamForUser();
  
  if (!team) {
    return Response.json(null);
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
