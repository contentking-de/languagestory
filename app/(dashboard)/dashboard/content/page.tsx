import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import ClientContentOverview from './ClientContentOverview';

export default async function ContentOverviewPage() {
  const user = await getUserWithTeamData();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'super_admin') {
    redirect('/dashboard');
  }
  return <ClientContentOverview />;
}