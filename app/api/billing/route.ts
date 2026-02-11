import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getInvoicesForCustomer, getUpcomingInvoice } from '@/lib/payments/stripe';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get team with Stripe customer ID
  const result = await db
    .select({
      stripeCustomerId: teams.stripeCustomerId,
      planName: teams.planName,
      subscriptionStatus: teams.subscriptionStatus,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (result.length === 0 || !result[0].stripeCustomerId) {
    return Response.json({
      invoices: [],
      upcomingInvoice: null,
      planName: result[0]?.planName || null,
      subscriptionStatus: result[0]?.subscriptionStatus || null,
    });
  }

  const { stripeCustomerId, planName, subscriptionStatus } = result[0];

  const [invoices, upcomingInvoice] = await Promise.all([
    getInvoicesForCustomer(stripeCustomerId),
    getUpcomingInvoice(stripeCustomerId),
  ]);

  return Response.json({
    invoices,
    upcomingInvoice,
    planName,
    subscriptionStatus,
  });
}
