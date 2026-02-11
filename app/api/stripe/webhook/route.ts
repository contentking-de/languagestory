import Stripe from 'stripe';
import {
  handleSubscriptionChange,
  stripe,
  getRoleForProduct,
  getSubscriptionTypeForProduct
} from '@/lib/payments/stripe';
import {
  getTeamByStripeCustomerId,
  updateTeamSubscription,
  updateUserAndTeamMemberRole
} from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(
          'Payment failed for customer:',
          invoice.customer,
          'Invoice:',
          invoice.id
        );
        // TODO: Optional – Nutzer per E-Mail benachrichtigen
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

/**
 * Handles a completed checkout session. This is the first event after
 * a customer finishes paying – we use it to link the Stripe customer
 * to the team and assign the correct role.
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id;

  if (!customerId) {
    console.error('No customer ID in checkout session:', session.id);
    return;
  }

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  if (!subscriptionId) {
    console.error('No subscription in checkout session:', session.id);
    return;
  }

  // Retrieve the full subscription to get product info
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  });

  const plan = subscription.items.data[0]?.price;
  const productId = plan
    ? (typeof plan.product === 'string' ? plan.product : (plan.product as Stripe.Product).id)
    : null;
  const productName = plan
    ? (typeof plan.product === 'string' ? plan.product : (plan.product as Stripe.Product).name)
    : null;

  // Check if team already linked (checkout route may have handled it)
  const existingTeam = await getTeamByStripeCustomerId(customerId);
  if (existingTeam) {
    // Team already linked – just ensure subscription data is up-to-date
    const subscriptionType = productId ? getSubscriptionTypeForProduct(productId) : null;
    await updateTeamSubscription(existingTeam.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId,
      planName: productName,
      subscriptionStatus: subscription.status,
      ...(subscriptionType ? { subscriptionType } : {})
    });

    if (productId) {
      const newRole = getRoleForProduct(productId);
      if (newRole) {
        await updateUserAndTeamMemberRole(existingTeam.id, newRole);
      }
    }
    return;
  }

  // If team is not yet linked (edge case), try to find via client_reference_id
  const userId = session.client_reference_id;
  if (!userId) {
    console.error('No client_reference_id in checkout session:', session.id);
    return;
  }

  const userTeam = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, Number(userId)))
    .limit(1);

  if (userTeam.length === 0) {
    console.error('No team found for user:', userId);
    return;
  }

  const teamId = userTeam[0].teamId;
  const subscriptionType = productId ? getSubscriptionTypeForProduct(productId) : null;

  await db
    .update(teams)
    .set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId,
      planName: productName,
      subscriptionStatus: subscription.status,
      ...(subscriptionType ? { subscriptionType } : {}),
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));

  if (productId) {
    const newRole = getRoleForProduct(productId);
    if (newRole) {
      await updateUserAndTeamMemberRole(teamId, newRole);
    }
  }
}
