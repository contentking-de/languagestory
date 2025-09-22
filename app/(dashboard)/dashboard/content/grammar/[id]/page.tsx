import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { GrammarDetailClient } from './components/GrammarDetailClient';

export default async function GrammarDetailPage() {
  const user = await getUserWithTeamData();
  if (!user) redirect('/sign-in');
  return <GrammarDetailClient userRole={user.role} />;
}
