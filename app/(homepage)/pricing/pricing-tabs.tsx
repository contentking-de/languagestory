'use client';

import { useState } from 'react';
import { Check, GraduationCap, Users, User, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { checkoutAction } from '@/lib/payments/actions';
import { useFormStatus } from 'react-dom';
import type { StructuredPricingData, PricingPlan, BillingInterval } from '@/lib/payments/stripe';

type PlanTab = 'institutional' | 'individual';

function formatPrice(amountInCents: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

function intervalLabel(interval: BillingInterval): string {
  switch (interval) {
    case 'monthly': return 'Monthly';
    case 'quarterly': return 'Quarterly';
    case 'yearly': return 'Yearly';
  }
}

function intervalShort(interval: BillingInterval): string {
  switch (interval) {
    case 'monthly': return '/ month';
    case 'quarterly': return '/ 3 months';
    case 'yearly': return '/ year';
  }
}

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Loading...
        </>
      ) : (
        <>
          Start Free Trial
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

function CheckoutButtonOutline() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full border-2 border-orange-500 text-orange-600 font-bold py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Loading...
        </>
      ) : (
        <>
          Start Free Trial
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

function PlanCard({
  plan,
  features,
  highlighted,
  badge,
  icon,
  subtitle,
}: {
  plan: PricingPlan;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div
      className={`relative rounded-xl p-6 flex flex-col h-full transition-all ${
        highlighted
          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl scale-[1.02]'
          : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md'
      }`}
    >
      {badge && (
        <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold ${
          highlighted ? 'bg-yellow-400 text-orange-900' : 'bg-orange-500 text-white'
        }`}>
          {badge}
        </div>
      )}

      {icon && <div className="mb-3">{icon}</div>}

      {subtitle && (
        <p className={`text-sm mb-3 ${highlighted ? 'text-orange-100' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      )}

      <div className="mb-4">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
          {formatPrice(plan.unitAmount, plan.currency)}
        </span>
        <span className={`text-base ml-1 ${highlighted ? 'text-orange-100' : 'text-gray-500'}`}>
          {intervalShort(plan.billingInterval)}
        </span>
      </div>

      <ul className={`space-y-3 mb-6 flex-grow ${highlighted ? 'text-orange-50' : 'text-gray-600'}`}>
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              highlighted ? 'text-yellow-300' : 'text-orange-500'
            }`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={plan.priceId} />
        {highlighted ? (
          <button
            type="submit"
            className="w-full bg-white text-orange-600 font-bold py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <CheckoutButtonOutline />
        )}
      </form>
    </div>
  );
}

function IntervalSelector({
  selected,
  onChange,
  plans,
}: {
  selected: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  plans: PricingPlan[];
}) {
  const available = new Set(plans.map((p) => p.billingInterval));
  const intervals: BillingInterval[] = ['monthly', 'quarterly', 'yearly'];

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-100 p-1 rounded-lg inline-flex">
        {intervals.filter((i) => available.has(i)).map((interval) => (
          <button
            key={interval}
            onClick={() => onChange(interval)}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-colors ${
              selected === interval
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {intervalLabel(interval)}
            {interval === 'yearly' && (
              <span className="ml-1 text-xs text-orange-600 font-bold">SAVE</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PricingTabs({ pricing }: { pricing: StructuredPricingData }) {
  const [activeTab, setActiveTab] = useState<PlanTab>('individual');
  const [institutionalInterval, setInstitutionalInterval] = useState<BillingInterval>('yearly');
  const [individualInterval, setIndividualInterval] = useState<BillingInterval>('quarterly');

  const allInstitutional = [
    ...pricing.institutional.professional,
    ...pricing.institutional.small,
  ];

  const proPlan = pricing.institutional.professional.find(
    (p) => p.billingInterval === institutionalInterval
  );
  const smallPlan = pricing.institutional.small.find(
    (p) => p.billingInterval === institutionalInterval
  );
  const enduserPlan = pricing.enduser.find(
    (p) => p.billingInterval === individualInterval
  );

  return (
    <>
      {/* Tab Switch */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'individual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="h-4 w-4" />
            Individual
          </button>
          <button
            onClick={() => setActiveTab('institutional')}
            className={`px-6 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'institutional'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Schools &amp; Institutions
          </button>
        </div>
      </div>

      {/* Individual Plans */}
      {activeTab === 'individual' && (
        <div>
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Perfect for individual learners, parents, and families
            </p>
          </div>

          <IntervalSelector
            selected={individualInterval}
            onChange={setIndividualInterval}
            plans={pricing.enduser}
          />

          {enduserPlan && (
            <div className="max-w-md mx-auto">
              <PlanCard
                plan={enduserPlan}
                highlighted
                features={[
                  'Access to all short stories in French, German & Spanish',
                  'Interactive games, quizzes & vocabulary exercises',
                  'Audio narration for all stories',
                  'Track your learning progress',
                  'Cancel anytime',
                ]}
                icon={<User className="h-8 w-8 text-orange-100" />}
              />
            </div>
          )}

          {/* All intervals overview */}
          <div className="mt-10 max-w-2xl mx-auto">
            <p className="text-center text-sm text-gray-500 mb-4">Compare all billing options:</p>
            <div className="grid grid-cols-3 gap-4">
              {pricing.enduser.map((plan) => (
                <div
                  key={plan.productId}
                  className={`text-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    plan.billingInterval === individualInterval
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => setIndividualInterval(plan.billingInterval)}
                >
                  <p className="text-sm font-medium text-gray-900">{intervalLabel(plan.billingInterval)}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatPrice(plan.unitAmount, plan.currency)}
                  </p>
                  <p className="text-xs text-gray-500">{intervalShort(plan.billingInterval)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Institutional Plans */}
      {activeTab === 'institutional' && (
        <div>
          <div className="text-center mb-6">
            <p className="text-gray-600">
              For schools, language centres, and educational institutions
            </p>
          </div>

          <IntervalSelector
            selected={institutionalInterval}
            onChange={setInstitutionalInterval}
            plans={allInstitutional}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Small Plan */}
            {smallPlan && (
              <PlanCard
                plan={smallPlan}
                subtitle="Up to 4 classes and 120 seats"
                features={[
                  'Ideal for small schools & tutoring centres',
                  'All stories, games & teaching resources',
                  'Student login management',
                  'Progress tracking for all students',
                  'Email support',
                ]}
                icon={<Users className="h-8 w-8 text-orange-500" />}
                badge="SMALL"
              />
            )}

            {/* Professional Plan */}
            {proPlan && (
              <PlanCard
                plan={proPlan}
                highlighted
                badge="PROFESSIONAL"
                subtitle="More than 4 classes and up to 300 seats"
                features={[
                  'For larger schools & institutions',
                  'All stories, games & teaching resources',
                  'Unlimited student & staff logins',
                  'Advanced analytics & reporting',
                  'Class management tools',
                  'Priority support',
                ]}
                icon={<GraduationCap className="h-8 w-8 text-orange-100" />}
              />
            )}
          </div>

          {/* All intervals overview */}
          <div className="mt-10 max-w-4xl mx-auto">
            <p className="text-center text-sm text-gray-500 mb-4">Compare all billing options:</p>
            <div className="grid grid-cols-2 gap-6">
              {/* Small intervals */}
              <div>
                <p className="text-center text-sm font-semibold text-gray-700 mb-3">Small</p>
                <div className="grid grid-cols-3 gap-3">
                  {pricing.institutional.small.map((plan) => (
                    <div
                      key={plan.productId}
                      className={`text-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        plan.billingInterval === institutionalInterval
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => setInstitutionalInterval(plan.billingInterval)}
                    >
                      <p className="text-xs font-medium text-gray-900">{intervalLabel(plan.billingInterval)}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {formatPrice(plan.unitAmount, plan.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Professional intervals */}
              <div>
                <p className="text-center text-sm font-semibold text-gray-700 mb-3">Professional</p>
                <div className="grid grid-cols-3 gap-3">
                  {pricing.institutional.professional.map((plan) => (
                    <div
                      key={plan.productId}
                      className={`text-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        plan.billingInterval === institutionalInterval
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => setInstitutionalInterval(plan.billingInterval)}
                    >
                      <p className="text-xs font-medium text-gray-900">{intervalLabel(plan.billingInterval)}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {formatPrice(plan.unitAmount, plan.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Section */}
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500 mb-4">Trusted & Secure</p>
        <div className="flex justify-center items-center gap-6 text-gray-400">
          <span className="text-xs">🔒 SSL Encrypted</span>
          <span className="text-xs">💳 Powered by Stripe</span>
          <span className="text-xs">↩️ Cancel anytime</span>
          <span className="text-xs">🎁 14-day free trial</span>
        </div>
      </div>
    </>
  );
}
