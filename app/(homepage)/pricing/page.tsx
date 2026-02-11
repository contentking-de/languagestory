import { checkoutAction } from '@/lib/payments/actions';
import { Check, GraduationCap, Users, User } from 'lucide-react';
import { getStructuredPricingData, type PricingPlan, type BillingInterval } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import { PricingTabs } from './pricing-tabs';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const pricing = await getStructuredPricingData();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Choose Your Learning Plan
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Access all short stories, games, quizzes, and teaching resources across French, German, and Spanish
        </p>
        <p className="mt-2 text-sm text-orange-600 font-medium">
          All plans include a 14-day free trial
        </p>
      </div>

      {/* Tabs (Client Component) */}
      <PricingTabs pricing={pricing} />
    </main>
  );
}
