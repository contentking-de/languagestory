import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { GamesClient } from './components/GamesClient';

export default async function GamesPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <GamesClient userRole={user.role} />;
} 