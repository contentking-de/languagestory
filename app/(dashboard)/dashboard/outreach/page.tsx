import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { OutreachClient } from './components/OutreachClient';

export const metadata = {
  title: 'Outreach - Lingoletics.com',
  description: 'Manage outreach contacts and send emails',
};

export default async function OutreachPage() {
  const user = await getUserWithTeamData();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'super_admin') {
    redirect('/dashboard');
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Outreach</h1>
        <p className="text-gray-600 mt-1">
          Import contacts and send outreach emails
        </p>
      </div>
      <OutreachClient />
    </div>
  );
}
