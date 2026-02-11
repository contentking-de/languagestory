import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription,
  updateUserAndTeamMemberRole
} from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

// ─── Stripe Product → Role & Subscription Type Mapping ───────────────────────

const INSTITUTIONAL_PRODUCT_IDS = [
  'prod_TxWhQkssesTDuf', // Institutional monthly - professional
  'prod_TxWhF5IleYIf7O', // Institutional quarterly - professional
  'prod_TxWgYv7ur5wF42', // Institutional yearly - professional
  'prod_TxWcn1yPXLjtK6', // Institutional monthly - small
  'prod_TxWeoqWtk0Xr0R', // Institutional quarterly - small
  'prod_TxWeZsdk1jIsjE', // Institutional yearly - small
] as const;

const ENDUSER_PRODUCT_IDS = [
  'prod_TxWYzVwAtVjzB2', // Enduser monthly
  'prod_TxWaxeUz3KR5n4', // Enduser quarterly
  'prod_TxWaA9DIapxBU5', // Enduser yearly
] as const;

export type PlanCategory = 'institutional' | 'enduser' | 'unknown';

export function getPlanCategory(productId: string): PlanCategory {
  if ((INSTITUTIONAL_PRODUCT_IDS as readonly string[]).includes(productId)) {
    return 'institutional';
  }
  if ((ENDUSER_PRODUCT_IDS as readonly string[]).includes(productId)) {
    return 'enduser';
  }
  return 'unknown';
}

export function getRoleForProduct(productId: string): 'institution_admin' | 'member' | null {
  const category = getPlanCategory(productId);
  switch (category) {
    case 'institutional':
      return 'institution_admin';
    case 'enduser':
      return 'member';
    default:
      return null;
  }
}

export function getSubscriptionTypeForProduct(productId: string): 'institution' | 'individual' | null {
  const category = getPlanCategory(productId);
  switch (category) {
    case 'institutional':
      return 'institution';
    case 'enduser':
      return 'individual';
    default:
      return null;
  }
}

export async function createCheckoutSession({
  team,
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    const productId = typeof plan?.product === 'string'
      ? plan.product
      : (plan?.product as Stripe.Product)?.id;
    const productName = typeof plan?.product === 'string'
      ? plan.product
      : (plan?.product as Stripe.Product)?.name;
    const subscriptionType = productId ? getSubscriptionTypeForProduct(productId) : null;

    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId || null,
      planName: productName || null,
      subscriptionStatus: status,
      ...(subscriptionType ? { subscriptionType } : {})
    });

    // Update user role based on the product
    if (productId) {
      const newRole = getRoleForProduct(productId);
      if (newRole) {
        await updateUserAndTeamMemberRole(team.id, newRole);
      }
    }
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status
    });

    // Reset role to 'student' (default) when subscription is canceled
    await updateUserAndTeamMemberRole(team.id, 'student');
  }
}

// ─── Invoice / Billing ────────────────────────────────────────────────────────

export interface InvoiceData {
  id: string;
  number: string | null;
  status: string | null;
  currency: string;
  amountDue: number;
  amountPaid: number;
  created: number; // unix timestamp
  periodStart: number;
  periodEnd: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  description: string | null;
  planName: string | null;
}

/**
 * Fetches all invoices for a Stripe customer, sorted newest-first.
 */
export async function getInvoicesForCustomer(
  stripeCustomerId: string,
  limit: number = 24
): Promise<InvoiceData[]> {
  const invoices = await stripe.invoices.list({
    customer: stripeCustomerId,
    limit,
    status: 'paid',
    expand: ['data.subscription'],
  });

  return invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    currency: inv.currency,
    amountDue: inv.amount_due,
    amountPaid: inv.amount_paid,
    created: inv.created,
    periodStart: inv.period_start,
    periodEnd: inv.period_end,
    hostedInvoiceUrl: inv.hosted_invoice_url,
    invoicePdf: inv.invoice_pdf,
    description: inv.description,
    planName: inv.lines.data[0]?.description || null,
  }));
}

/**
 * Fetches upcoming invoice (next billing) for a customer, if any.
 */
export async function getUpcomingInvoice(
  stripeCustomerId: string
): Promise<InvoiceData | null> {
  try {
    const inv = await stripe.invoices.retrieveUpcoming({
      customer: stripeCustomerId,
    });

    return {
      id: 'upcoming',
      number: null,
      status: 'upcoming',
      currency: inv.currency,
      amountDue: inv.amount_due,
      amountPaid: 0,
      created: inv.created,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      hostedInvoiceUrl: null,
      invoicePdf: null,
      description: null,
      planName: inv.lines.data[0]?.description || null,
    };
  } catch {
    // No upcoming invoice (e.g. no active subscription)
    return null;
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    intervalCount: price.recurring?.interval_count,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}

// ─── Structured Pricing Data for Pricing Page ────────────────────────────────

export type PlanTier = 'professional' | 'small' | 'enduser';
export type BillingInterval = 'monthly' | 'quarterly' | 'yearly';

export interface ProductPlanInfo {
  tier: PlanTier;
  billingInterval: BillingInterval;
}

/** Maps each Stripe product ID to its tier and billing interval */
const PRODUCT_PLAN_MAP: Record<string, ProductPlanInfo> = {
  // Institutional – Professional
  'prod_TxWhQkssesTDuf': { tier: 'professional', billingInterval: 'monthly' },
  'prod_TxWhF5IleYIf7O': { tier: 'professional', billingInterval: 'quarterly' },
  'prod_TxWgYv7ur5wF42': { tier: 'professional', billingInterval: 'yearly' },
  // Institutional – Small
  'prod_TxWcn1yPXLjtK6': { tier: 'small', billingInterval: 'monthly' },
  'prod_TxWeoqWtk0Xr0R': { tier: 'small', billingInterval: 'quarterly' },
  'prod_TxWeZsdk1jIsjE': { tier: 'small', billingInterval: 'yearly' },
  // Enduser
  'prod_TxWYzVwAtVjzB2': { tier: 'enduser', billingInterval: 'monthly' },
  'prod_TxWaxeUz3KR5n4': { tier: 'enduser', billingInterval: 'quarterly' },
  'prod_TxWaA9DIapxBU5': { tier: 'enduser', billingInterval: 'yearly' },
};

export function getProductPlanInfo(productId: string): ProductPlanInfo | null {
  return PRODUCT_PLAN_MAP[productId] || null;
}

export interface PricingPlan {
  productId: string;
  productName: string;
  priceId: string;
  unitAmount: number; // in cents
  currency: string;
  billingInterval: BillingInterval;
  trialPeriodDays: number | null | undefined;
}

export interface StructuredPricingData {
  institutional: {
    professional: PricingPlan[];
    small: PricingPlan[];
  };
  enduser: PricingPlan[];
}

/**
 * Fetches all active products & prices from Stripe and returns
 * them structured by category and tier, ready for the pricing page.
 */
export async function getStructuredPricingData(): Promise<StructuredPricingData> {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const productMap = new Map(products.map(p => [p.id, p]));
  const intervalOrder: Record<BillingInterval, number> = {
    monthly: 0,
    quarterly: 1,
    yearly: 2,
  };

  const result: StructuredPricingData = {
    institutional: { professional: [], small: [] },
    enduser: [],
  };

  for (const price of prices) {
    const planInfo = PRODUCT_PLAN_MAP[price.productId];
    if (!planInfo) continue; // Skip unknown products (e.g. old Base/Plus)

    const product = productMap.get(price.productId);
    if (!product) continue;

    const plan: PricingPlan = {
      productId: price.productId,
      productName: product.name,
      priceId: price.id,
      unitAmount: price.unitAmount || 0,
      currency: price.currency,
      billingInterval: planInfo.billingInterval,
      trialPeriodDays: price.trialPeriodDays,
    };

    switch (planInfo.tier) {
      case 'professional':
        result.institutional.professional.push(plan);
        break;
      case 'small':
        result.institutional.small.push(plan);
        break;
      case 'enduser':
        result.enduser.push(plan);
        break;
    }
  }

  // Sort each group by billing interval
  const sortFn = (a: PricingPlan, b: PricingPlan) =>
    intervalOrder[a.billingInterval] - intervalOrder[b.billingInterval];
  result.institutional.professional.sort(sortFn);
  result.institutional.small.sort(sortFn);
  result.enduser.sort(sortFn);

  return result;
}
