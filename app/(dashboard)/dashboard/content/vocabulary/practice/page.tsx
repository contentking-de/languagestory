import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { PracticeClient } from './components/PracticeClient';

export default async function PracticePage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <PracticeClient />;
}
