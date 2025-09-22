import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { GrammarClient } from './components/GrammarClient';

export default async function GrammarPage() {
  const user = await getUserWithTeamData();
  if (!user) redirect('/sign-in');
  return <GrammarClient userRole={user.role} />;
}

