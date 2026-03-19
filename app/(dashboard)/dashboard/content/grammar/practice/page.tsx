import { getUserWithTeamData } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { GrammarPracticeClient } from './components/GrammarPracticeClient';

export default async function GrammarPracticePage() {
  const user = await getUserWithTeamData();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <GrammarPracticeClient />;
}
