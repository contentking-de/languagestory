import { checkoutAction } from '@/lib/payments/actions';
import { getStructuredPricingData } from '@/lib/payments/stripe';
import { getAccessInfoForCurrentUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { PricingTabs } from '../pricing/pricing-tabs';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600;

export default async function SubscribePage() {
  // Check if user already has active access
  const accessInfo = await getAccessInfoForCurrentUser();
  
  if (accessInfo && (accessInfo.status === 'active' || accessInfo.status === 'trial')) {
    redirect('/dashboard');
  }

  const pricing = await getStructuredPricingData();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Trial Expired Message */}
      <div className="mb-10 bg-orange-50 border border-orange-200 rounded-xl p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 rounded-full p-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Your Free Trial Has Ended
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-4">
          We hope you enjoyed exploring Lingoletics! To continue accessing all stories, games, quizzes, 
          and teaching resources, please choose a subscription plan below.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Go to Dashboard settings
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Access all short stories, games, quizzes, and teaching resources across French, German, and Spanish
        </p>
      </div>

      {/* Pricing Tabs (reuse existing component) */}
      <PricingTabs pricing={pricing} />
    </main>
  );
}
