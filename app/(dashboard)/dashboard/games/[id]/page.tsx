import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { GameDetailClient } from './components/GameDetailClient';

export default async function GameDetailPage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <GameDetailClient userRole={user.role} />;
}