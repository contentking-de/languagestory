import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { GrammarEditClient } from './GrammarEditClient';

export default async function GrammarEditPage() {
  const user = await getUserWithTeamData();
  if (!user) redirect('/sign-in');

  if (user.role !== 'super_admin' && user.role !== 'content_creator') {
    redirect('/dashboard');
  }

  return <GrammarEditClient />;
}
