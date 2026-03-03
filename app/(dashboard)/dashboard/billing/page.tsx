import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { BillingClient } from './components/BillingClient';

export default async function BillingPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role === 'student') {
    redirect('/dashboard');
  }

  return <BillingClient />;
}
